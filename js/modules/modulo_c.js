// Módulo C: Monitoreo Semanal por Etapas
var ModuloC = {
  init: function() {
    this.renderMonitoreo();
  },

  renderMonitoreo: function() {
    var self = this;
    var user = AuthManager.getUserData();
    var d = user ? user.diagnostico : null;
    if (!d) {
      d = {
        ciclo: '3',
        grado: 'Grado 6°',
        nna: 25,
        didacticaNNA: '👥 TRABAJO COOPERATIVO (15 a 35 NNA)',
        etapa: 'ETAPA 2: Recuperación temprana / Lúdica',
        categoriaAmenaza: 'NATURAL',
        amenaza: 'Inundación',
        riesgosIE: 'Afectación de aulas y pérdida de material',
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

    for (var i = 1; i <= 16; i++) {
      var fechaSem = new Date(fechaBase);
      fechaSem.setDate(fechaBase.getDate() + (i - 1) * 7);

      var areaKey = areas[(i - 1) % areas.length];
      var items = cicloData[areaKey] || [];
      var item = items[(i - 1) % (items.length || 1)] || { dba_code: 'DBA-1', dba_desc: 'Aprendizaje prioritario' };

      semanas.push({
        num: i,
        fecha: fechaSem.toLocaleDateString('es-CO'),
        etapa: d.etapa,
        areaKey: areaKey,
        areaNombre: areaKey.toUpperCase(),
        tarjeta: '🎓 ' + d.grado + ' | ' + d.didacticaNNA + ' [' + d.categoriaAmenaza + ' - ' + (d.riesgosIE || 'Riesgo escolar') + '] 🛠️ Didáctica: ' + (item.didactica || 'Taller situado') + ' -> 🎯 Desafío Bloom: ' + (item.bloom || 'Aplicar y reflexionar'),
        avance: savedMonitoreo[i] ? savedMonitoreo[i].avance : '⚪ Sin iniciar',
        observaciones: savedMonitoreo[i] ? savedMonitoreo[i].observaciones : ''
      });
    }

    var logrados = Object.values(savedMonitoreo).filter(function(x) { return x.avance && x.avance.indexOf('Logrado') !== -1; }).length;
    var enProceso = Object.values(savedMonitoreo).filter(function(x) { return x.avance && x.avance.indexOf('proceso') !== -1; }).length;
    var sinIniciar = semanas.length - logrados - enProceso;
    var pctAvance = Math.round((logrados / semanas.length) * 100);

    var html = 
      '<div class="card-elite">' +
        '<div class="card-header">' +
          '<div>' +
            '<h3 class="card-title">📋 Monitoreo Semanal por Etapas (Ciclo ' + cicloKey + ')</h3>' +
            '<span style="font-size: 0.85rem; color: var(--text-muted);">Docente: ' + ((user && user.nombreCompleto) || 'Docente NRC') + ' | Institución: ' + ((user && user.institucion) || 'IE Rural') + '</span>' +
          '</div>' +
          '<div style="display: flex; gap: 10px;">' +
            '<button id="btn-guardar-monitoreo" class="btn-elite btn-primary">💾 Guardar Avance</button>' +
            '<button id="btn-exportar-json" class="btn-elite btn-outline">📥 Exportar Bitácora</button>' +
            '<button id="btn-imprimir-carta" class="btn-elite btn-secondary">🖨️ Imprimir Carta</button>' +
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
    this.bindEvents();
  },

  bindEvents: function() {
    var self = this;
    var btnGuardar = document.getElementById('btn-guardar-monitoreo');
    var btnImprimir = document.getElementById('btn-imprimir-carta');
    var btnExportar = document.getElementById('btn-exportar-json');

    if (btnGuardar) {
      btnGuardar.addEventListener('click', function() {
        var selects = document.querySelectorAll('.select-avance');
        var inputs = document.querySelectorAll('.input-obs');
        var monitoreo = {};

        selects.forEach(function(sel) {
          var sem = sel.getAttribute('data-semana');
          monitoreo[sem] = monitoreo[sem] || {};
          monitoreo[sem].avance = sel.value;
        });

        inputs.forEach(function(inp) {
          var sem = inp.getAttribute('data-semana');
          monitoreo[sem] = monitoreo[sem] || {};
          monitoreo[sem].observaciones = inp.value;
        });

        AuthManager.saveUserData('monitoreo', monitoreo);
        alert('✅ Registro de Monitoreo Semanal guardado exitosamente.');
        self.renderMonitoreo();
      });
    }

    if (btnExportar) {
      btnExportar.addEventListener('click', function() {
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
  }
};
