// Módulo C: Monitoreo Semanal por Etapas (Versión 2.2 - Canasta Curricular, Normas INEE y Multirriesgo)
var ModuloC = {
  init: function() {
    this.renderMonitoreo();
  },

  getDidacticaStrategyForArea: function(areaKey, nnaCount) {
    try {
      var strategies = (typeof CURRICULUM_DB !== 'undefined' && CURRICULUM_DB && CURRICULUM_DB.situated_didactic_strategies) || {};
      var areaMap = {
        'lenguaje': 'LENGUAJE',
        'matematicas': 'MATEMATICAS',
        'sociales': 'CIENCIAS_SOCIALES',
        'naturales': 'CIENCIAS_NATURALES'
      };
      var stObj = strategies[areaMap[areaKey]] || {};
      var n = parseInt(nnaCount, 10) || 25;
      if (n < 15) return stObj.tier_small || 'Tutoría 1:1 y mediación personalizada';
      if (n <= 35) return stObj.tier_medium || 'Aprendizaje cooperativo en equipos';
      return stObj.tier_large || 'Micro-estaciones y rincones autónomos';
    } catch (e) {
      return 'Aprendizaje situado y cooperativo';
    }
  },

  getSelectedBasket: function(user, cicloData, habsList, supsList, d) {
    var userSelection = (user && user.seleccionCurricular) || {};
    var userStates = (user && user.estadosCurriculo) || {};
    var basket = {
      lenguaje: [],
      matematicas: [],
      sociales: [],
      naturales: [],
      socioemocional: [],
      supervivencia: []
    };

    var areas = ['lenguaje', 'matematicas', 'sociales', 'naturales', 'socioemocional', 'supervivencia'];

    areas.forEach(function(aKey) {
      var rawList = [];
      if (aKey === 'socioemocional') rawList = habsList || [];
      else if (aKey === 'supervivencia') rawList = supsList || [];
      else rawList = (cicloData && cicloData[aKey]) || [];

      var isAcademic = (aKey !== 'socioemocional' && aKey !== 'supervivencia');

      rawList.forEach(function(item, idx) {
        var parsed = (typeof ModuloB !== 'undefined' && ModuloB && typeof ModuloB.getItemFields === 'function') 
          ? ModuloB.getItemFields(item, aKey, idx, rawList.length)
          : { id: aKey + '_' + idx, dbaCode: 'DBA', dbaDesc: '', didactica: 'Taller situado' };

        if (parsed) {
          var state = (typeof ModuloB !== 'undefined' && ModuloB.getItemState) 
            ? ModuloB.getItemState(parsed, d, userStates) 
            : 'pendiente';
          var isSel = (typeof ModuloB !== 'undefined' && ModuloB.isItemSelectedForPlan)
            ? ModuloB.isItemSelectedForPlan(parsed, userSelection, state, isAcademic, d)
            : (userSelection[parsed.id] === true);

          if (isSel) {
            basket[aKey].push(parsed);
          }
        }
      });
    });

    var totalItemsInBasket = Object.keys(basket).reduce(function(acc, k) { return acc + basket[k].length; }, 0);

    // Salvaguarda: si por algún motivo extremo la canasta queda vacía, asegurar al menos 1 ítem nuclear por área
    if (totalItemsInBasket === 0) {

      var isEtapa1 = (d && d.etapa && d.etapa.indexOf('ETAPA 1') !== -1);
      
      // Socioemocional
      habsList.forEach(function(item, idx) {
        var parsed = ModuloB.getItemFields(item, 'socioemocional', idx, habsList.length);
        if (isEtapa1) {
          if (parsed.etapaSocio === 'Etapa 1' && basket.socioemocional.length < 3) basket.socioemocional.push(parsed);
        } else {
          if (basket.socioemocional.length < 2) basket.socioemocional.push(parsed);
        }
      });

      // Supervivencia (ERAE / WASH)
      supsList.forEach(function(item, idx) {
        var parsed = ModuloB.getItemFields(item, 'supervivencia', idx, supsList.length);
        if (basket.supervivencia.length < 2) basket.supervivencia.push(parsed);
      });

      // Áreas Académicas (filtrar solo las que no estén marcadas como abordadas previas a la fecha)
      ['lenguaje', 'matematicas', 'sociales', 'naturales'].forEach(function(aKey) {
        var rawList = (cicloData && cicloData[aKey]) || [];
        rawList.forEach(function(item, idx) {
          var parsed = ModuloB.getItemFields(item, aKey, idx, rawList.length);
          var isPrevio = (d && d.periodosPrevios && d.periodosPrevios.indexOf('Periodo ' + parsed.periodoNum) !== -1);
          if (!isPrevio && basket[aKey].length < 3) {
            basket[aKey].push(parsed);
          }
        });
        if (basket[aKey].length === 0 && rawList.length > 0) {
          basket[aKey].push(ModuloB.getItemFields(rawList[0], aKey, 0, rawList.length));
        }
      });
    }

    return basket;
  },

  renderMonitoreo: function() {
    try {
      var self = this;
      var container = document.getElementById('modulo-c-content');
      if (!container) return;

      var user = (typeof AuthManager !== 'undefined' && AuthManager && typeof AuthManager.getUserData === 'function') ? AuthManager.getUserData() : null;
      var d = (typeof ModuloA !== 'undefined' && ModuloA && typeof ModuloA.getLiveDiagnostic === 'function') ? ModuloA.getLiveDiagnostic() : (user ? user.diagnostico : null);
      if (!d) {
        d = {
          ciclo: '3',
          grado: 'Grado 6° (Bachillerato)',
          nna: 28,
          didacticaNNA: '👥 TRABAJO COOPERATIVO (15 a 35 NNA)',
          etapa: 'ETAPA 2: Recuperación temprana / Lúdica',
          bloom: 'Media / Intermedia (Bloom Nivel 3-4: Aplicar / Analizar)',
          amenazaPrincipal: 'Inundación',
          amenazasTop3: ['Inundación'],
          amenaza: 'Inundación',
          fechaInicio: new Date().toISOString().split('T')[0],
          fechaAtencion: new Date().toISOString().split('T')[0],
          periodoEnCurso: 'Periodo 1',
          periodosPrevios: []
        };
      }

      var cicloKey = String(d.ciclo || '3');
      var currDB = (typeof CURRICULUM_DB !== 'undefined' && CURRICULUM_DB) ? CURRICULUM_DB : {};
      var cicloData = currDB[cicloKey] || currDB['3'] || currDB['1'] || {};
      var savedMonitoreo = (user && user.monitoreo) || {};

      var habsList = ((HABS_SUPS_DB && HABS_SUPS_DB.habilidades) || []).filter(function(h) {
        return h && h.habilidad && h.habilidad.indexOf('Etapa de respuesta') === -1 && (!h.hacer || h.hacer.indexOf('=SUBTOTAL') === -1);
      });

      var supsList = ((HABS_SUPS_DB && HABS_SUPS_DB.supervivencia) || []).filter(function(s) {
        return s && s.tipo_afectacion && s.tipo_afectacion.indexOf('Tipologías') === -1 && (!s.aprendizaje || s.aprendizaje.indexOf('=SUBTOTAL') === -1);
      });

      var basket = self.getSelectedBasket(user, cicloData, habsList, supsList, d);

      var semanas = [];
      var fechaBaseStr = String(d.fechaAtencion || d.fechaInicio || '').trim();
      var fechaBase = null;
      if (fechaBaseStr) {
        var parts = fechaBaseStr.split(/[-/]/);
        if (parts.length === 3) {
          fechaBase = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }
      }
      if (!fechaBase || isNaN(fechaBase.getTime())) {
        fechaBase = new Date();
      }

      var isEtapa1 = (d.etapa && d.etapa.indexOf('ETAPA 1') !== -1);
      var academicAreas = ['lenguaje', 'matematicas', 'sociales', 'naturales'];

      var amenazasLabel = (d.amenazasTop3 && d.amenazasTop3.length > 0) ? d.amenazasTop3.join(' + ') : d.amenaza;

      // Parámetros de Jornada Escolar Regular según Decreto 0277 de 2025
      // Básica Primaria (Grados 1° a 5°, Ciclos 1 y 2): Mínimo 25 horas semanales (5 horas diarias) y 1.000 horas anuales.
      // Básica Secundaria y Media (Grados 6° a 11°, Ciclos 3, 4 y 5): Mínimo 30 horas semanales (6 horas diarias) y 1.200 horas anuales.
      var isPrimaria = (cicloKey === '1' || cicloKey === '2' || (d.grado && d.grado.indexOf('Primaria') !== -1));
      var decretoInfo = {
        nivel: isPrimaria ? 'Básica Primaria (Grados 1° a 5°)' : 'Básica Secundaria y Media (Grados 6° a 11°)',
        horasSemanales: isPrimaria ? 25 : 30,
        horasDiarias: isPrimaria ? 5 : 6,
        horasAnuales: isPrimaria ? 1000 : 1200
      };

      // Cálculo de Duración Promedio por Acción según Estrategia Didáctica Situada (Matrícula NNA y Tipo de Trabajo)
      var nnaCount = parseInt(d.nna, 10) || 25;
      var duracionAccionHrs = 10; // Valor base intermedio (horas efectivas de 60 min)
      var tipoEstrategiaLabel = '';

      if (nnaCount < 15) {
        // Tutoría 1:1 y nivelación personalizada: sesiones más intensivas y focalizadas (~6.25h en primaria, ~7.5h en secundaria)
        duracionAccionHrs = isPrimaria ? 6.25 : 7.5;
        tipoEstrategiaLabel = 'Tutoría 1:1 Focalizada';
      } else if (nnaCount <= 35) {
        // Aprendizaje Cooperativo en Equipos: proyectos articulados de mediana duración (~8.33h en primaria, ~10h en secundaria)
        duracionAccionHrs = isPrimaria ? 8.33 : 10;
        tipoEstrategiaLabel = 'Aprendizaje Cooperativo';
      } else {
        // Micro-estaciones Rotativas y Guías Modulares (>35 NNA): ciclos rotativos (~6.25h en primaria, ~7.5h en secundaria)
        duracionAccionHrs = isPrimaria ? 6.25 : 7.5;
        tipoEstrategiaLabel = 'Micro-Estaciones Rotativas';
      }

      // Capacidad de acciones pedagógicas simultáneas o sucesivas por semana según la intensidad reglamentaria
      var accionesPorSemana = Math.max(1, Math.round(decretoInfo.horasSemanales / duracionAccionHrs));
      var horasEfectivasPorAccion = (decretoInfo.horasSemanales / accionesPorSemana);

      // Conteo de semanas escolares colombianas según MEN (Decreto 0277 / Calendario Oficial de 40 semanas lectivas)
      // El calendario del MEN en Colombia comprende 40 semanas lectivas de trabajo académico con estudiantes:
      // Inicia el último lunes de enero (aprox. 26 de enero), pausa 2 semanas a mitad de año (vacaciones docentes/estudiantes semanas 24-25)
      // y concluye entre la primera y segunda semana de diciembre (aprox. 5 a 10 de diciembre).
      var dInicioEmergencia = fechaBase;
      var anoEmergencia = dInicioEmergencia.getFullYear() || 2026;
      var inicioAnoClases = new Date(anoEmergencia, 0, 26); // 26 de enero
      var finAnoClases = new Date(anoEmergencia, 11, 10); // 10 de diciembre
      var msTranscurridos = Math.max(0, dInicioEmergencia.getTime() - inicioAnoClases.getTime());
      var semanaEscolarActual = Math.max(1, Math.min(40, Math.ceil(msTranscurridos / (1000 * 60 * 60 * 24 * 7))));
      var totalSemanasCalendarioMEN = 40;
      var semanasRestantesCalendario = Math.max(1, totalSemanasCalendarioMEN - semanaEscolarActual);

      // Función auxiliar para calcular la fecha de cada semana lectiva MEN evitando semanas de vacaciones de fin de año
      function getFechaLectivaMEN(baseDate, offsetWeeks, schoolYearEnd) {
        var d = new Date(baseDate.getTime());
        d.setDate(baseDate.getDate() + (offsetWeeks * 7));
        
        // Si la fecha calculada supera el cierre lectivo de diciembre (aprox. 10 de diciembre),
        // se ajusta de acuerdo a los periodos oficiales del MEN para el cierre del calendario escolar
        if (d > schoolYearEnd) {
          // Mantener fecha proyectada lectiva dentro del tope de cierre lectivo oficial
          var clampedDate = new Date(schoolYearEnd.getTime());
          clampedDate.setDate(schoolYearEnd.getDate() - Math.max(0, (15 - offsetWeeks) * 3));
          return clampedDate;
        }
        return d;
      }

      // Generar 16 semanas articuladas con la canasta, el enfoque INEE y el Decreto 0277 de 2025
      for (var i = 1; i <= 16; i++) {
        var fechaSem = getFechaLectivaMEN(fechaBase, (i - 1), finAnoClases);
        var fechaFormatted = !isNaN(fechaSem.getTime()) ? fechaSem.toLocaleDateString('es-CO') : ('Semana ' + i);

        var focoSemana = '';
        var areaKey = '';
        var desgloseHorarioHTML = '';
        var accionesSemana = []; // Array estructurado de procesos/acciones para esta semana

        if (isEtapa1 && i <= 2) {
          // Semanas 1 y 2 de Etapa 1: Enfoque INEE en Contención Socioemocional y Supervivencia (ERAE/WASH)
          focoSemana = '🕊️ CONTENCIÓN PSICOSOCIAL & AUTOPROTECCIÓN (NORMAS INEE)';
          areaKey = 'SOCIOEMOCIONAL & VIDA';

          var socioItem = basket.socioemocional[(i - 1) % Math.max(1, basket.socioemocional.length)] || {
            dbaCode: 'SOCIOEMOCIONAL',
            dbaDesc: 'Autoconocimiento, regulación emocional y expresión de afecto seguro',
            didactica: 'Círculo de la palabra y acogida emocional'
          };

          var supItem = basket.supervivencia[(i - 1) % Math.max(1, basket.supervivencia.length)] || {
            dbaCode: 'ERAE / WASH',
            dbaDesc: 'Protocolos de autoprotección, lavado de manos e identificación de zonas seguras',
            didactica: 'Mapeo de riesgos en el aula y rutas seguras'
          };

          var hrsContencion = isPrimaria ? 15 : 18;
          var hrsProteccion = isPrimaria ? 10 : 12;

          accionesSemana.push({
            id: 'acc_1',
            tipo: 'socioemocional',
            etiqueta: '🌱 Acción A (Socioemocional)',
            codigo: socioItem.dbaCode || 'SOCIOEMOCIONAL',
            subproceso: 'Contención psicosocial y primeros auxilios emocionales',
            descripcion: socioItem.dbaDesc,
            horas: hrsContencion,
            didactica: socioItem.didactica || 'Círculo de la palabra y acogida emocional',
            bloom: 'Recordar y Comprender (Contención no amenazante)',
            borderCol: '#f59e0b',
            bgCol: '#fffbeb'
          });

          accionesSemana.push({
            id: 'acc_2',
            tipo: 'supervivencia',
            etiqueta: '🛡️ Acción B (ERAE / WASH)',
            codigo: supItem.dbaCode || 'ERAE / WASH',
            subproceso: 'Protocolos de autoprotección y rutas seguras en emergencia',
            descripcion: supItem.dbaDesc,
            horas: hrsProteccion,
            didactica: supItem.didactica || 'Mapeo de riesgos en el aula y rutas seguras',
            bloom: 'Identificar rutas seguras y autocuidado colectivo',
            borderCol: '#0284c7',
            bgCol: '#f0f9ff'
          });

          var badgeAccionesEtapa1 = 
            '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:8px;">' +
              '<span class="badge-pill" style="background:#fee2e2; color:#991b1b; font-weight:700; font-size:0.76rem;">' +
                '🎯 Capacidad Semanal: 2 Procesos de Choque (' + decretoInfo.horasSemanales + 'h/sem)' +
              '</span>' +
              '<span style="font-size:0.75rem; color:#7f1d1d; font-weight:600;">' +
                'Promedio: ~' + (decretoInfo.horasSemanales / 2).toFixed(1) + 'h efectivas / proceso' +
              '</span>' +
            '</div>';

          desgloseHorarioHTML = 
            '<div style="margin-top:8px; background:#fff1f2; border:1px solid #fecdd3; border-radius:6px; padding:6px 10px; font-size:0.78rem; color:#881337;">' +
              '⏱️ <strong>Distribución Horaria Decreto 0277/2025 (' + decretoInfo.horasSemanales + 'h efectivas/sem):</strong><br>' +
              '• <strong>Acción A (' + hrsContencion + 'h):</strong> Contención socioemocional, primeros auxilios psicológicos y círculo de la palabra.<br>' +
              '• <strong>Acción B (' + hrsProteccion + 'h):</strong> Taller vivencial de autoprotección comunitaria, mapeo de riesgos y protocolos ERAE/WASH.' +
            '</div>';

        } else {
          // Semanas académicas y proyectos integrados a partir de la canasta
          var acaIdx = isEtapa1 ? (i - 3) : (i - 1);
          areaKey = academicAreas[acaIdx % academicAreas.length];
          focoSemana = areaKey.toUpperCase();

          var areaBasket = basket[areaKey] || [];
          var primaryAction = null;
          var secondaryAction = null;

          if (areaBasket.length > 0) {
            primaryAction = areaBasket[Math.floor(acaIdx / academicAreas.length) % areaBasket.length];
            if (accionesPorSemana >= 2) {
              if (areaBasket.length > 1) {
                secondaryAction = areaBasket[(Math.floor(acaIdx / academicAreas.length) + 1) % areaBasket.length];
              } else if (basket.socioemocional.length > 0) {
                secondaryAction = basket.socioemocional[i % basket.socioemocional.length];
              } else if (basket.supervivencia.length > 0) {
                secondaryAction = basket.supervivencia[i % basket.supervivencia.length];
              }
            }
          } else {
            primaryAction = {
              dbaCode: 'DBA Adaptado',
              subproceso: 'Competencia priorizada en emergencia',
              dbaDesc: 'Aprendizaje esencial seleccionado en la canasta curricular',
              complejidad: 'Intermedia',
              bloom: 'Aplicar y contextualizar en el entorno',
              didactica: 'Taller situado y pedagógico de aula'
            };
          }

          var didacticaEstrategia = self.getDidacticaStrategyForArea(areaKey, d.nna);

          // Articulación relacional con Barreras para el Aprendizaje y la Participación (BAP)
          var barrerasAlertHTML = '';
          if (d.barreras) {
            var activeBAP = [];
            Object.keys(d.barreras).forEach(function(bId) {
              var lvl = d.barreras[bId];
              if (lvl === 'Media' || lvl === 'Alta') {
                activeBAP.push(bId + ' (' + lvl + ')');
              }
            });
            if (activeBAP.length > 0) {
              barrerasAlertHTML = '<span style="color:#c2410c; font-size:0.8rem; display:block; margin-top:3px;">🧩 <strong>Ajuste Razonable ante Barreras:</strong> Flexibilizar tiempos y diversificar formatos por ' + activeBAP.slice(0, 2).join(', ') + '.</span>';
            }
          }

          var hrsFocoArea = isPrimaria ? 15 : 18;
          var hrsTransversales = isPrimaria ? 10 : 12;

          accionesSemana.push({
            id: 'acc_1',
            tipo: 'academica_principal',
            etiqueta: '📘 Acción 1 (Principal)',
            codigo: primaryAction.dbaCode || 'DBA Principal',
            subproceso: primaryAction.subproceso || 'Aprendizaje esencial nuclear del área',
            descripcion: primaryAction.dbaDesc,
            horas: secondaryAction ? hrsFocoArea : decretoInfo.horasSemanales,
            didactica: (primaryAction.didactica || 'Taller situado') + ' | ' + didacticaEstrategia,
            bloom: primaryAction.bloom || 'Aplicar y analizar saberes en el contexto de emergencia',
            borderCol: '#3b82f6',
            bgCol: '#f8fafc'
          });

          if (secondaryAction && secondaryAction.dbaCode !== primaryAction.dbaCode) {
            var secEtiqueta = '➕ Acción 2 (Complementaria)';
            var secTipo = 'academica_complementaria';
            var secBorder = '#0d9488';
            var secBg = '#f0fdfa';

            if (secondaryAction.dbaCode.indexOf('SOCIO') !== -1) {
              secEtiqueta = '🌱 Acción 2 (Transversal Socioemocional)';
              secBorder = '#f59e0b';
              secBg = '#fffbeb';
            } else if (secondaryAction.dbaCode.indexOf('WASH') !== -1 || secondaryAction.dbaCode.indexOf('ERAE') !== -1) {
              secEtiqueta = '🛡️ Acción 2 (Transversal Autoprotección)';
              secBorder = '#0284c7';
              secBg = '#f0f9ff';
            }

            accionesSemana.push({
              id: 'acc_2',
              tipo: secTipo,
              etiqueta: secEtiqueta,
              codigo: secondaryAction.dbaCode || 'Acción Transversal',
              subproceso: secondaryAction.subproceso || 'Articulación pedagógica situada y refuerzo',
              descripcion: secondaryAction.dbaDesc,
              horas: hrsTransversales,
              didactica: secondaryAction.didactica || 'Aplicación situada, cooperativa y de nivelación',
              bloom: secondaryAction.bloom || 'Comprensión contextual y cuidado mutuo',
              borderCol: secBorder,
              bgCol: secBg
            });
          }

          var badgeCapacidadAcademica = 
            '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:8px;">' +
              '<span class="badge-pill" style="background:#ecfdf5; color:#065f46; font-weight:700; font-size:0.76rem; border:1px solid #a7f3d0;">' +
                '🎯 Capacidad Semanal: ' + accionesSemana.length + ' Proceso(s) (' + decretoInfo.horasSemanales + 'h/sem)' +
              '</span>' +
              '<span style="font-size:0.75rem; color:#047857; font-weight:600;">' +
                'Tiempo Promedio: ~' + horasEfectivasPorAccion.toFixed(1) + 'h efectivas / proceso (' + tipoEstrategiaLabel + ')' +
              '</span>' +
            '</div>';

          desgloseHorarioHTML = 
            '<div style="margin-top:8px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px 10px; font-size:0.78rem; color:#14532d;">' +
              '⏱️ <strong>Intensidad Decreto 0277/2025 (' + decretoInfo.horasSemanales + 'h efectivas/sem):</strong><br>' +
              '• <strong>Acción Principal (' + (secondaryAction ? hrsFocoArea : decretoInfo.horasSemanales) + 'h):</strong> Taller nuclear de profundización en ' + focoSemana + ' y desafío cognitivo.<br>' +
              (secondaryAction 
                ? ('• <strong>Acción Complementaria (' + hrsTransversales + 'h):</strong> Aplicación situada, trabajo colaborativo o articulación transversal para afianzar el aprendizaje.')
                : ('• <strong>Flexibilización y Refuerzo (' + hrsTransversales + 'h):</strong> Nivelación personalizada y adaptación curricular ante barreras activas.')) +
            '</div>';
        }

        var semSaved = savedMonitoreo[i] || {};
        var semSavedAcciones = semSaved.acciones || {};

        // Normalizar estado de avance por acción
        accionesSemana.forEach(function(acc) {
          var accSaved = semSavedAcciones[acc.id] || {};
          acc.avance = accSaved.avance || (semSaved.avance || '⚪ Sin iniciar');
          acc.observaciones = accSaved.observaciones || (semSaved.observaciones || '');
        });

        // Estado general de la semana (retrocompatibilidad)
        var semAvanceGeneral = semSaved.avance || '⚪ Sin iniciar';
        if (accionesSemana.length > 0) {
          var allLog = accionesSemana.every(function(a) { return a.avance && a.avance.indexOf('Logrado') !== -1; });
          var anyProc = accionesSemana.some(function(a) { return a.avance && (a.avance.indexOf('proceso') !== -1 || a.avance.indexOf('Logrado') !== -1); });
          if (allLog) semAvanceGeneral = '🟢 Logrado';
          else if (anyProc) semAvanceGeneral = '🟡 En proceso';
        }

        semanas.push({
          num: i,
          fecha: fechaFormatted,
          etapa: d.etapa || 'ETAPA 2: Recuperación temprana / Lúdica',
          foco: focoSemana,
          areaNombre: focoSemana,
          horasSemana: decretoInfo.horasSemanales,
          accionesCapacidad: accionesSemana.length,
          acciones: accionesSemana,
          duracionPromedioAccion: horasEfectivasPorAccion.toFixed(1),
          desgloseHorarioHTML: desgloseHorarioHTML,
          barrerasAlertHTML: barrerasAlertHTML || '',
          badgeCapacidad: (isEtapa1 && i <= 2) ? badgeAccionesEtapa1 : badgeCapacidadAcademica,
          avance: semAvanceGeneral,
          observaciones: semSaved.observaciones || ''
        });
      }

      // ==========================================
      // CÁLCULO DE KPIS Y PROCESOS PENDIENTES MEN
      // ==========================================
      var totalProcesosPlan = 0;
      var procesosLogrados = 0;
      var procesosEnProceso = 0;

      semanas.forEach(function(s) {
        s.acciones.forEach(function(acc) {
          totalProcesosPlan++;
          if (acc.avance && acc.avance.indexOf('Logrado') !== -1) {
            procesosLogrados++;
          } else if (acc.avance && acc.avance.indexOf('proceso') !== -1) {
            procesosEnProceso++;
          }
        });
      });

      var procesosPendientes = Math.max(0, totalProcesosPlan - procesosLogrados);
      var pctAvanceProcesos = totalProcesosPlan > 0 ? Math.round((procesosLogrados / totalProcesosPlan) * 100) : 0;
      var totalHorasPlan = semanas.length * decretoInfo.horasSemanales;
      var horasEjecutadas = Math.round((procesosLogrados / Math.max(1, totalProcesosPlan)) * totalHorasPlan);

      // =======================================================
      // MOTOR DE TRANSICIÓN DE ETAPAS (INEE / MEN & BLOOM)
      // =======================================================
      // Evalúa el avance curricular y las semanas para determinar el momento exacto
      // de pasar de Etapa 1 -> Etapa 2 -> Etapa 3 para cumplir con la malla curricular del MEN.
      var recomendacionTransicion = null;

      if (isEtapa1) {
        // En Etapa 1: Si las semanas 1 y 2 (o al menos 2 acciones de contención y supervivencia) están logradas
        var s1 = semanas[0] || { acciones: [] };
        var s2 = semanas[1] || { acciones: [] };
        var accionesChoqueLogradas = s1.acciones.concat(s2.acciones).filter(function(a) {
          return a.avance && a.avance.indexOf('Logrado') !== -1;
        }).length;

        var choqueCompleto = (accionesChoqueLogradas >= 3) || (s1.acciones.every(function(a){ return a.avance && a.avance.indexOf('Logrado') !== -1; }) && s1.acciones.length > 0);

        if (choqueCompleto || pctAvanceProcesos >= 20) {
          recomendacionTransicion = {
            etapaOrigen: d.etapa,
            etapaDestino: 'ETAPA 2: Recuperación temprana / Lúdica',
            nuevoBloom: 'Media / Intermedia (Bloom Nivel 3-4: Aplicar / Analizar)',
            motivo: 'Se han consolidado las acciones prioritarias de contención socioemocional y autoprotección ERAE/WASH (Normas INEE). Corresponde pasar a ETAPA 2 para reactivar los proyectos integrados, la nivelación en áreas nucleares y el trabajo lúdico cooperativo.',
            btnTexto: '🚀 Transicionar a ETAPA 2 (Recuperación Temprana)'
          };
        }
      } else if (d.etapa && d.etapa.indexOf('ETAPA 2') !== -1) {
        // En Etapa 2: Si se ha avanzado en al menos el 50% de los procesos o semanas >= 8
        if (pctAvanceProcesos >= 50 || procesosLogrados >= 10) {
          recomendacionTransicion = {
            etapaOrigen: d.etapa,
            etapaDestino: 'ETAPA 3: Educación formal adaptada / Retorno formal',
            nuevoBloom: 'Alta / Profundización (Bloom Nivel 5-6: Evaluar / Crear)',
            motivo: 'Se ha alcanzado un progreso superior al 50% en los aprendizajes esenciales de recuperación temprana. Según la malla curricular del MEN, corresponde avanzar a ETAPA 3 para restablecer la educación formal adaptada con estándares de alta complejidad evaluativa y creación autónoma.',
            btnTexto: '🎓 Promover a ETAPA 3 (Retorno Formal)'
          };
        }
      }

      var bannerTransicionHTML = '';
      if (recomendacionTransicion) {
        bannerTransicionHTML = 
          '<div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #3b82f6; border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);">' +
            '<div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">' +
              '<div style="flex:1; min-width:280px;">' +
                '<div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">' +
                  '<span style="font-size:1.25rem;">✨</span>' +
                  '<strong style="color:#1d4ed8; font-size:1rem;">Momento Óptimo de Transición Curricular MEN Identificado</strong>' +
                  '<span class="badge-pill" style="background:#2563eb; color:white; font-size:0.75rem; font-weight:700;">Hito de Flexibilización</span>' +
                '</div>' +
                '<p style="font-size:0.86rem; color:#1e3a8a; line-height:1.5; margin:0;">' +
                  recomendacionTransicion.motivo +
                '</p>' +
                '<div style="font-size:0.78rem; color:#3b82f6; margin-top:6px; font-weight:600;">' +
                  'Siguiente Etapa Sugerida: <strong>' + recomendacionTransicion.etapaDestino + '</strong> | Nuevo Nivel Bloom: <strong>' + recomendacionTransicion.nuevoBloom + '</strong>' +
                '</div>' +
              '</div>' +
              '<div style="align-self:center;">' +
                '<button id="btn-promover-etapa" class="btn-elite" style="background:#1d4ed8; color:white; font-weight:700; padding:10px 18px; border-radius:8px; box-shadow:0 2px 6px rgba(29, 78, 216, 0.3);">' +
                  recomendacionTransicion.btnTexto +
                '</button>' +
              '</div>' +
            '</div>' +
          '</div>';
      }

      var html = 
        '<div class="card-elite">' +
          '<div class="card-header">' +
            '<div>' +
              '<h3 class="card-title">📋 Monitoreo Semanal por Etapas (Ciclo ' + cicloKey + ')</h3>' +
              '<span style="font-size: 0.85rem; color: var(--text-muted);">' +
                'Gobernación de Norte de Santander | ' +
                'Docente: ' + ((user && user.nombreCompleto) || 'Docente Territorial') + ' | ' +
                'Amenazas: ' + amenazasLabel + ' | ' +
                'Reanudación: ' + (d.fechaAtencion || d.fechaInicio) +
              '</span>' +
            '</div>' +
            '<div style="display: flex; gap: 8px; flex-wrap: wrap;">' +
              '<button id="btn-guardar-monitoreo" class="btn-elite btn-primary">💾 Guardar Avance</button>' +
              '<button id="btn-exportar-excel" class="btn-elite btn-secondary">📊 Exportar a Excel (CSV)</button>' +
              '<button id="btn-exportar-json" class="btn-elite btn-outline">📥 Respaldo JSON</button>' +
              '<button id="btn-imprimir-carta" class="btn-elite btn-outline">🖨️ Imprimir Carta</button>' +
            '</div>' +
          '</div>' +

          (bannerTransicionHTML || '') +

          '<!-- Banner de Cumplimiento Decreto 0277 de 2025 e INEE -->' +
          '<div style="background: #f0fdf4; border-left: 5px solid #059669; padding: 14px 18px; border-radius: var(--radius-sm); margin-bottom: 18px; font-size: 0.88rem; line-height: 1.6;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:6px;">' +
              '<strong style="color:#065f46; font-size:0.95rem;">⚖️ Cumplimiento Normativo Decreto 0277 de 2025 (Jornada Escolar Regular)</strong>' +
              '<span class="badge-pill" style="background:#059669; color:#fff; font-size:0.8rem; font-weight:700;">' + decretoInfo.nivel + '</span>' +
            '</div>' +
            '<div>' +
              '<strong>Intensidad Reglamentaria:</strong> Mínimo <strong>' + decretoInfo.horasSemanales + ' horas efectivas de 60 minutos semanales</strong> (~' + decretoInfo.horasDiarias + ' horas diarias) | Meta anual de referencia: <strong>' + decretoInfo.horasAnuales.toLocaleString('es-CO') + ' horas</strong>.<br>' +
              '<strong>📐 Estimación de Capacidad Pedagógica por Semana:</strong> Para ' + d.nna + ' NNA (' + tipoEstrategiaLabel + '), la duración promedio calculada por acción pedagógica situada es de <strong>~' + horasEfectivasPorAccion.toFixed(1) + ' horas efectivas</strong>. Por tanto, cada semana integra <strong>' + (isEtapa1 ? '2 acciones de choque (Socioemocional + ERAE/WASH)' : (accionesPorSemana + ' acción(es) situada(s) con posibilidad de articular acciones complementarias)')) + '</strong>.<br>' +
              (isEtapa1 
                ? '<strong>⚠️ Etapa 1 Activa (Respuesta Inmediata / Contención):</strong> Las Semanas 1 y 2 canalizan las ' + decretoInfo.horasSemanales + ' horas en 2 acciones simultáneas: contención emocional (15h/18h) y autoprotección comunitaria ERAE/WASH (10h/12h).' 
                : '<strong>Plan Curricular Sincronizado:</strong> Las semanas distribuyen las ' + decretoInfo.horasSemanales + ' horas entre profundización de DBA esenciales nucleares, proyectos de aula y mitigación de barreras.') +
            '</div>' +
          '</div>' +

          '<div class="grid-4" style="margin-bottom: 24px;">' +
            '<div style="background: var(--surface-hover); padding: 14px; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border-light);">' +
              '<div style="font-size: 0.8rem; color: var(--text-muted);">Progreso de Procesos</div>' +
              '<div style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">' + pctAvanceProcesos + '%</div>' +
              '<div style="font-size: 0.72rem; color: #64748b; margin-top:2px;">' + procesosLogrados + ' de ' + totalProcesosPlan + ' procesos logrados</div>' +
            '</div>' +
            '<div style="background: #fff7ed; padding: 14px; border-radius: var(--radius-md); text-align: center; border: 1px solid #ffedd5;">' +
              '<div style="font-size: 0.8rem; color: #c2410c;">⏳ Procesos por Realizar</div>' +
              '<div style="font-size: 1.6rem; font-weight: 800; color: #ea580c;">' + procesosPendientes + ' pend.</div>' +
              '<div style="font-size: 0.72rem; color: #9a3412; margin-top:2px;">' + procesosEnProceso + ' en proceso de aula</div>' +
            '</div>' +
            '<div style="background: #eff6ff; padding: 14px; border-radius: var(--radius-md); text-align: center; border: 1px solid #dbeafe;">' +
              '<div style="font-size: 0.8rem; color: #1e40af;">📅 Semanas Calendario MEN</div>' +
              '<div style="font-size: 1.6rem; font-weight: 800; color: #2563eb;">' + semanasRestantesCalendario + ' sem.</div>' +
              '<div style="font-size: 0.72rem; color: #1d4ed8; margin-top:2px;">Semana lectiva ' + semanaEscolarActual + ' de ' + totalSemanasCalendarioMEN + ' anuales</div>' +
            '</div>' +
            '<div style="background: var(--color-blue-bg); padding: 14px; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border-light);">' +
              '<div style="font-size: 0.8rem; color: var(--color-blue);">Meta Semestral (16 sem)</div>' +
              '<div style="font-size: 1.6rem; font-weight: 800; color: var(--color-blue);">' + totalHorasPlan + ' h</div>' +
              '<div style="font-size: 0.72rem; color: #0369a1; margin-top:2px;">' + horasEjecutadas + 'h ejecutadas aprox.</div>' +
            '</div>' +
          '</div>' +

          '<div style="overflow-x: auto;">' +
            '<table class="table-print" style="width: 100%; border-collapse: separate; border-spacing: 0 10px; font-size: 0.88rem;">' +
              '<thead>' +
                '<tr style="background: var(--surface-hover); text-align: left;">' +
                  '<th style="padding: 10px; width: 85px;">Semana</th>' +
                  '<th style="padding: 10px; width: 105px;">Fecha Proy.</th>' +
                  '<th style="padding: 10px; width: 130px;">Enfoque / Área</th>' +
                  '<th style="padding: 10px;">Tarjeta de Acción Pedagógica Situada (Decreto 0277 de 2025)</th>' +
                  '<th style="padding: 10px; width: 180px;">Estado de Avance</th>' +
                  '<th style="padding: 10px; width: 240px;">Evidencias / Bitácora Docente</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                semanas.map(function(s) {
                  // Renderizar múltiples procesos divididos visualmente en cuadros claros y alineados
                  var tarjetasProcesosHTML = '';
                  var estadosProcesosHTML = '';
                  var bitacorasProcesosHTML = '';

                  s.acciones.forEach(function(acc, idx) {
                    var isMulti = (s.acciones.length > 1);
                    var cardMargin = (isMulti && idx > 0) ? 'margin-top:10px;' : '';
                    var cardMinHeight = isMulti ? 'min-height:120px;' : '';

                    tarjetasProcesosHTML += 
                      '<div style="background:' + acc.bgCol + '; border-left:4px solid ' + acc.borderCol + '; border-radius:6px; padding:10px 12px; ' + cardMargin + ' ' + cardMinHeight + ' box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                        '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:4px;">' +
                          '<span class="badge-pill" style="background:#ffffff; color:#0f172a; border:1px solid ' + acc.borderCol + '; font-weight:700; font-size:0.75rem;">' +
                            acc.etiqueta + ' (' + acc.horas + 'h)' +
                          '</span>' +
                          '<span style="font-size:0.72rem; color:#475569; font-weight:600;">' +
                            'Código: <strong>' + acc.codigo + '</strong>' +
                          '</span>' +
                        '</div>' +
                        '<div style="font-size:0.84rem; color:#0f172a; line-height:1.4; margin-bottom:4px;">' +
                          (acc.subproceso ? ('<strong style="color:#1e3a8a;">' + acc.subproceso + ':</strong> ') : '') + acc.descripcion +
                        '</div>' +
                        '<div style="font-size:0.78rem; color:#047857; margin-bottom:2px;">' +
                          '🛠️ <strong>Didáctica:</strong> ' + acc.didactica +
                        '</div>' +
                        '<div style="font-size:0.78rem; color:#6b21a8;">' +
                          '🎯 <strong>Desafío Bloom:</strong> ' + acc.bloom +
                        '</div>' +
                      '</div>';

                    estadosProcesosHTML += 
                      '<div style="background:' + acc.bgCol + '; border:1px solid ' + acc.borderCol + '; border-radius:6px; padding:8px 10px; ' + cardMargin + ' ' + cardMinHeight + ' display:flex; flex-direction:column; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                        '<div style="font-size:0.74rem; font-weight:700; color:#0f172a; margin-bottom:5px;">' +
                          acc.etiqueta +
                        '</div>' +
                        '<select class="select-elite select-avance-accion" data-semana="' + s.num + '" data-accion-id="' + acc.id + '" style="font-size: 0.82rem; padding: 5px 8px; width:100%; background:white; font-weight:600;">' +
                          '<option value="⚪ Sin iniciar" ' + (acc.avance === '⚪ Sin iniciar' ? 'selected' : '') + '>⚪ Sin iniciar</option>' +
                          '<option value="🟡 En proceso" ' + (acc.avance === '🟡 En proceso' ? 'selected' : '') + '>🟡 En proceso</option>' +
                          '<option value="🟢 Logrado" ' + (acc.avance === '🟢 Logrado' ? 'selected' : '') + '>🟢 Logrado</option>' +
                          '<option value="🔴 Postergado" ' + (acc.avance === '🔴 Postergado' ? 'selected' : '') + '>🔴 Postergado</option>' +
                        '</select>' +
                      '</div>';

                    bitacorasProcesosHTML += 
                      '<div style="background:' + acc.bgCol + '; border:1px solid ' + acc.borderCol + '; border-radius:6px; padding:8px 10px; ' + cardMargin + ' ' + cardMinHeight + ' display:flex; flex-direction:column; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                        '<div style="font-size:0.72rem; color:#475569; font-weight:700; margin-bottom:4px;">' +
                          'Bitácora ' + acc.etiqueta + ' (' + acc.horas + 'h):' +
                        '</div>' +
                        '<textarea class="textarea-elite input-observaciones-accion" data-semana="' + s.num + '" data-accion-id="' + acc.id + '" rows="2" placeholder="Registro de evidencias y acuerdos para ' + acc.codigo + '..." style="font-size: 0.8rem; width:100%; background:white;">' + (acc.observaciones || '') + '</textarea>' +
                      '</div>';
                  });

                  var tarjetaCompletaHTML = 
                    '<div>' +
                      s.badgeCapacidad +
                      '<div style="margin-bottom:6px; font-size:0.83rem;">' +
                        '<strong>🎓 ' + (d.grado || ('Ciclo ' + cicloKey)) + ' | ' + (d.didacticaNNA || 'TRABAJO COOPERATIVO') + '</strong><br>' +
                        '<span style="color:#b91c1c;">⚠️ Multirriesgo [' + amenazasLabel + ']:</span> ' + (d.riesgosIE || 'Protección de la comunidad educativa') +
                        s.barrerasAlertHTML +
                      '</div>' +
                      tarjetasProcesosHTML +
                      s.desgloseHorarioHTML +
                    '</div>';

                  return '<tr style="border-bottom: 2px solid var(--border-light); background:#ffffff;">' +
                    '<td style="padding: 12px 10px; font-weight: 700; color: var(--primary); vertical-align: top;">' +
                      'Semana ' + s.num + '<br>' +
                      '<span style="font-size:0.75rem; color:#0369a1; font-weight:600;">' + s.horasSemana + 'h/sem</span><br>' +
                      '<span class="badge-pill" style="font-size:0.68rem; background:#f1f5f9; color:#475569; margin-top:4px;">' + s.acciones.length + ' proceso(s)</span>' +
                    '</td>' +
                    '<td style="padding: 12px 10px; font-size: 0.82rem; color: var(--text-muted); vertical-align: top; font-weight:600;">' + s.fecha + '</td>' +
                    '<td style="padding: 12px 10px; vertical-align: top;"><span class="badge-pill" style="background:#e2e8f0; color:#1e293b; font-size:0.75rem;">' + s.foco + '</span></td>' +
                    '<td style="padding: 12px 10px; vertical-align: top;">' + tarjetaCompletaHTML + '</td>' +
                    '<td style="padding: 12px 10px; vertical-align: top;">' + estadosProcesosHTML + '</td>' +
                    '<td style="padding: 12px 10px; vertical-align: top;">' + bitacorasProcesosHTML + '</td>' +
                  '</tr>';
                }).join('') +
              '</tbody>' +
            '</table>' +
          '</div>' +

          '<!-- Encabezado y Bloque de Firmas para Impresión Oficial SIEE -->' +
          '<div class="print-signatures-block only-print" style="margin-top: 36px; padding-top: 24px; border-top: 2px solid #0f172a;">' +
            '<div style="text-align: center; margin-bottom: 24px;">' +
              '<h4 style="margin: 0; color: #005A36;">SECRETARÍA DE EDUCACIÓN DEPARTAMENTAL DE NORTE DE SANTANDER</h4>' +
              '<p style="font-size: 0.8rem; color: #475569; margin-top: 4px;">Constancia Oficial de Flexibilización y Monitoreo Curricular en Situaciones de Emergencia (SIEE / MEN)</p>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-around; text-align: center; margin-top: 50px;">' +
              '<div style="width: 250px; border-top: 1.5px solid #000; padding-top: 6px;">' +
                '<strong>' + ((user && user.nombreCompleto) || 'Docente Responsable') + '</strong><br>' +
                '<span style="font-size: 0.78rem;">Docente de Aula / Sede Educativa</span>' +
              '</div>' +
              '<div style="width: 250px; border-top: 1.5px solid #000; padding-top: 6px;">' +
                '<strong>Coordinación / Rectoría</strong><br>' +
                '<span style="font-size: 0.78rem;">' + ((user && user.institucion) || 'Institución Educativa') + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

        '</div>';

      container.innerHTML = html;

      // Evento Transición de Etapa Curricular
      var btnPromover = document.getElementById('btn-promover-etapa');
      if (btnPromover && recomendacionTransicion) {
        btnPromover.addEventListener('click', function(e) {
          e.preventDefault();
          var conf = confirm('¿Desea promover oficialmente el plan curricular a "' + recomendacionTransicion.etapaDestino + '"?\n\nEsta acción ajustará automáticamente el desafío cognitivo Bloom a "' + recomendacionTransicion.nuevoBloom + '" y reconfigurará las mallas de los Módulos A, B y C.');
          if (!conf) return;

          var u = AuthManager.getUserData() || {};
          u.diagnostico = u.diagnostico || {};
          u.diagnostico.etapa = recomendacionTransicion.etapaDestino;
          u.diagnostico.bloom = recomendacionTransicion.nuevoBloom;
          u.diagnostico.updatedAt = new Date().toISOString();
          AuthManager.saveUserData('diagnostico', u.diagnostico);

          // Actualizar interfaz del Módulo A si los elementos existen
          var selEtapa = document.getElementById('select-etapa');
          var selBloom = document.getElementById('select-bloom-ajustable');
          var inputBloomHidden = document.getElementById('input-bloom');
          if (selEtapa) selEtapa.value = recomendacionTransicion.etapaDestino;
          if (selBloom) selBloom.value = recomendacionTransicion.nuevoBloom;
          if (inputBloomHidden) inputBloomHidden.value = recomendacionTransicion.nuevoBloom;

          if (typeof ModuloA !== 'undefined' && ModuloA && typeof ModuloA.renderDiagnosticSummary === 'function') {
            ModuloA.renderDiagnosticSummary(u.diagnostico);
          }
          if (typeof ModuloB !== 'undefined' && ModuloB && typeof ModuloB.renderRayuela === 'function') {
            ModuloB.renderRayuela();
          }

          self.renderMonitoreo();
          alert('🎉 ¡Transición Curricular Exitosa!\nEl plan ha avanzado a: ' + recomendacionTransicion.etapaDestino + ' con nivel Bloom ' + recomendacionTransicion.nuevoBloom + '.');
        });
      }

      // Evento Guardar Avance con Multi-Acción / Procesos Múltiples por Semana
      var btnGuardar = document.getElementById('btn-guardar-monitoreo');
      if (btnGuardar) {
        btnGuardar.addEventListener('click', function(e) {
          e.preventDefault();
          var u = AuthManager.getUserData() || {};
          u.monitoreo = u.monitoreo || {};

          semanas.forEach(function(s) {
            var semNum = String(s.num);
            var accionesObj = {};
            var semLogrados = 0;
            var semEnProceso = 0;
            var combinedObs = [];

            s.acciones.forEach(function(acc) {
              var sel = container.querySelector('.select-avance-accion[data-semana="' + semNum + '"][data-accion-id="' + acc.id + '"]');
              var txt = container.querySelector('.input-observaciones-accion[data-semana="' + semNum + '"][data-accion-id="' + acc.id + '"]');
              var avVal = sel ? sel.value : acc.avance;
              var obsVal = txt ? txt.value : acc.observaciones;

              accionesObj[acc.id] = {
                id: acc.id,
                etiqueta: acc.etiqueta,
                codigo: acc.codigo,
                horas: acc.horas,
                avance: avVal,
                observaciones: obsVal
              };

              if (avVal.indexOf('Logrado') !== -1) semLogrados++;
              else if (avVal.indexOf('proceso') !== -1) semEnProceso++;

              if (obsVal && obsVal.trim()) {
                combinedObs.push('[' + acc.etiqueta + ']: ' + obsVal.trim());
              }
            });

            // Determinar estado agregado de la semana
            var estadoSemana = '⚪ Sin iniciar';
            if (s.acciones.length > 0 && semLogrados === s.acciones.length) {
              estadoSemana = '🟢 Logrado';
            } else if (semLogrados > 0 || semEnProceso > 0) {
              estadoSemana = '🟡 En proceso';
            }

            u.monitoreo[semNum] = {
              avance: estadoSemana,
              observaciones: combinedObs.join(' | '),
              acciones: accionesObj,
              updatedAt: new Date().toISOString()
            };
          });

          AuthManager.saveUserData('monitoreo', u.monitoreo);
          self.renderMonitoreo();
          alert('✅ Monitoreo Semanal guardado exitosamente.\nSe registraron los estados individuales de cada proceso pedagógico y se actualizaron los indicadores de avance.');
        });
      }

      // Evento Exportar a Excel (CSV con desglose de procesos individuales)
      var btnExcel = document.getElementById('btn-exportar-excel');
      if (btnExcel) {
        btnExcel.addEventListener('click', function() {
          var csvRows = [];
          csvRows.push([
            'Semana',
            'Fecha Proyectada',
            'Horas Semanales (Dec. 0277/2025)',
            'Proceso / Acción ID',
            'Etiqueta Proceso',
            'Código DBA / EBC / INEE',
            'Horas Proceso',
            'Etapa Curricular',
            'Foco Pedagógico',
            'Multirriesgo Top 3',
            'Estado de Avance Proceso',
            'Evidencias y Bitácora Docente'
          ]);

          semanas.forEach(function(s) {
            s.acciones.forEach(function(acc) {
              var sel = container.querySelector('.select-avance-accion[data-semana="' + s.num + '"][data-accion-id="' + acc.id + '"]');
              var txt = container.querySelector('.input-observaciones-accion[data-semana="' + s.num + '"][data-accion-id="' + acc.id + '"]');
              var avVal = sel ? sel.value : acc.avance;
              var obsVal = (txt ? txt.value : acc.observaciones).replace(/;/g, ',').replace(/\n/g, ' ');

              csvRows.push([
                'Semana ' + s.num,
                s.fecha,
                s.horasSemana + ' horas efectivas',
                acc.id,
                acc.etiqueta,
                acc.codigo,
                acc.horas + 'h',
                s.etapa,
                s.foco,
                amenazasLabel,
                avVal,
                obsVal
              ]);
            });
          });

          var csvContent = '\uFEFF' + csvRows.map(function(e) { return e.join(';'); }).join('\n');
          var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'monitoreo_semanal_procesos_ciclo_' + cicloKey + '_emergencia_' + new Date().toISOString().split('T')[0] + '.csv';
          a.click();
          URL.revokeObjectURL(url);
        });
      }

      // Evento Exportar JSON Respaldo
      var btnJSON = document.getElementById('btn-exportar-json');
      if (btnJSON) {
        btnJSON.addEventListener('click', function() {
          var u = AuthManager.getUserData();
          var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(u, null, 2));
          var a = document.createElement('a');
          a.href = dataStr;
          a.download = 'respaldo_plan_curricular_nrc_' + new Date().toISOString().split('T')[0] + '.json';
          a.click();
        });
      }

      // Evento Imprimir Carta
      var btnPrint = document.getElementById('btn-imprimir-carta');
      if (btnPrint) {
        btnPrint.addEventListener('click', function() {
          window.print();
        });
      }

    } catch (e) {
      console.error('Error rendering Monitoreo Semanal:', e);
    }
  }
};
