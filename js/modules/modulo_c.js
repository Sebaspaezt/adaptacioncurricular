// Módulo C: Monitoreo Semanal por Etapas
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

  parseItemData: function(item, areaKey) {
    try {
      if (typeof ModuloB !== 'undefined' && ModuloB && typeof ModuloB.getItemFields === 'function') {
        var res = ModuloB.getItemFields(item, areaKey);
        if (res) return res;
      }
    } catch (e) {}

    if (Array.isArray(item)) {
      var dbaRaw = item[2] || '';
      var dbaCode = 'DBA';
      var dbaDesc = dbaRaw;
      if (dbaRaw.indexOf(':') !== -1) {
        var parts = dbaRaw.split(':');
        dbaCode = parts[0].trim();
        dbaDesc = parts.slice(1).join(':').trim();
      }
      return {
        factor: item[0] || 'Eje Curricular Priorizado',
        subproceso: item[1] || 'Contenido nuclear priorizado',
        dbaCode: dbaCode,
        dbaDesc: dbaDesc,
        complejidad: item[4] || 'Intermedia',
        bloom: item[5] || 'Aplicar y reflexionar en el entorno',
        didactica: item[7] || item[6] || 'Taller pedagógico situado'
      };
    } else if (item && typeof item === 'object') {
      return {
        factor: item.factor || item.eje || item.pensamiento || 'Eje Curricular Priorizado',
        subproceso: item.subproceso || item.habilidad || 'Contenido nuclear priorizado',
        dbaCode: item.dba_code || item.codigo || 'DBA',
        dbaDesc: item.dba_desc || item.enunciado || item.descripcion || 'Aprendizaje esencial priorizado por contexto',
        complejidad: item.complejidad || 'Intermedia',
        bloom: item.bloom || item.objetivo_bloom || 'Aplicar y reflexionar',
        didactica: item.didactica || item.miniproyecto || 'Taller situado de aprendizaje cooperativo'
      };
    }

    var defaultAreaLabels = {
      'lenguaje': 'Comprensión lectora y expresión de afecto y seguridad',
      'matematicas': 'Resolución de problemas cotidianos y conteo contextualizado',
      'sociales': 'Convivencia, autoprotección comunitaria y memoria territorial',
      'naturales': 'Gestión ambiental, cuidado del agua y prevención de riesgos'
    };

    return {
      factor: 'Eje Curricular Priorizado',
      subproceso: defaultAreaLabels[areaKey] || 'Contenido nuclear priorizado en emergencia',
      dbaCode: 'DBA Adaptado',
      dbaDesc: 'Aprendizaje esencial priorizado según contexto territorial de emergencia',
      complejidad: 'Intermedia',
      bloom: 'Aplicar y contextualizar en el entorno',
      didactica: 'Taller situado y pedagógico de aula'
    };
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
          categoriasAmenaza: ['NATURAL'],
          categoriaAmenaza: 'NATURAL',
          amenaza: 'Inundación',
          ejemploIE: 'Creciente de río o quebrada',
          riesgosIE: 'Daños a infraestructura, suspensión de actividades académicas',
          rutaGIRE: '🏛️ Instancias PGIRE: Mesa Territorial de Gestión del Riesgo (CMGRD / CDGRD / UNGRD) + Bomberos + Defensa Civil + Cruz Roja + Alcaldía',
          fechaInicio: new Date().toISOString().split('T')[0]
        };
      }

      var cicloKey = String(d.ciclo || '3');
      var currDB = (typeof CURRICULUM_DB !== 'undefined' && CURRICULUM_DB) ? CURRICULUM_DB : {};
      var cicloData = currDB[cicloKey] || currDB['3'] || currDB['1'] || {};
      var savedMonitoreo = (user && user.monitoreo) || {};

      var semanas = [];
      var fechaBaseStr = String(d.fechaInicio || '').trim();
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

      var areas = ['lenguaje', 'matematicas', 'sociales', 'naturales'];

      for (var i = 1; i <= 16; i++) {
        var fechaSem = new Date(fechaBase.getTime());
        fechaSem.setDate(fechaBase.getDate() + (i - 1) * 7);
        var fechaFormatted = !isNaN(fechaSem.getTime()) ? fechaSem.toLocaleDateString('es-CO') : ('Semana ' + i);

        var areaKey = areas[(i - 1) % areas.length];
        var rawItems = (cicloData && cicloData[areaKey]) || [];
        var rawItem = rawItems.length > 0 ? (rawItems[Math.floor((i - 1) / areas.length) % rawItems.length] || rawItems[0]) : null;
        var parsedItem = self.parseItemData(rawItem, areaKey);
        var didacticaEstrategia = self.getDidacticaStrategyForArea(areaKey, d.nna);

        var tarjetaHTML = 
          '<div style="line-height:1.45;">' +
            '<strong>🎓 ' + (d.grado || ('Ciclo ' + cicloKey)) + ' | ' + (d.didacticaNNA || 'TRABAJO COOPERATIVO') + '</strong><br>' +
            '<span style="color:#b91c1c;">⚠️ [' + (d.categoriaAmenaza || 'AMENAZA') + ' - ' + (d.amenaza || 'Emergencia territorial') + ']:</span> ' + (d.riesgosIE || 'Riesgo institucional') + '<br>' +
            '<span style="color:#0369a1;">📘 <strong>' + parsedItem.dbaCode + ':</strong> ' + (parsedItem.subproceso || '') + ' (' + (parsedItem.dbaDesc || '') + ')</span><br>' +
            '<span style="color:#047857;">🛠️ <strong>Didáctica Situada:</strong> ' + parsedItem.didactica + ' | <em>' + didacticaEstrategia + '</em></span><br>' +
            '<span style="color:#6b21a8;">🎯 <strong>Desafío Bloom:</strong> ' + parsedItem.bloom + '</span>' +
          '</div>';

        semanas.push({
          num: i,
          fecha: fechaFormatted,
          etapa: d.etapa || 'ETAPA 2: Recuperación temprana / Lúdica',
          areaKey: areaKey,
          areaNombre: areaKey.toUpperCase(),
          tarjeta: tarjetaHTML,
          tarjetaPlana: (d.grado || ('Ciclo ' + cicloKey)) + ' | ' + (d.amenaza || 'Emergencia') + ' | ' + parsedItem.dbaCode + ': ' + parsedItem.subproceso + ' - ' + parsedItem.dbaDesc + ' | Didáctica: ' + parsedItem.didactica + ' | Bloom: ' + parsedItem.bloom,
          avance: savedMonitoreo[i] ? savedMonitoreo[i].avance : '⚪ Sin iniciar',
          observaciones: savedMonitoreo[i] ? savedMonitoreo[i].observaciones : ''
        });
      }

      var monValues = Object.keys(savedMonitoreo).map(function(k) { return savedMonitoreo[k]; });
      var logrados = monValues.filter(function(x) { return x && x.avance && x.avance.indexOf('Logrado') !== -1; }).length;
      var enProceso = monValues.filter(function(x) { return x && x.avance && x.avance.indexOf('proceso') !== -1; }).length;
      var sinIniciar = semanas.length - logrados - enProceso;
      var pctAvance = Math.round((logrados / semanas.length) * 100);

      var html = 
        '<div class="card-elite">' +
          '<div class="card-header">' +
            '<div>' +
              '<h3 class="card-title">📋 Monitoreo Semanal por Etapas (Ciclo ' + cicloKey + ')</h3>' +
              '<span style="font-size: 0.85rem; color: var(--text-muted);">Docente: ' + ((user && user.nombreCompleto) || 'Docente Territorial') + ' | Institución: ' + ((user && user.institucion) || 'IE Rural de Emergencia') + ' | Amenaza: ' + (d.amenaza || 'Territorial') + '</span>' +
            '</div>' +
            '<div style="display: flex; gap: 8px; flex-wrap: wrap;">' +
              '<button id="btn-guardar-monitoreo" class="btn-elite btn-primary">💾 Guardar Avance</button>' +
              '<button id="btn-exportar-excel" class="btn-elite btn-secondary">📊 Exportar a Excel (CSV)</button>' +
              '<button id="btn-exportar-json" class="btn-elite btn-outline">📥 Respaldo JSON</button>' +
              '<button id="btn-imprimir-carta" class="btn-elite btn-outline">🖨️ Imprimir Carta</button>' +
            '</div>' +
          '</div>' +

          '<!-- Guía e Instrucciones de Diligenciamiento de Monitoreo Semanal -->' +
          '<div class="accordion-item no-print" style="margin-bottom: 20px;">' +
            '<div class="accordion-header" style="background: var(--surface-hover);">' +
              '<span>ℹ️ Instrucciones de diligenciamiento y seguimiento semanal pedagógico</span>' +
              '<span class="chevron">▼</span>' +
            '</div>' +
            '<div class="accordion-body" style="font-size: 0.88rem; line-height: 1.6; display: block;">' +
              '<p style="margin-bottom: 8px;"><strong>1. ¿Cómo funciona el Monitoreo Semanal?:</strong> Cada fila representa una semana del plan curricular adaptado (16 semanas por ciclo). El sistema asigna automáticamente la rotación disciplinar (Lenguaje, Matemáticas, Ciencias Sociales y Ciencias Naturales), integrando la amenaza diagnosticada en el Módulo A y la didáctica según la matrícula de NNA.</p>' +
              '<p style="margin-bottom: 8px;"><strong>2. Registro de Estado y Trazabilidad:</strong> Seleccione en la columna <em>Estado</em> el nivel de alcance de la semana (<em>⚪ Sin iniciar, 🟡 En proceso, 🟢 Logrado, 🔴 Postergado</em>) e ingrese en <em>Observaciones / Evidencia</em> las acciones desarrolladas, bitácora de aula o ajustes requeridos.</p>' +
              '<p style="margin-bottom: 8px;"><strong>3. Guardar y Exportar:</strong> Haga clic en <strong>💾 Guardar Avance</strong> para registrar sus cambios localmente en su perfil. Puede descargar el reporte estructurado para Microsoft Excel con el botón <strong>📊 Exportar a Excel (CSV)</strong> o generar la copia oficial con <strong>🖨️ Imprimir Carta</strong>.</p>' +
              '<p style="margin-bottom: 0; color: var(--primary);"><strong>4. Validez SIEE / ETC:</strong> Este registro sirve como evidencia formal de continuidad pedagógica y flexibilización curricular para presentar ante directivos docentes y la Secretaría de Educación (ETC).</p>' +
            '</div>' +
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
                  '<th style="padding: 10px; width: 105px;">Fecha Est.</th>' +
                  '<th style="padding: 10px; width: 110px;">Área</th>' +
                  '<th style="padding: 10px;">Tarjeta de Acción Pedagógica Situada</th>' +
                  '<th style="padding: 10px; width: 145px;">Estado</th>' +
                  '<th style="padding: 10px; width: 220px;">Observaciones / Evidencia</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                semanas.map(function(s) {
                  return '<tr style="border-bottom: 1px solid var(--border-light);">' +
                    '<td style="padding: 10px; font-weight: 700; text-align: center;">Sem. ' + s.num + '</td>' +
                    '<td style="padding: 10px;">' + s.fecha + '</td>' +
                    '<td style="padding: 10px;"><span class="badge-pill badge-etapa2">' + s.areaNombre + '</span></td>' +
                    '<td style="padding: 10px; font-size: 0.84rem; line-height: 1.4;">' + s.tarjeta + '</td>' +
                    '<td style="padding: 10px;">' +
                    '<select class="select-elite select-avance" data-semana="' + s.num + '" style="padding: 6px;">' +
                      '<option value="⚪ Sin iniciar" ' + (s.avance === '⚪ Sin iniciar' ? 'selected' : '') + '>⚪ Sin iniciar</option>' +
                      '<option value="🟡 En proceso" ' + (s.avance === '🟡 En proceso' ? 'selected' : '') + '>🟡 En proceso</option>' +
                      '<option value="🟢 Logrado" ' + (s.avance === '🟢 Logrado' ? 'selected' : '') + '>🟢 Logrado</option>' +
                      '<option value="🔴 Postergado" ' + (s.avance === '🔴 Postergado' ? 'selected' : '') + '>🔴 Postergado</option>' +
                    '</select>' +
                    '</td>' +
                    '<td style="padding: 10px;">' +
                    '<input type="text" class="input-elite input-obs" data-semana="' + s.num + '" value="' + s.observaciones + '" placeholder="Logros / Evidencias" style="padding: 6px;">' +
                    '</td>' +
                  '</tr>';
                }).join('') +
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>';

      container.innerHTML = html;
      this.bindEvents(semanas);
    } catch (err) {
      console.error('Error rendering Monitoreo C:', err);
      var cElem = document.getElementById('modulo-c-content');
      if (cElem) {
        cElem.innerHTML = '<div class="card-elite" style="padding: 24px; color: #991b1b;">⚠️ Ocurrió un error al cargar el Módulo C. Por favor guarde su diagnóstico en el Módulo A y vuelva a intentarlo.</div>';
      }
    }
  },

  bindEvents: function(semanas) {
    var self = this;
    var btnGuardar = document.getElementById('btn-guardar-monitoreo');
    var btnImprimir = document.getElementById('btn-imprimir-carta');
    var btnExportarJSON = document.getElementById('btn-exportar-json');
    var btnExportarExcel = document.getElementById('btn-exportar-excel');

    if (btnGuardar) {
      btnGuardar.addEventListener('click', function() {
        var selects = document.querySelectorAll('.select-avance');
        var inputs = document.querySelectorAll('.input-obs');
        var user = (typeof AuthManager !== 'undefined' && AuthManager.getUserData) ? AuthManager.getUserData() : {};
        var monitoreo = (user && user.monitoreo) || {};

        selects.forEach(function(sel) {
          var sem = sel.getAttribute('data-semana');
          monitoreo[sem] = monitoreo[sem] || {};
          monitoreo[sem].avance = sel.value;
          monitoreo[sem].fechaRegistro = new Date().toLocaleString('es-CO');
        });

        inputs.forEach(function(inp) {
          var sem = inp.getAttribute('data-semana');
          monitoreo[sem] = monitoreo[sem] || {};
          monitoreo[sem].observaciones = inp.value;
        });

        if (typeof AuthManager !== 'undefined' && AuthManager.saveUserData) {
          AuthManager.saveUserData('monitoreo', monitoreo);
        }
        alert('✅ Registro de Monitoreo Semanal guardado exitosamente con trazabilidad temporal.');
        self.renderMonitoreo();
      });
    }

    if (btnExportarExcel) {
      btnExportarExcel.addEventListener('click', function() {
        var user = (typeof AuthManager !== 'undefined' && AuthManager.getUserData) ? AuthManager.getUserData() : {};
        var d = (user && user.diagnostico) || {};
        var savedMonitoreo = (user && user.monitoreo) || {};

        var rows = [
          ['HERRAMIENTA DE ADAPTACIÓN Y FLEXIBILIZACIÓN CURRICULAR EN EMERGENCIAS - NRC / MEN'],
          ['Docente:', (user && user.nombreCompleto) || 'Docente NRC', 'Institución:', (user && user.institucion) || 'IE Rural', 'Ciclo:', 'Ciclo ' + (d.ciclo || '3')],
          ['Etapa Emergencia:', d.etapa || '', 'Amenaza:', d.amenaza || '', 'Fecha Inicio:', d.fechaInicio || ''],
          [''],
          ['Semana', 'Fecha Estimada', 'Área Curricular', 'Tarjeta de Acción Pedagógica Situada', 'Estado / Avance', 'Observaciones / Evidencias', 'Fecha Registro']
        ];

        (semanas || []).forEach(function(s) {
          var mon = savedMonitoreo[s.num] || {};
          rows.push([
            'Semana ' + s.num,
            s.fecha,
            s.areaNombre,
            s.tarjetaPlana || '',
            mon.avance || s.avance || '⚪ Sin iniciar',
            mon.observaciones || s.observaciones || '',
            mon.fechaRegistro || ''
          ]);
        });

        var csvContent = '﻿' + rows.map(function(e) {
          return e.map(function(item) {
            var str = String(item || '').replace(/"/g, '""');
            return '"' + str + '"';
          }).join(';');
        }).join(String.fromCharCode(13, 10));

        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'monitoreo_curricular_nrc_' + ((user && user.nombreCompleto) || 'docente').replace(/\s+/g, '_') + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }

    if (btnExportarJSON) {
      btnExportarJSON.addEventListener('click', function() {
        var data = (typeof AuthManager !== 'undefined' && AuthManager.getUserData) ? AuthManager.getUserData() : {};
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        var downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "bitacora_nrc_" + ((data && data.nombreCompleto) || 'docente').replace(/\s+/g, '_') + ".json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      });
    }

    if (btnImprimir) {
      btnImprimir.addEventListener('click', function() {
        window.print();
      });
    }
  }
};
