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
    var hasAnyManual = false;

    areas.forEach(function(aKey) {
      var rawList = [];
      if (aKey === 'socioemocional') rawList = habsList || [];
      else if (aKey === 'supervivencia') rawList = supsList || [];
      else rawList = (cicloData && cicloData[aKey]) || [];

      rawList.forEach(function(item, idx) {
        var parsed = (typeof ModuloB !== 'undefined' && ModuloB && typeof ModuloB.getItemFields === 'function') 
          ? ModuloB.getItemFields(item, aKey, idx, rawList.length)
          : { id: aKey + '_' + idx, dbaCode: 'DBA', dbaDesc: '', didactica: 'Taller situado' };

        if (userSelection[parsed.id] === true) {
          hasAnyManual = true;
          basket[aKey].push(parsed);
        }
      });
    });

    // Si el docente no ha seleccionado manualmente aún en Módulo B, generar una canasta recomendada inteligente
    if (!hasAnyManual) {
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

      // Generar 16 semanas articuladas con la canasta y el enfoque INEE
      for (var i = 1; i <= 16; i++) {
        var fechaSem = new Date(fechaBase.getTime());
        fechaSem.setDate(fechaBase.getDate() + (i - 1) * 7);
        var fechaFormatted = !isNaN(fechaSem.getTime()) ? fechaSem.toLocaleDateString('es-CO') : ('Semana ' + i);

        var tarjetaHTML = '';
        var tarjetaPlana = '';
        var focoSemana = '';
        var areaKey = '';

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

          tarjetaHTML = 
            '<div style="line-height:1.45;">' +
              '<div style="background:#fef2f2; border-left:4px solid #b91c1c; padding:4px 8px; margin-bottom:6px; border-radius:4px; font-weight:800; font-size:0.8rem; color:#991b1b;">' +
                '🕊️ SEMANA DE RESPUESTA INMEDIATA / CONTENCIÓN (NORMAS MÍNIMAS INEE)' +
              '</div>' +
              '<strong>🎓 ' + (d.grado || ('Ciclo ' + cicloKey)) + ' | ' + (d.didacticaNNA || 'TRABAJO COOPERATIVO') + '</strong><br>' +
              '<span style="color:#b91c1c;">⚠️ Multirriesgo [' + amenazasLabel + ']:</span> ' + (d.riesgosIE || 'Protección de la comunidad educativa') + '<br>' +
              '<span style="color:#92400e;">🌱 <strong>' + socioItem.dbaCode + ':</strong> ' + socioItem.dbaDesc + '</span><br>' +
              '<span style="color:#0369a1;">🛡️ <strong>' + supItem.dbaCode + ':</strong> ' + supItem.dbaDesc + '</span><br>' +
              '<span style="color:#047857;">🛠️ <strong>Acción Situada:</strong> ' + socioItem.didactica + ' | ' + supItem.didactica + '</span><br>' +
              '<span style="color:#6b21a8;">🎯 <strong>Desafío Bloom:</strong> Recordar y Comprender (Contención no amenazante)</span>' +
            '</div>';

          tarjetaPlana = 'Contención INEE | ' + (d.grado || 'Ciclo ' + cicloKey) + ' | ' + socioItem.dbaDesc + ' | ' + supItem.dbaDesc;

        } else {
          // Semanas académicas y proyectos integrados a partir de la canasta
          var acaIdx = isEtapa1 ? (i - 3) : (i - 1);
          areaKey = academicAreas[acaIdx % academicAreas.length];
          focoSemana = areaKey.toUpperCase();

          var areaBasket = basket[areaKey] || [];
          var parsedItem = null;

          if (areaBasket.length > 0) {
            parsedItem = areaBasket[Math.floor(acaIdx / academicAreas.length) % areaBasket.length];
          } else {
            parsedItem = {
              dbaCode: 'DBA Adaptado',
              subproceso: 'Competencia priorizada en emergencia',
              dbaDesc: 'Aprendizaje esencial seleccionado en la canasta curricular',
              complejidad: 'Intermedia',
              bloom: 'Aplicar y contextualizar en el entorno',
              didactica: 'Taller situado y pedagógico de aula'
            };
          }

          var didacticaEstrategia = self.getDidacticaStrategyForArea(areaKey, d.nna);

          tarjetaHTML = 
            '<div style="line-height:1.45;">' +
              '<strong>🎓 ' + (d.grado || ('Ciclo ' + cicloKey)) + ' | ' + (d.didacticaNNA || 'TRABAJO COOPERATIVO') + '</strong><br>' +
              '<span style="color:#b91c1c;">⚠️ Multirriesgo [' + amenazasLabel + ']:</span> ' + (d.riesgosIE || 'Riesgo institucional') + '<br>' +
              '<span style="color:#0369a1;">📘 <strong>' + parsedItem.dbaCode + ' (' + (parsedItem.periodo || 'Plan Adaptado') + '):</strong> ' + (parsedItem.subproceso ? (parsedItem.subproceso + ' - ') : '') + parsedItem.dbaDesc + '</span><br>' +
              '<span style="color:#047857;">🛠️ <strong>Didáctica Situada:</strong> ' + parsedItem.didactica + ' | <em>' + didacticaEstrategia + '</em></span><br>' +
              '<span style="color:#6b21a8;">🎯 <strong>Desafío Bloom:</strong> ' + parsedItem.bloom + '</span>' +
            '</div>';

          tarjetaPlana = (d.grado || ('Ciclo ' + cicloKey)) + ' | ' + amenazasLabel + ' | ' + parsedItem.dbaCode + ': ' + parsedItem.dbaDesc + ' | ' + parsedItem.didactica;
        }

        semanas.push({
          num: i,
          fecha: fechaFormatted,
          etapa: d.etapa || 'ETAPA 2: Recuperación temprana / Lúdica',
          foco: focoSemana,
          areaNombre: focoSemana,
          tarjeta: tarjetaHTML,
          tarjetaPlana: tarjetaPlana,
          avance: savedMonitoreo[i] ? savedMonitoreo[i].avance : '⚪ Sin iniciar',
          observaciones: savedMonitoreo[i] ? savedMonitoreo[i].observaciones : ''
        });
      }

      // Conteo de KPI
      var monValues = Object.keys(savedMonitoreo).map(function(k) { return savedMonitoreo[k]; });
      var logrados = monValues.filter(function(x) { return x && x.avance && x.avance.indexOf('Logrado') !== -1; }).length;
      var enProceso = monValues.filter(function(x) { return x && x.avance && x.avance.indexOf('proceso') !== -1; }).length;
      var pctAvance = Math.round((logrados / semanas.length) * 100);

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

          '<!-- Banner de Canasta Curricular Activa -->' +
          '<div style="background: #f0fdf4; border-left: 5px solid #059669; padding: 12px 16px; border-radius: var(--radius-sm); margin-bottom: 18px; font-size: 0.88rem; line-height: 1.55;">' +
            '<strong>🎯 Planificación Curricular Alimentada desde la Rayuela (Módulo B):</strong> ' +
            'Este cronograma semanal integra las prioridades seleccionadas por el docente en la Rayuela Curricular. ' +
            (isEtapa1 ? '<strong>Enfoque Normas INEE Activo:</strong> Las Semanas 1 y 2 están blindadas con soporte psicosocial y autoprotección ERAE/WASH.' : 'Las semanas distribuyen de forma equilibrada los proyectos y DBA priorizados.') +
          '</div>' +

          '<div class="grid-4" style="margin-bottom: 24px;">' +
            '<div style="background: var(--surface-hover); padding: 14px; border-radius: var(--radius-md); text-align: center;">' +
              '<div style="font-size: 0.8rem; color: var(--text-muted);">Progreso Logrado</div>' +
              '<div style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">' + pctAvance + '%</div>' +
            '</div>' +
            '<div style="background: var(--color-etapa3-bg); padding: 14px; border-radius: var(--radius-md); text-align: center;">' +
              '<div style="font-size: 0.8rem; color: var(--color-etapa3);">🟢 Logrados</div>' +
              '<div style="font-size: 1.6rem; font-weight: 800; color: var(--color-etapa3);">' + logrados + '</div>' +
            '</div>' +
            '<div style="background: var(--color-etapa2-bg); padding: 14px; border-radius: var(--radius-md); text-align: center;">' +
              '<div style="font-size: 0.8rem; color: var(--color-etapa2);">🟡 En Proceso</div>' +
              '<div style="font-size: 1.6rem; font-weight: 800; color: var(--color-etapa2);">' + enProceso + '</div>' +
            '</div>' +
            '<div style="background: var(--color-blue-bg); padding: 14px; border-radius: var(--radius-md); text-align: center;">' +
              '<div style="font-size: 0.8rem; color: var(--color-blue);">Total Semanas Plan</div>' +
              '<div style="font-size: 1.6rem; font-weight: 800; color: var(--color-blue);">' + semanas.length + '</div>' +
            '</div>' +
          '</div>' +

          '<div style="overflow-x: auto;">' +
            '<table class="table-print" style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">' +
              '<thead>' +
                '<tr style="background: var(--surface-hover); text-align: left;">' +
                  '<th style="padding: 10px; width: 75px;">Semana</th>' +
                  '<th style="padding: 10px; width: 105px;">Fecha Proy.</th>' +
                  '<th style="padding: 10px; width: 120px;">Enfoque / Área</th>' +
                  '<th style="padding: 10px;">Tarjeta de Acción Pedagógica Situada</th>' +
                  '<th style="padding: 10px; width: 140px;">Estado de Avance</th>' +
                  '<th style="padding: 10px; width: 220px;">Evidencias / Bitácora Docente</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                semanas.map(function(s) {
                  return '<tr style="border-bottom: 1px solid var(--border-light);">' +
                    '<td style="padding: 10px; font-weight: 700; color: var(--primary); vertical-align: top;">Semana ' + s.num + '</td>' +
                    '<td style="padding: 10px; font-size: 0.82rem; color: var(--text-muted); vertical-align: top;">' + s.fecha + '</td>' +
                    '<td style="padding: 10px; vertical-align: top;"><span class="badge-pill" style="background:#e2e8f0; color:#1e293b; font-size:0.75rem;">' + s.foco + '</span></td>' +
                    '<td style="padding: 10px; vertical-align: top;">' + s.tarjeta + '</td>' +
                    '<td style="padding: 10px; vertical-align: top;">' +
                      '<select class="select-elite select-avance-semana" data-semana="' + s.num + '" style="font-size: 0.82rem; padding: 6px 8px;">' +
                        '<option value="⚪ Sin iniciar" ' + (s.avance === '⚪ Sin iniciar' ? 'selected' : '') + '>⚪ Sin iniciar</option>' +
                        '<option value="🟡 En proceso" ' + (s.avance === '🟡 En proceso' ? 'selected' : '') + '>🟡 En proceso</option>' +
                        '<option value="🟢 Logrado" ' + (s.avance === '🟢 Logrado' ? 'selected' : '') + '>🟢 Logrado</option>' +
                        '<option value="🔴 Postergado" ' + (s.avance === '🔴 Postergado' ? 'selected' : '') + '>🔴 Postergado</option>' +
                      '</select>' +
                    '</td>' +
                    '<td style="padding: 10px; vertical-align: top;">' +
                      '<textarea class="textarea-elite input-observaciones-semana" data-semana="' + s.num + '" rows="2" placeholder="Registro de evidencias, adaptaciones y acuerdos de aula..." style="font-size: 0.82rem;">' + s.observaciones + '</textarea>' +
                    '</td>' +
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

      // Evento Guardar Avance
      var btnGuardar = document.getElementById('btn-guardar-monitoreo');
      if (btnGuardar) {
        btnGuardar.addEventListener('click', function(e) {
          e.preventDefault();
          var u = AuthManager.getUserData() || {};
          u.monitoreo = u.monitoreo || {};

          container.querySelectorAll('.select-avance-semana').forEach(function(sel) {
            var semNum = sel.getAttribute('data-semana');
            var txtObs = container.querySelector('.input-observaciones-semana[data-semana="' + semNum + '"]');
            u.monitoreo[semNum] = {
              avance: sel.value,
              observaciones: txtObs ? txtObs.value : '',
              updatedAt: new Date().toISOString()
            };
          });

          AuthManager.saveUserData('monitoreo', u.monitoreo);
          self.renderMonitoreo();
          alert('✅ Monitoreo Semanal guardado exitosamente en el perfil docente.');
        });
      }

      // Evento Exportar a Excel (CSV con UTF-8 BOM)
      var btnExcel = document.getElementById('btn-exportar-excel');
      if (btnExcel) {
        btnExcel.addEventListener('click', function() {
          var csvRows = [];
          csvRows.push(['Semana', 'Fecha Proyectada', 'Etapa', 'Foco Pedagógico', 'Multirriesgo Top 3', 'Tarjeta Curricular Resumida', 'Estado de Avance', 'Evidencias y Observaciones Docente']);
          semanas.forEach(function(s) {
            var txtObs = container.querySelector('.input-observaciones-semana[data-semana="' + s.num + '"]');
            var selAvance = container.querySelector('.select-avance-semana[data-semana="' + s.num + '"]');
            var obsVal = (txtObs ? txtObs.value : s.observaciones).replace(/;/g, ',').replace(/\n/g, ' ');
            var avVal = selAvance ? selAvance.value : s.avance;
            csvRows.push([
              'Semana ' + s.num,
              s.fecha,
              s.etapa,
              s.foco,
              amenazasLabel,
              s.tarjetaPlana.replace(/;/g, ','),
              avVal,
              obsVal
            ]);
          });

          var csvContent = '\uFEFF' + csvRows.map(function(e) { return e.join(';'); }).join('\n');
          var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'monitoreo_semanal_ciclo_' + cicloKey + '_emergencia_' + new Date().toISOString().split('T')[0] + '.csv';
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
