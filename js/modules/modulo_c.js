// Módulo C: Monitoreo Semanal, Avance Pedagógico y Trazabilidad SIEE
// (Versión 2.5 - Multiciclo/Multigrado, Decreto 0277 de 2025, Blindaje INEE, Fechas Duales y Coherencia Multi-Diagnóstico)
var ModuloC = {
  init: function() {
    this.renderMonitoreo();
  },

  getDidacticaStrategyForArea: function(areaKey, nnaCount) {
    var n = parseInt(nnaCount, 10) || 25;
    if (n < 15) {
      return {
        tipo: 'TUTORÍA 1:1 FOCALIZADA',
        desc: 'Nivelación personalizada con guías modulares adaptadas y acompañamiento directo docente-estudiante.'
      };
    } else if (n <= 35) {
      return {
        tipo: 'TRABAJO COOPERATIVO EN EQUIPOS',
        desc: 'Proyectos integrados de aprendizaje, rincones temáticos y resolución de retos pedagógicos situados.'
      };
    } else {
      return {
        tipo: 'MICRO-ESTACIONES ROTATIVAS',
        desc: 'Circuitos de aprendizaje por rincones con guías de autoaprendizaje y roles colaborativos rotativos.'
      };
    }
  },

  getSelectedBasket: function(user, activeCycles, habsList, supsList, d) {
    var basket = {
      lenguaje: [],
      matematicas: [],
      sociales: [],
      naturales: [],
      socioemocional: [],
      supervivencia: []
    };

    var userStates = (user && user.estadosCurriculo) || {};
    var userSelection = (user && user.seleccionCurricular) || {};

    var allAreas = ['lenguaje', 'matematicas', 'sociales', 'naturales', 'socioemocional', 'supervivencia'];
    allAreas.forEach(function(aKey) {
      var allItems = (typeof ModuloB !== 'undefined' && ModuloB.getItemsForArea)
        ? ModuloB.getItemsForArea(aKey, activeCycles, habsList, supsList)
        : [];

      var isAcademic = (aKey !== 'socioemocional' && aKey !== 'supervivencia');
      allItems.forEach(function(parsed) {
        var state = (typeof ModuloB !== 'undefined' && ModuloB.getItemState) 
          ? ModuloB.getItemState(parsed, d, userStates) 
          : 'pendiente';
        var isSel = (typeof ModuloB !== 'undefined' && ModuloB.isItemSelectedForPlan)
          ? ModuloB.isItemSelectedForPlan(parsed, userSelection, state, isAcademic, d)
          : (userSelection[parsed.id] === true);

        if (isSel) {
          basket[aKey].push(parsed);
        }
      });
    });

    var totalItemsInBasket = Object.keys(basket).reduce(function(acc, k) { return acc + basket[k].length; }, 0);

    // Salvaguarda: si la canasta está vacía, seleccionar los primeros items esenciales
    if (totalItemsInBasket === 0) {
      var isEtapa1 = (d && d.etapa && d.etapa.indexOf('ETAPA 1') !== -1);

      // Socioemocional
      (habsList || []).forEach(function(item, idx) {
        var parsed = (typeof ModuloB !== 'undefined' && ModuloB.getItemFields)
          ? ModuloB.getItemFields(item, 'socioemocional', idx, habsList.length, { key: 'transversal', roman: 'T' })
          : { id: 'socioemocional_' + idx, dbaCode: 'SOCIOEMOCIONAL', dbaDesc: item.hacer || '' };
        if (parsed) {
          if (isEtapa1) {
            if (parsed.etapaSocio === 'Etapa 1' && basket.socioemocional.length < 3) basket.socioemocional.push(parsed);
          } else {
            if (basket.socioemocional.length < 2) basket.socioemocional.push(parsed);
          }
        }
      });

      // Supervivencia (ERAE / WASH)
      (supsList || []).forEach(function(item, idx) {
        var parsed = (typeof ModuloB !== 'undefined' && ModuloB.getItemFields)
          ? ModuloB.getItemFields(item, 'supervivencia', idx, supsList.length, { key: 'transversal', roman: 'T' })
          : { id: 'supervivencia_' + idx, dbaCode: 'ERAE / WASH', dbaDesc: item.aprendizaje || '' };
        if (parsed && basket.supervivencia.length < 2) basket.supervivencia.push(parsed);
      });

      // Áreas Académicas
      ['lenguaje', 'matematicas', 'sociales', 'naturales'].forEach(function(aKey) {
        var allItems = (typeof ModuloB !== 'undefined' && ModuloB.getItemsForArea)
          ? ModuloB.getItemsForArea(aKey, activeCycles, habsList, supsList)
          : [];
        allItems.forEach(function(parsed) {
          var isPrevio = (d && d.periodosPrevios && d.periodosPrevios.indexOf('Periodo ' + parsed.periodoNum) !== -1);
          if (!isPrevio && basket[aKey].length < 3) {
            basket[aKey].push(parsed);
          }
        });
        if (basket[aKey].length === 0 && allItems.length > 0) {
          basket[aKey].push(allItems[0]);
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
          ciclos: ['3'],
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

      var activeCycles = (d && d.ciclos && d.ciclos.length > 0) ? d.ciclos : [(d && d.ciclo) || '3'];
      var isMultigrado = (activeCycles.length > 1);

      // Monitoreo guardado según diagnóstico activo
      var activeDiagId = user && user.activeDiagnosticId;
      var savedMonitoreo = (user && user.monitoreo) || {};
      if (user && user.diagnosticos && activeDiagId && user.diagnosticos[activeDiagId] && user.diagnosticos[activeDiagId].monitoreo) {
        savedMonitoreo = user.diagnosticos[activeDiagId].monitoreo;
      }

      var habsList = ((HABS_SUPS_DB && HABS_SUPS_DB.habilidades) || []).filter(function(h) {
        return h && h.habilidad && h.habilidad.indexOf('Etapa de respuesta') === -1 && (!h.hacer || h.hacer.indexOf('=SUBTOTAL') === -1);
      });

      var supsList = ((HABS_SUPS_DB && HABS_SUPS_DB.supervivencia) || []).filter(function(s) {
        return s && s.tipo_afectacion && s.tipo_afectacion.indexOf('Tipologías') === -1 && (!s.aprendizaje || s.aprendizaje.indexOf('=SUBTOTAL') === -1);
      });

      var basket = self.getSelectedBasket(user, activeCycles, habsList, supsList, d);

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
      var isAllPrimaria = activeCycles.every(function(c) { return c === '1' || c === '2'; });
      var isPrimaria = isAllPrimaria || (activeCycles.length === 1 && (activeCycles[0] === '1' || activeCycles[0] === '2'));

      var decretoInfo = {
        nivel: isPrimaria 
          ? 'Básica Primaria (Grados 1° a 5°)' 
          : (isMultigrado ? 'Aula Multigrado Integrada (Básica Primaria y Secundaria)' : 'Básica Secundaria y Media (Grados 6° a 11°)'),
        horasSemanales: isPrimaria ? 25 : 30,
        horasDiarias: isPrimaria ? 5 : 6,
        horasAnuales: isPrimaria ? 1000 : 1200
      };

      // Cálculo de Duración Promedio por Acción según Estrategia Didáctica Situada
      var nnaCount = parseInt(d.nna, 10) || 25;
      var duracionAccionHrs = 10;
      var tipoEstrategiaLabel = '';

      if (nnaCount < 15) {
        duracionAccionHrs = isPrimaria ? 6.25 : 7.5;
        tipoEstrategiaLabel = isMultigrado ? 'Tutoría 1:1 Inter-Edad' : 'Tutoría 1:1 Focalizada';
      } else if (nnaCount <= 35) {
        duracionAccionHrs = isPrimaria ? 8.33 : 10;
        tipoEstrategiaLabel = isMultigrado ? 'Trabajo Cooperativo y Rincones Multigrado' : 'Aprendizaje Cooperativo';
      } else {
        duracionAccionHrs = isPrimaria ? 6.25 : 7.5;
        tipoEstrategiaLabel = isMultigrado ? 'Micro-Estaciones Multinivel' : 'Micro-Estaciones Rotativas';
      }

      var accionesPorSemana = Math.max(1, Math.round(decretoInfo.horasSemanales / duracionAccionHrs));
      var horasEfectivasPorAccion = (decretoInfo.horasSemanales / accionesPorSemana);

      // Conteo de semanas escolares según calendario oficial MEN
      var dInicioEmergencia = fechaBase;
      var anoEmergencia = dInicioEmergencia.getFullYear() || 2026;
      var finAnoClases = new Date(anoEmergencia, 11, 10); // 10 de diciembre

      function getFechaLectivaMEN(baseDate, offsetWeeks, schoolYearEnd) {
        var dateObj = new Date(baseDate.getTime());
        dateObj.setDate(baseDate.getDate() + (offsetWeeks * 7));
        if (dateObj > schoolYearEnd) {
          var clampedDate = new Date(schoolYearEnd.getTime());
          clampedDate.setDate(schoolYearEnd.getDate() - Math.max(0, (15 - offsetWeeks) * 3));
          return clampedDate;
        }
        return dateObj;
      }

      // Generar 16 semanas articuladas con la canasta, el enfoque INEE y el Decreto 0277 de 2025
      for (var i = 1; i <= 16; i++) {
        var fechaSem = getFechaLectivaMEN(fechaBase, (i - 1), finAnoClases);
        var fechaFormatted = !isNaN(fechaSem.getTime()) ? fechaSem.toLocaleDateString('es-CO') : ('Semana ' + i);

        var focoSemana = '';
        var areaKey = '';
        var desgloseHorarioHTML = '';
        var accionesSemana = [];

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
              didactica: 'Taller situado y pedagógico de aula',
              cycleBadge: isMultigrado ? ('Ciclo ' + activeCycles[0]) : ''
            };
          }

          var didacticaEstrategia = self.getDidacticaStrategyForArea(areaKey, d.nna);

          // Articulación relacional con Barreras BAP
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
              barrerasAlertHTML = 
                '<div style="font-size:0.75rem; color:#9a3412; background:#ffedd5; padding:3px 6px; border-radius:4px; margin-top:4px;">' +
                  '🧩 <strong>Ajuste por Barreras Activas:</strong> ' + activeBAP.slice(0, 2).join(' | ') +
                '</div>';
            }
          }

          var hrsAccion1 = (accionesPorSemana === 1) ? decretoInfo.horasSemanales : Math.round(horasEfectivasPorAccion);
          var hrsAccion2 = decretoInfo.horasSemanales - hrsAccion1;

          var cicloTag1 = (primaryAction && primaryAction.cycleBadge) ? (' [' + primaryAction.cycleBadge + ']') : '';
          accionesSemana.push({
            id: 'acc_1',
            tipo: 'disciplinar',
            etiqueta: '📘 Proceso 1 (' + areaKey.charAt(0).toUpperCase() + areaKey.slice(1) + ')' + cicloTag1,
            codigo: primaryAction.dbaCode || 'DBA OFICIAL',
            subproceso: primaryAction.subproceso || 'Eje articulador',
            descripcion: primaryAction.dbaDesc || primaryAction.enunciado || 'Aprendizaje esencial priorizado',
            horas: hrsAccion1,
            didactica: primaryAction.didactica || didacticaEstrategia.desc,
            bloom: primaryAction.bloom || (d.bloom ? d.bloom.split('(')[0] : 'Aplicar y analizar'),
            borderCol: '#3b82f6',
            bgCol: '#f8fafc'
          });

          if (accionesPorSemana >= 2 && secondaryAction) {
            var isSecTransversal = (secondaryAction.dbaCode === 'SOCIOEMOCIONAL' || secondaryAction.dbaCode === 'ERAE / WASH' || secondaryAction.dbaCode === 'SUPERVIVENCIA');
            var cicloTag2 = (secondaryAction.cycleBadge) ? (' [' + secondaryAction.cycleBadge + ']') : '';
            accionesSemana.push({
              id: 'acc_2',
              tipo: isSecTransversal ? 'transversal' : 'disciplinar',
              etiqueta: isSecTransversal ? ('🌱 Proceso 2 (' + secondaryAction.dbaCode + ')') : ('📙 Proceso 2 (' + areaKey.charAt(0).toUpperCase() + areaKey.slice(1) + ')' + cicloTag2),
              codigo: secondaryAction.dbaCode || 'DBA ARTICULADO',
              subproceso: secondaryAction.subproceso || 'Refuerzo y aplicación',
              descripcion: secondaryAction.dbaDesc || secondaryAction.enunciado || 'Proceso complementario en el aula',
              horas: hrsAccion2,
              didactica: secondaryAction.didactica || 'Taller situado y resolución colaborativa',
              bloom: secondaryAction.bloom || 'Aplicar y contextualizar en el entorno',
              borderCol: isSecTransversal ? '#10b981' : '#6366f1',
              bgCol: isSecTransversal ? '#ecfdf5' : '#eef2ff'
            });
          }

          var badgeAccionesRegular = 
            '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:8px;">' +
              '<span class="badge-pill" style="background:#e0f2fe; color:#0369a1; font-weight:700; font-size:0.76rem;">' +
                '🎯 Capacidad: ' + accionesSemana.length + ' Proceso(s) Activo(s) (' + decretoInfo.horasSemanales + 'h/sem)' +
              '</span>' +
              '<span style="font-size:0.75rem; color:#0c4a6e; font-weight:600;">' +
                tipoEstrategiaLabel + ' (~' + (decretoInfo.horasSemanales / accionesSemana.length).toFixed(1) + 'h c/u)' +
              '</span>' +
            '</div>';

          desgloseHorarioHTML = 
            '<div style="margin-top:8px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px 10px; font-size:0.78rem; color:#0369a1;">' +
              '⏱️ <strong>Jornada Decreto 0277/2025 (' + decretoInfo.horasSemanales + 'h/sem efectivas):</strong> ' +
              accionesSemana.map(function(acc) {
                return '<strong>' + acc.etiqueta.split('(')[0].trim() + ':</strong> ' + acc.horas + 'h (' + acc.codigo + ')';
              }).join(' | ') +
            '</div>';
        }

        // Recuperar estados y bitácoras guardados por proceso
        var savedSem = savedMonitoreo[String(i)] || {};
        var savedAcciones = savedSem.acciones || {};

        accionesSemana.forEach(function(acc) {
          if (savedAcciones[acc.id]) {
            acc.avance = savedAcciones[acc.id].avance || '⚪ Sin iniciar';
            acc.observaciones = savedAcciones[acc.id].observaciones || '';
          } else {
            // Compatibilidad con registros monolíticos previos
            if (acc.id === 'acc_1') {
              acc.avance = savedSem.avance || '⚪ Sin iniciar';
              acc.observaciones = savedSem.observaciones || '';
            } else {
              acc.avance = '⚪ Sin iniciar';
              acc.observaciones = '';
            }
          }
        });

        semanas.push({
          num: i,
          fecha: fechaFormatted,
          foco: focoSemana,
          horasSemana: decretoInfo.horasSemanales,
          acciones: accionesSemana,
          badgeCapacidad: isEtapa1 && i <= 2 ? badgeAccionesEtapa1 : badgeAccionesRegular,
          desgloseHorarioHTML: desgloseHorarioHTML,
          barrerasAlertHTML: barrerasAlertHTML || ''
        });
      }

      // Cálculo de Métricas y Transición de Etapa Curricular
      var totalAccionesTodas = 0;
      var totalLogradasTodas = 0;
      var totalEnProcesoTodas = 0;

      semanas.forEach(function(s) {
        s.acciones.forEach(function(acc) {
          totalAccionesTodas++;
          if (acc.avance && acc.avance.indexOf('Logrado') !== -1) totalLogradasTodas++;
          else if (acc.avance && acc.avance.indexOf('proceso') !== -1) totalEnProcesoTodas++;
        });
      });

      var pctLogrado = totalAccionesTodas > 0 ? Math.round((totalLogradasTodas / totalAccionesTodas) * 100) : 0;
      var pctEfectivo = totalAccionesTodas > 0 ? Math.round(((totalLogradasTodas + (totalEnProcesoTodas * 0.5)) / totalAccionesTodas) * 100) : 0;

      // Recomendación de Transición de Etapa
      var recomendacionTransicion = null;
      var etapaActualStr = d.etapa || 'ETAPA 2: Recuperación temprana / Lúdica';

      if (etapaActualStr.indexOf('ETAPA 1') !== -1) {
        var sem1Lograda = semanas[0] && semanas[0].acciones.every(function(a) { return a.avance && a.avance.indexOf('Logrado') !== -1; });
        var sem2Lograda = semanas[1] && semanas[1].acciones.every(function(a) { return a.avance && a.avance.indexOf('Logrado') !== -1; });
        if (sem1Lograda && sem2Lograda) {
          recomendacionTransicion = {
            etapaDestino: 'ETAPA 2: Recuperación temprana / Lúdica',
            nuevoBloom: 'Media / Intermedia (Bloom Nivel 3-4: Aplicar / Analizar)',
            motivo: '¡Contención inicial superada! Los procesos de choque socioemocional y autoprotección de las Semanas 1 y 2 están 100% logrados.',
            icono: '🌱',
            colorFondo: '#fef3c7',
            colorBorde: '#f59e0b',
            colorTexto: '#92400e'
          };
        }
      } else if (etapaActualStr.indexOf('ETAPA 2') !== -1) {
        if (pctLogrado >= 60 || totalLogradasTodas >= 8) {
          recomendacionTransicion = {
            etapaDestino: 'ETAPA 3: Educación formal adaptada / Retorno',
            nuevoBloom: 'Alta / Profundización (Bloom Nivel 5-6: Evaluar / Crear)',
            motivo: '¡Consolidación pedagógica exitosa! Se ha alcanzado un ' + pctLogrado + '% de aprendizajes logrados. El grupo está listo para la educación formal adaptada.',
            icono: '🎓',
            colorFondo: '#eff6ff',
            colorBorde: '#3b82f6',
            colorTexto: '#1e40af'
          };
        }
      }

      // Banner Contextual de Diagnóstico Activo en Módulo C
      var ciclosLabel = isMultigrado ? ('Multigrado (Ciclos ' + activeCycles.join(', ') + ')') : ('Ciclo ' + activeCycles[0]);
      var bannerContextoMonitoreo_HTML = 
        '<div class="diagnostic-context-banner">' +
          '<div>' +
            '<strong>📌 Monitoreo Curricular Vinculado:</strong> ' + ((d && d.etapa && d.etapa.split(':')[0]) || 'Etapa 2') + ' | ' +
            '<strong>Multirriesgo:</strong> ' + amenazasLabel + ' | ' +
            '<strong>' + ciclosLabel + '</strong> ' +
            '(' + ((d && d.nna) || 28) + ' NNA - ' + ((d && d.didacticaNNA) || 'TRABAJO COOPERATIVO') + ') | ' +
            '<em>Reanudación: ' + ((d && d.fechaAtencion) || '2026-03-22') + '</em>' +
          '</div>' +
          '<div>' +
            '<button type="button" class="btn-micro" onclick="window.switchTab(\'tab-diagnostico\');" style="background:white; border-color:#86efac; color:#166534; font-weight:700;">' +
              '⚙️ Ver / Cambiar Diagnóstico' +
            '</button>' +
          '</div>' +
        '</div>';

      var bannerTransicionHTML = '';
      if (recomendacionTransicion) {
        bannerTransicionHTML = 
          '<div style="background:' + recomendacionTransicion.colorFondo + '; border:2px solid ' + recomendacionTransicion.colorBorde + '; border-radius:8px; padding:14px 18px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">' +
            '<div style="color:' + recomendacionTransicion.colorTexto + '; font-size:0.92rem; line-height:1.45;">' +
              '<h4 style="margin:0 0 4px 0; font-size:1.02rem; display:flex; align-items:center; gap:6px;">' +
                recomendacionTransicion.icono + ' <strong>Recomendación Oficial de Transición Curricular (Normas INEE):</strong>' +
              '</h4>' +
              recomendacionTransicion.motivo + '<br>' +
              '<span style="font-size:0.82rem; font-weight:600;">Siguiente Nivel: <strong>' + recomendacionTransicion.etapaDestino + '</strong> con nivel cognitivo <strong>' + recomendacionTransicion.nuevoBloom + '</strong>.</span>' +
            '</div>' +
            '<div>' +
              '<button id="btn-promover-etapa" class="btn-elite" style="background:' + recomendacionTransicion.colorBorde + '; color:white; font-weight:700; padding:10px 18px; font-size:0.88rem; box-shadow:0 2px 4px rgba(0,0,0,0.1);">' +
                '🚀 Promover Plan a ' + recomendacionTransicion.etapaDestino.split(':')[0] +
              '</button>' +
            '</div>' +
          '</div>';
      }

      var html = 
        '<div class="card-elite">' +
          bannerContextoMonitoreo_HTML +
          '<div class="card-header" style="flex-wrap: wrap; gap: 12px;">' +
            '<div>' +
              '<h2 class="card-title">📋 Módulo C: Monitoreo Semanal de Aprendizajes y Avance Pedagógico</h2>' +
              '<p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">' +
                'Cronograma de 16 semanas articulado con el <strong>Decreto 0277 de 2025</strong> (' + decretoInfo.horasSemanales + 'h/sem efectivas) y las Normas Mínimas INEE.' +
              '</p>' +
            '</div>' +
            '<div style="display: flex; gap: 8px; flex-wrap: wrap;">' +
              '<button id="btn-exportar-excel" class="btn-elite btn-secondary">📊 Exportar a Excel</button>' +
              '<button id="btn-imprimir-carta" class="btn-elite btn-outline">🖨️ Imprimir Carta SIEE</button>' +
              '<button id="btn-guardar-monitoreo" class="btn-elite btn-primary">💾 Guardar Avances</button>' +
            '</div>' +
          '</div>' +

          bannerTransicionHTML +

          '<!-- Panel de Métricas e Indicadores de Rendimiento SIEE -->' +
          '<div class="grid-3" style="gap: 12px; margin-bottom: 20px;">' +
            '<div style="background: var(--surface-hover); border-left: 4px solid #059669; padding: 12px 14px; border-radius: var(--radius-sm);">' +
              '<div style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Procesos Logrados</div>' +
              '<div style="font-size: 1.45rem; font-weight: 800; color: #059669; margin-top: 2px;">' + totalLogradasTodas + ' / ' + totalAccionesTodas + ' <span style="font-size: 0.88rem; font-weight: 600;">(' + pctLogrado + '%)</span></div>' +
            '</div>' +
            '<div style="background: var(--surface-hover); border-left: 4px solid #d97706; padding: 12px 14px; border-radius: var(--radius-sm);">' +
              '<div style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Procesos en Marcha</div>' +
              '<div style="font-size: 1.45rem; font-weight: 800; color: #d97706; margin-top: 2px;">' + totalEnProcesoTodas + ' <span style="font-size: 0.88rem; font-weight: 600;">en desarrollo</span></div>' +
            '</div>' +
            '<div style="background: var(--surface-hover); border-left: 4px solid #0284c7; padding: 12px 14px; border-radius: var(--radius-sm);">' +
              '<div style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Jornada Oficial (Dec. 0277/2025)</div>' +
              '<div style="font-size: 1.45rem; font-weight: 800; color: #0284c7; margin-top: 2px;">' + decretoInfo.horasSemanales + 'h/sem <span style="font-size: 0.82rem; font-weight: 600;">(' + decretoInfo.horasDiarias + 'h/día)</span></div>' +
            '</div>' +
          '</div>' +

          '<!-- Tabla de Monitoreo Semanal Multi-Acción -->' +
          '<div style="overflow-x: auto;">' +
            '<table class="table-print" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">' +
              '<thead>' +
                '<tr style="background: var(--surface-hover); text-align: left; border-bottom: 2px solid var(--border-medium);">' +
                  '<th style="padding: 10px; width: 9%;">Semana</th>' +
                  '<th style="padding: 10px; width: 10%;">Fecha Lectiva</th>' +
                  '<th style="padding: 10px; width: 12%;">Foco Curricular</th>' +
                  '<th style="padding: 10px; width: 33%;">Procesos y Aprendizajes Priorizados (Decreto 0277)</th>' +
                  '<th style="padding: 10px; width: 16%;">Estado por Proceso</th>' +
                  '<th style="padding: 10px; width: 20%;">Bitácora y Evidencias</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                semanas.map(function(s) {
                  var tarjetasProcesosHTML = '';
                  var estadosProcesosHTML = '';
                  var bitacorasProcesosHTML = '';

                  s.acciones.forEach(function(acc, accIdx) {
                    var cardMargin = (accIdx > 0) ? 'margin-top: 8px;' : '';
                    var cardMinHeight = (s.acciones.length > 1) ? 'min-height: 85px;' : '';

                    tarjetasProcesosHTML += 
                      '<div style="background:' + acc.bgCol + '; border:1px solid ' + acc.borderCol + '; border-radius:6px; padding:8px 10px; ' + cardMargin + ' ' + cardMinHeight + ' box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">' +
                          '<span style="font-size:0.75rem; font-weight:700; color:' + acc.borderCol + ';">' +
                            acc.etiqueta + ' • ' + acc.horas + 'h efectivas' +
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
                        '<select class="select-elite select-avance-accion select-avance-semana no-print" data-semana="' + s.num + '" data-accion-id="' + acc.id + '" style="font-size: 0.82rem; padding: 5px 8px; width:100%; background:white; font-weight:600;">' +
                          '<option value="⚪ Sin iniciar" ' + (acc.avance === '⚪ Sin iniciar' ? 'selected' : '') + '>⚪ Sin iniciar</option>' +
                          '<option value="🟡 En proceso" ' + (acc.avance === '🟡 En proceso' ? 'selected' : '') + '>🟡 En proceso</option>' +
                          '<option value="🟢 Logrado" ' + (acc.avance === '🟢 Logrado' ? 'selected' : '') + '>🟢 Logrado</option>' +
                          '<option value="🔴 Postergado" ' + (acc.avance === '🔴 Postergado' ? 'selected' : '') + '>🔴 Postergado</option>' +
                        '</select>' +
                        '<div class="print-only-text" style="display:none; font-size:8pt; font-weight:800; color:#0f172a; padding:2px 0;">' +
                          'Estado: ' + (acc.avance || '⚪ Sin iniciar') +
                        '</div>' +
                      '</div>';

                    bitacorasProcesosHTML += 
                      '<div style="background:' + acc.bgCol + '; border:1px solid ' + acc.borderCol + '; border-radius:6px; padding:8px 10px; ' + cardMargin + ' ' + cardMinHeight + ' display:flex; flex-direction:column; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                        '<div style="font-size:0.72rem; color:#475569; font-weight:700; margin-bottom:4px;">' +
                          'Bitácora ' + acc.etiqueta + ' (' + acc.horas + 'h):' +
                        '</div>' +
                        '<textarea class="textarea-elite input-observaciones-accion input-observaciones-semana no-print" data-semana="' + s.num + '" data-accion-id="' + acc.id + '" rows="2" placeholder="Registro de evidencias y acuerdos para ' + acc.codigo + '..." style="font-size: 0.8rem; width:100%; background:white;">' + (acc.observaciones || '') + '</textarea>' +
                        '<div class="print-only-text" style="display:none; font-size:7.5pt; color:#1e293b; line-height:1.35; padding:3px 0; border-top:1px dashed #cbd5e1; margin-top:2px;">' +
                          (acc.observaciones && acc.observaciones.trim() ? acc.observaciones.trim() : '<em>(Sin observaciones adicionales registradas)</em>') +
                        '</div>' +
                      '</div>';
                  });

                  var tarjetaCompletaHTML = 
                    '<div>' +
                      s.badgeCapacidad +
                      '<div style="margin-bottom:6px; font-size:0.83rem;">' +
                        '<strong>🎓 ' + (d.grado || ciclosLabel) + ' | ' + (d.didacticaNNA || 'TRABAJO COOPERATIVO') + '</strong><br>' +
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

          var selEtapa = document.getElementById('select-etapa');
          if (selEtapa) selEtapa.value = recomendacionTransicion.etapaDestino;

          if (typeof ModuloA !== 'undefined' && ModuloA && typeof ModuloA.updateBloomDisplay === 'function') {
            ModuloA.updateBloomDisplay(recomendacionTransicion.nuevoBloom);
          }
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

      // Evento Guardar Avance con Multi-Acción
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
              var sel = container.querySelector('.select-avance-accion[data-semana="' + semNum + '"][data-accion-id="' + acc.id + '"]') || container.querySelector('.select-avance-semana[data-semana="' + semNum + '"]');
              var txt = container.querySelector('.input-observaciones-accion[data-semana="' + semNum + '"][data-accion-id="' + acc.id + '"]') || container.querySelector('.input-observaciones-semana[data-semana="' + semNum + '"]');
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
          alert('✅ Monitoreo Semanal guardado exitosamente.\nSe registraron los estados de cada proceso pedagógico y se actualizaron los indicadores de avance vinculados a este diagnóstico.');
        });
      }

      // Evento Exportar a Excel
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
            'Subproceso / Articulación',
            'Descripción del Aprendizaje Priorizado',
            'Horas Proceso',
            'Didáctica Situada',
            'Desafío Cognitivo (Bloom)',
            'Etapa Curricular',
            'Foco Pedagógico',
            'Multirriesgo Top 3',
            'Estado de Avance Proceso',
            'Evidencias y Bitácora Docente'
          ]);

          semanas.forEach(function(s) {
            s.acciones.forEach(function(acc) {
              var sel = container.querySelector('.select-avance-accion[data-semana="' + s.num + '"][data-accion-id="' + acc.id + '"]') || container.querySelector('.select-avance-semana[data-semana="' + s.num + '"]');
              var txt = container.querySelector('.input-observaciones-accion[data-semana="' + s.num + '"][data-accion-id="' + acc.id + '"]') || container.querySelector('.input-observaciones-semana[data-semana="' + s.num + '"]');
              var avVal = sel ? sel.value : acc.avance;
              var obsVal = txt ? txt.value : acc.observaciones;

              var row = [
                'Semana ' + s.num,
                s.fecha,
                s.horasSemana + 'h',
                acc.id,
                acc.etiqueta,
                acc.codigo,
                acc.subproceso || '',
                acc.descripcion || '',
                acc.horas + 'h',
                acc.didactica || '',
                acc.bloom || '',
                d.etapa || '',
                s.foco || '',
                amenazasLabel,
                avVal,
                obsVal
              ];
              csvRows.push(row);
            });
          });

          var formatCSVCell = function(val) {
            var str = (val === null || val === undefined) ? '' : String(val);
            if (str.indexOf(';') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1 || str.indexOf('\r') !== -1) {
              return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
          };

          var csvContent = '\uFEFF' + csvRows.map(function(row) {
            return row.map(formatCSVCell).join(';');
          }).join('\r\n');

          var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'monitoreo_semanal_decreto0277_' + (d.ciclos || ['3']).join('_') + '_' + new Date().toISOString().split('T')[0] + '.csv';
          a.click();
          URL.revokeObjectURL(url);
        });
      }

      // Evento Imprimir Carta SIEE
      var btnPrint = document.getElementById('btn-imprimir-carta');
      if (btnPrint) {
        btnPrint.addEventListener('click', function() {
          window.print();
        });
      }

    } catch (err) {
      console.error('Error renderizando Módulo C:', err);
    }
  }
};
