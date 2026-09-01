// Módulo C: Monitoreo Semanal por Etapas (Integración Completa por Semanas, Persistencia con Marcas de Tiempo y Exportación Excel/JSON)
var ModuloC = {
  init: function() {
    this.renderMonitoreo();
  },

  getDidacticaStrategyForArea: function(areaKey, nnaCount) {
    var strategies = (CURRICULUM_DB && CURRICULUM_DB.situated_didactic_strategies) || {};
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
  },

  getSocioemocionalForWeek: function(weekNum, etapa) {
    var habs = (HABS_SUPS_DB && HABS_SUPS_DB.habilidades) || [];
    if (habs.length === 0) return { habilidad: 'Contención Socioemocional', dimension: 'Personal-Emocional' };
    
    // Filtrar según la etapa si es posible
    var etapaKey = (etapa || '').indexOf('ETAPA 1') !== -1 ? 'Etapa 1' :
                   (etapa || '').indexOf('ETAPA 3') !== -1 ? 'Etapa 3' : 'Etapa 2';

    var habsEtapa = habs.filter(function(h) { return (h.etapa || '').indexOf(etapaKey) !== -1; });
    if (habsEtapa.length === 0) habsEtapa = habs;

    var idx = (weekNum - 1) % habsEtapa.length;
    return habsEtapa[idx] || habs[0];
  },

  getSupervivenciaForWeek: function(weekNum, userDiagnostic) {
    var sups = (HABS_SUPS_DB && HABS_SUPS_DB.supervivencia) || [];
    if (sups.length === 0) return { miniproyecto: 'Protocolos seguros escolares', afectacion: 'Autoprotección' };

    // Buscar si hay recomendados para este diagnóstico
    var recomendados = sups.filter(function(item) {
      return ModuloB.isSurvivalRecommended(item, userDiagnostic);
    });

    var pool = recomendados.length > 0 ? recomendados : sups;
    var idx = (weekNum - 1) % pool.length;
    return pool[idx] || sups[0];
  },

  renderMonitoreo: function() {
    var self = this;
    var user = AuthManager.getUserData();
    var d = user ? user.diagnostico : null;
    if (!d) {
      d = {
        ciclo: '3',
        grado: 'Grado 6° (Bachillerato)',
        nna: 28,
        didacticaNNA: '👥 TRABAJO COOPERATIVO (15 a 35 NNA)',
        etapa: 'ETAPA 2: Recuperación temprana / Lúdica',
        categorias: ['NATURAL'],
        categoriaAmenaza: 'NATURAL',
        amenazas: ['Inundación'],
        amenaza: 'Inundación',
        ejemploIE: 'Afectación de aulas y pérdida de material',
        riesgosIE: 'Pérdida de continuidad académica y aislamiento de sedes',
        rutaGIRE: '🏙️ MTGIRE / UNGRD / CMGRD / CDGRD / Alcaldía',
        fechaInicio: new Date().toISOString().split('T')[0]
      };
    }

    var cicloKey = String(d.ciclo || '3');
    var cicloData = CURRICULUM_DB[cicloKey] || CURRICULUM_DB['3'] || {};
    var savedMonitoreo = (user && user.monitoreo) || {};

    var container = document.getElementById('modulo-c-content');
    if (!container) return;

    var semanas = [];
    var fechaBase = new Date(d.fechaInicio || new Date());
    var areas = ['lenguaje', 'matematicas', 'sociales', 'naturales'];

    var amenazasLabel = (d.amenazas && d.amenazas.length > 0) ? d.amenazas.join(' + ') : (d.amenaza || 'Emergencia territorial');
    var categoriasLabel = (d.categorias && d.categorias.length > 0) ? d.categorias.join(' / ') : (d.categoriaAmenaza || 'PGIRE');
    var riesgosLabel = d.riesgosIE ? d.riesgosIE.replace(/\n/g, ' | ') : 'Riesgo institucional';

    for (var i = 1; i <= 16; i++) {
      var fechaSem = new Date(fechaBase);
      fechaSem.setDate(fechaBase.getDate() + (i - 1) * 7);

      var areaKey = areas[(i - 1) % areas.length];
      var rawItems = cicloData[areaKey] || [];
      var rawItem = rawItems[Math.floor((i - 1) / areas.length) % (rawItems.length || 1)] || rawItems[0] || [];
      var parsedItem = ModuloB.getItemFields(rawItem) || {
        factor: 'Eje Curricular',
        subproceso: 'Contenido esencial',
        dbaCode: 'DBA',
        dbaDesc: 'Aprendizaje nuclear priorizado',
        complejidad: 'Intermedia',
        bloom: 'Aplicar y reflexionar',
        didactica: 'Taller situado de aprendizaje'
      };

      var didacticaEstrategia = self.getDidacticaStrategyForArea(areaKey, d.nna);
      var habSocio = self.getSocioemocionalForWeek(i, d.etapa);
      var supProt = self.getSupervivenciaForWeek(i, d);

      var tarjetaHTML = 
        '<div style="line-height:1.45;">' +
          '<strong>🎓 ' + (d.grado || ('Ciclo ' + cicloKey)) + ' | ' + (d.didacticaNNA || 'TRABAJO COOPERATIVO') + '</strong><br>' +
          '<span style="color:#b91c1c;">⚠️ [' + categoriasLabel + ' - ' + amenazasLabel + ']:</span> ' + riesgosLabel + '<br>' +
          '<span style="color:#0369a1;">📘 <strong>' + parsedItem.dbaCode + ':</strong> ' + parsedItem.subproceso + ' (' + parsedItem.dbaDesc + ')</span><br>' +
          '<span style="color:#047857;">🛠️ <strong>Didáctica Situada:</strong> ' + parsedItem.didactica + ' | <em>' + didacticaEstrategia + '</em></span><br>' +
          '<span style="color:#6b21a8;">🎯 <strong>Desafío Bloom:</strong> ' + parsedItem.bloom + '</span><br>' +
          '<span style="color:#065f46; font-size:0.83rem;">🌱 <strong>Socioemocional:</strong> ' + (habSocio.habilidad || 'Autocuidado y contención') + ' (' + (habSocio.dimension || 'DSE') + ')</span><br>' +
          '<span style="color:#991b1b; font-size:0.83rem;">🛡️ <strong>Protección WASH/ERM:</strong> ' + (supProt.miniproyecto || 'Mapas y protocolos seguros') + '</span>' +
        '</div>';

      var savedItem = savedMonitoreo[i] || {};
      semanas.push({
        num: i,
        fecha: fechaSem.toLocaleDateString('es-CO'),
        fechaRegistro: savedItem.fechaRegistro || 'Sin registrar',
        etapa: d.etapa,
        areaKey: areaKey,
        areaNombre: areaKey.toUpperCase(),
        tarjeta: tarjetaHTML,
        parsedItem: parsedItem,
        habSocio: habSocio,
        supProt: supProt,
        didacticaEstrategia: didacticaEstrategia,
        avance: savedItem.avance || '⚪ Sin iniciar',
        observaciones: savedItem.observaciones || ''
      });
    }

    var logrados = Object.values(savedMonitoreo).filter(function(x) { return x && x.avance && x.avance.indexOf('Logrado') !== -1; }).length;
    var enProceso = Object.values(savedMonitoreo).filter(function(x) { return x && x.avance && x.avance.indexOf('proceso') !== -1; }).length;
    var pctAvance = Math.round((logrados / semanas.length) * 100);

    var html = 
      '<div class="card-elite">' +
        '<!-- Encabezado Oficial Imprimible -->' +
        '<div class="print-only-header">' +
          '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">' +
            '<div>' +
              '<h2 style="font-size:12pt; font-weight:900; color:#005a36; margin:0;">CONSEJO NORUEGO PARA REFUGIADOS (NRC) & MINISTERIO DE EDUCACIÓN NACIONAL (MEN)</h2>' +
              '<p style="font-size:9.5pt; font-weight:700; color:#334155; margin:2px 0;">BITÁCORA OFICIAL DE MONITOREO Y FLEXIBILIZACIÓN CURRICULAR EN EMERGENCIAS (GIRE)</p>' +
            '</div>' +
            '<div style="text-align:right; font-size:8pt; color:#64748b;">' +
              '<span>Formato Oficial SIEE</span><br>' +
              '<span>Fecha Emisión: ' + new Date().toLocaleDateString('es-CO') + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; font-size:8pt; background:#f8fafc; padding:8px; border:1px solid #cbd5e1; border-radius:4px;">' +
            '<div><strong>Docente:</strong> ' + ((user && user.nombreCompleto) || 'Docente Territorial') + '</div>' +
            '<div><strong>Institución:</strong> ' + ((user && user.institucion) || 'I.E. Rural') + '</div>' +
            '<div><strong>Ciclo / Grado:</strong> Ciclo ' + cicloKey + ' - ' + d.grado + '</div>' +
            '<div><strong>Etapa Emergencia:</strong> ' + d.etapa + '</div>' +
            '<div><strong>Amenaza(s):</strong> ' + amenazasLabel + '</div>' +
            '<div><strong>Progreso SIEE:</strong> ' + pctAvance + '% Logrado (' + logrados + ' de ' + semanas.length + ' sem.)</div>' +
          '</div>' +
        '</div>' +

        '<div class="card-header no-print">' +
          '<div>' +
            '<h3 class="card-title">📋 Monitoreo Semanal por Etapas (Ciclo ' + cicloKey + ')</h3>' +
            '<span style="font-size: 0.85rem; color: var(--text-muted);">Docente: ' + ((user && user.nombreCompleto) || 'Docente NRC') + ' | Institución: ' + ((user && user.institucion) || 'IE Rural') + ' | Amenaza(s): ' + amenazasLabel + '</span>' +
          '</div>' +
          '<div style="display: flex; gap: 8px; flex-wrap: wrap;">' +
            '<button id="btn-guardar-monitoreo" class="btn-elite btn-primary">💾 Guardar Avance</button>' +
            '<button id="btn-exportar-csv" class="btn-elite btn-secondary" title="Descargar archivo estructurado que se abre directamente en Excel">📊 Exportar a Excel (CSV)</button>' +
            '<button id="btn-exportar-json" class="btn-elite btn-outline" title="Descargar respaldo técnico en JSON">📥 Respaldo JSON</button>' +
            '<button id="btn-imprimir-carta" class="btn-elite btn-outline">🖨️ Imprimir Carta</button>' +
          '</div>' +
        '</div>' +

        '<!-- Panel de Instrucciones para el Docente -->' +
        '<div class="no-print" style="background: #f0fdf4; border: 1.5px solid #86efac; border-left: 6px solid #16a34a; border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 22px;">' +
          '<h4 style="color: #15803d; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; font-size: 0.96rem;">' +
            '<span>💡</span> Instrucciones de Operación y Registro de Bitácora para el Docente' +
          '</h4>' +
          '<div class="grid-3" style="gap: 12px; font-size: 0.86rem; line-height: 1.45; color: #166534;">' +
            '<div style="background: #ffffff; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid #bbf7d0;">' +
              '<strong style="color: #15803d;">💾 Botón "Guardar Avance":</strong><br>' +
              'Es obligatorio hacer clic en este botón para registrar y guardar de forma segura en la plataforma sus calificaciones de avance, notas de evidencia y la fecha exacta del registro en aula.' +
            '</div>' +
            '<div style="background: #ffffff; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid #bbf7d0;">' +
              '<strong style="color: #15803d;">📊 Botón "Exportar a Excel (CSV)":</strong><br>' +
              'Descarga una hoja de cálculo estructurada con todas las columnas de la bitácora que <strong>se abre directamente con doble clic en Microsoft Excel</strong> o Google Sheets.' +
            '</div>' +
            '<div style="background: #ffffff; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid #bbf7d0;">' +
              '<strong style="color: #15803d;">🖨️ Botón "Imprimir Carta":</strong><br>' +
              'Genera la bitácora oficial en hoja tamaño Carta (<em>Letter</em>), lista para imprimir en físico o exportar como documento PDF oficial con firmas para acreditación en el SIEE.' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="grid-4" style="margin-bottom: 20px;">' +
          '<div style="background: var(--surface-hover); padding: 12px; border-radius: var(--radius-md); text-align: center;">' +
            '<div style="font-size: 0.78rem; color: var(--text-muted);">Progreso Logrado</div>' +
            '<div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">' + pctAvance + '%</div>' +
          '</div>' +
          '<div style="background: var(--color-etapa3-bg); padding: 12px; border-radius: var(--radius-md); text-align: center;">' +
            '<div style="font-size: 0.78rem; color: var(--color-etapa3);">🟢 Logrados</div>' +
            '<div style="font-size: 1.5rem; font-weight: 800; color: var(--color-etapa3);">' + logrados + '</div>' +
          '</div>' +
          '<div style="background: var(--color-etapa2-bg); padding: 12px; border-radius: var(--radius-md); text-align: center;">' +
            '<div style="font-size: 0.78rem; color: var(--color-etapa2);">🟡 En Proceso</div>' +
            '<div style="font-size: 1.5rem; font-weight: 800; color: var(--color-etapa2);">' + enProceso + '</div>' +
          '</div>' +
          '<div style="background: var(--color-blue-bg); padding: 12px; border-radius: var(--radius-md); text-align: center;">' +
            '<div style="font-size: 0.78rem; color: var(--color-blue);">Total Semanas Plan</div>' +
            '<div style="font-size: 1.5rem; font-weight: 800; color: var(--color-blue);">' + semanas.length + '</div>' +
          '</div>' +
        '</div>' +

        '<div style="overflow-x: auto;">' +
          '<table class="table-print" style="width: 100%; border-collapse: collapse; font-size: 0.86rem;">' +
            '<thead>' +
              '<tr style="background: var(--surface-hover); text-align: left;">' +
                '<th style="padding: 8px; width: 65px; text-align:center;">Semana</th>' +
                '<th style="padding: 8px; width: 85px;">Fecha Est.</th>' +
                '<th style="padding: 8px; width: 95px;">Área</th>' +
                '<th style="padding: 8px;">Tarjeta de Acción Pedagógica Situada (Curricular + Socioemocional + Protección)</th>' +
                '<th style="padding: 8px; width: 130px;">Estado de Avance</th>' +
                '<th style="padding: 8px; width: 210px;">Observaciones / Evidencias SIEE</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              semanas.map(function(s) {
                var fechaRegDisplay = s.fechaRegistro !== 'Sin registrar' ? '<div style="font-size:0.72rem; color:var(--text-muted); margin-top:4px;">⏱️ Guardado: ' + s.fechaRegistro + '</div>' : '';
                return '<tr style="border-bottom: 1px solid var(--border-light);">' +
                  '<td style="padding: 8px; font-weight: 700; text-align: center; vertical-align: top;">Sem. ' + s.num + '</td>' +
                  '<td style="padding: 8px; vertical-align: top;">' + s.fecha + '</td>' +
                  '<td style="padding: 8px; vertical-align: top;"><span class="badge-pill badge-etapa2">' + s.areaNombre + '</span></td>' +
                  '<td style="padding: 8px; font-size: 0.82rem; line-height: 1.4; vertical-align: top;">' + s.tarjeta + '</td>' +
                  '<td style="padding: 8px; vertical-align: top;">' +
                    '<select class="select-elite select-avance" data-semana="' + s.num + '" style="padding: 5px; font-size:0.84rem;">' +
                      '<option value="⚪ Sin iniciar" ' + (s.avance === '⚪ Sin iniciar' ? 'selected' : '') + '>⚪ Sin iniciar</option>' +
                      '<option value="🟡 En proceso" ' + (s.avance === '🟡 En proceso' ? 'selected' : '') + '>🟡 En proceso</option>' +
                      '<option value="🟢 Logrado" ' + (s.avance === '🟢 Logrado' ? 'selected' : '') + '>🟢 Logrado</option>' +
                      '<option value="🔴 Postergado" ' + (s.avance === '🔴 Postergado' ? 'selected' : '') + '>🔴 Postergado</option>' +
                    '</select>' +
                    fechaRegDisplay +
                  '</td>' +
                  '<td style="padding: 8px; vertical-align: top;">' +
                    '<input type="text" class="input-elite input-obs" data-semana="' + s.num + '" value="' + s.observaciones + '" placeholder="Logros / Evidencias SIEE" style="padding: 5px; font-size:0.84rem;">' +
                  '</td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table>' +
        '</div>' +

        '<!-- Bloque Oficial de Firmas para Impresión Carta -->' +
        '<div class="print-signatures-block">' +
          '<div class="signature-box">' +
            '<strong>' + ((user && user.nombreCompleto) || 'Docente Responsable') + '</strong><br>' +
            '<span>Docente Titular de Aula / Responsable de Emergencia</span>' +
          '</div>' +
          '<div class="signature-box">' +
            '<strong>Coordinación Académica / Rectoría</strong><br>' +
            '<span>' + ((user && user.institucion) || 'Institución Educativa') + ' (Validez Institucional SIEE)</span>' +
          '</div>' +
        '</div>' +
      '</div>';

    container.innerHTML = html;
    this.bindEvents(semanas);
  },

  bindEvents: function(semanas) {
    var self = this;
    var btnGuardar = document.getElementById('btn-guardar-monitoreo');
    var btnImprimir = document.getElementById('btn-imprimir-carta');
    var btnExportarCsv = document.getElementById('btn-exportar-csv');
    var btnExportarJson = document.getElementById('btn-exportar-json');

    if (btnGuardar) {
      btnGuardar.addEventListener('click', function() {
        var user = AuthManager.getUserData();
        var savedMonitoreo = (user && user.monitoreo) || {};
        var selects = document.querySelectorAll('.select-avance');
        var inputs = document.querySelectorAll('.input-obs');
        var nowStr = new Date().toLocaleString('es-CO');

        selects.forEach(function(sel) {
          var sem = sel.getAttribute('data-semana');
          savedMonitoreo[sem] = savedMonitoreo[sem] || {};
          savedMonitoreo[sem].avance = sel.value;
          savedMonitoreo[sem].fechaRegistro = nowStr;
        });

        inputs.forEach(function(inp) {
          var sem = inp.getAttribute('data-semana');
          savedMonitoreo[sem] = savedMonitoreo[sem] || {};
          savedMonitoreo[sem].observaciones = inp.value;
        });

        AuthManager.saveUserData('monitoreo', savedMonitoreo);
        alert('✅ Registro de Monitoreo Semanal guardado exitosamente con marca de tiempo.');
        self.renderMonitoreo();
      });
    }

    if (btnExportarCsv) {
      btnExportarCsv.addEventListener('click', function() {
        self.exportToCsv(semanas);
      });
    }

    if (btnExportarJson) {
      btnExportarJson.addEventListener('click', function() {
        var data = AuthManager.getUserData();
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        var downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "bitacora_nrc_" + (data.nombreCompleto || 'docente').replace(/\s+/g, '_') + ".json");
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
  },

  exportToCsv: function(semanas) {
    var user = AuthManager.getUserData();
    var d = user ? user.diagnostico : {};

    // Encabezados CSV con delimitador punto y coma (Estándar Excel en español)
    var headers = [
      "Semana",
      "Fecha Estimada",
      "Fecha Registro Aula",
      "Área Curricular",
      "Grado Escolar",
      "Estrategia NNA",
      "Amenazas PGIRE",
      "Código DBA",
      "Aprendizaje Nuclear",
      "Didáctica Situada",
      "Desafío Bloom",
      "Habilidad Socioemocional",
      "Mini-Proyecto Supervivencia",
      "Estado de Avance",
      "Observaciones y Evidencias SIEE"
    ];

    var rows = semanas.map(function(s) {
      return [
        '"Sem. ' + s.num + '"',
        '"' + s.fecha + '"',
        '"' + (s.fechaRegistro || 'Sin registrar') + '"',
        '"' + s.areaNombre + '"',
        '"' + (d.grado || 'Ciclo ' + (d.ciclo || '3')) + '"',
        '"' + (d.didacticaNNA || '') + '"',
        '"' + ((d.amenazas || [d.amenaza || '']).join(' + ')) + '"',
        '"' + (s.parsedItem.dbaCode || '') + '"',
        '"' + (s.parsedItem.subproceso || s.parsedItem.dbaDesc || '').replace(/"/g, '""') + '"',
        '"' + (s.parsedItem.didactica || '').replace(/"/g, '""') + '"',
        '"' + (s.parsedItem.bloom || '').replace(/"/g, '""') + '"',
        '"' + (s.habSocio.habilidad || '').replace(/"/g, '""') + '"',
        '"' + (s.supProt.miniproyecto || '').replace(/"/g, '""') + '"',
        '"' + (s.avance || '') + '"',
        '"' + (s.observaciones || '').replace(/"/g, '""') + '"'
      ].join(';');
    });

    var csvContent = "\uFEFF" + headers.join(';') + "\r\n" + rows.join("\r\n");
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", "bitacora_monitoreo_nrc_" + (user.nombreCompleto || 'docente').replace(/\s+/g, '_') + ".csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  }
};
