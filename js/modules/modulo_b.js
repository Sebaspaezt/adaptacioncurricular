// Módulo B: Rayuela Curricular (Biblioteca de Planificación)
var ModuloB = {
  currentArea: 'lenguaje',

  init: function() {
    this.renderRayuela();
  },

  getItemFields: function(item) {
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
        factor: item[0] || 'Eje Curricular',
        subproceso: item[1] || '',
        dbaCode: dbaCode,
        dbaDesc: dbaDesc,
        complejidad: item[4] || 'Intermedia',
        bloom: item[5] || 'Aplicar y contextualizar en el entorno',
        didactica: item[7] || item[6] || 'Taller situado y pedagógico de aula'
      };
    } else if (item && typeof item === 'object') {
      if (item.habilidad && item.saber && item.hacer) {
        if (item.habilidad.indexOf('Etapa de respuesta') !== -1 || (item.hacer && item.hacer.indexOf('=SUBTOTAL') !== -1)) {
          return null;
        }
        return {
          factor: item.saber || 'Dimensión Socioemocional',
          subproceso: item.hacer || '',
          dbaCode: 'SOCIOEMOCIONAL',
          dbaDesc: item.habilidad || 'Competencia para la vida y bienestar',
          complejidad: 'Transversal',
          bloom: 'Autorregulación y empatía',
          didactica: 'Círculos de palabra y kit de contención socioemocional'
        };
      }
      if (item.tipo_afectacion && item.aprendizaje) {
        if (item.tipo_afectacion.indexOf('Tipologías') !== -1 || (item.aprendizaje && item.aprendizaje.indexOf('=SUBTOTAL') !== -1)) {
          return null;
        }
        return {
          factor: (item.tipo_afectacion || '').replace(/_/g, ' '),
          subproceso: item.aprendizaje || '',
          dbaCode: 'ERM / WASH',
          dbaDesc: item.riesgo || item.aprendizaje || 'Protección y autocuidado',
          complejidad: 'Protección',
          bloom: 'Identificar rutas y autocuidado',
          didactica: item.miniproyecto || 'Protocolos seguros y mapas de riesgo escolar'
        };
      }
      return {
        factor: item.factor || item.eje || item.pensamiento || item.area || 'Eje Curricular',
        subproceso: item.subproceso || item.habilidad || '',
        dbaCode: item.dba_code || item.codigo || item.id || item.codigo_oficial || 'DBA OFICIAL',
        dbaDesc: item.dba_desc || item.enunciado || item.descripcion || item.evidencia || '',
        complejidad: item.complejidad || 'Intermedia',
        bloom: item.bloom || item.objetivo_bloom || 'Aplicar y reflexionar',
        didactica: item.didactica || item.miniproyecto || item.estrategia || 'Taller situado de aprendizaje'
      };
    }
    return null;
  },

  renderRayuela: function() {
    var self = this;
    var user = AuthManager.getUserData();
    var d = user ? user.diagnostico : null;
    var cicloKey = String((d && d.ciclo) || '3');
    var cicloData = CURRICULUM_DB[cicloKey] || CURRICULUM_DB['3'] || {};

    var container = document.getElementById('modulo-b-content');
    if (!container) return;

    var habsList = ((HABS_SUPS_DB && HABS_SUPS_DB.habilidades) || []).filter(function(h) {
      return h && h.habilidad && h.habilidad.indexOf('Etapa de respuesta') === -1 && (!h.hacer || h.hacer.indexOf('=SUBTOTAL') === -1);
    });

    var supsList = ((HABS_SUPS_DB && HABS_SUPS_DB.supervivencia) || []).filter(function(s) {
      return s && s.tipo_afectacion && s.tipo_afectacion.indexOf('Tipologías') === -1 && (!s.aprendizaje || s.aprendizaje.indexOf('=SUBTOTAL') === -1);
    });

    var areas = [
      { key: 'lenguaje', name: '📖 Lenguaje', count: (cicloData.lenguaje || []).length },
      { key: 'matematicas', name: '📐 Matemáticas', count: (cicloData.matematicas || []).length },
      { key: 'sociales', name: '🌍 Ciencias Sociales (MEN 2026)', count: (cicloData.sociales || []).length },
      { key: 'naturales', name: '🔬 Ciencias Naturales & WASH', count: (cicloData.naturales || []).length },
      { key: 'socioemocional', name: '🌱 Socioemocional & Vida', count: habsList.length },
      { key: 'supervivencia', name: '🛡️ Supervivencia & ERM', count: supsList.length }
    ];

    var rawItems = [];
    if (this.currentArea === 'socioemocional') {
      rawItems = habsList;
    } else if (this.currentArea === 'supervivencia') {
      rawItems = supsList;
    } else {
      rawItems = cicloData[this.currentArea] || [];
    }

    var validItems = [];
    rawItems.forEach(function(item) {
      var parsed = self.getItemFields(item);
      if (parsed) validItems.push(parsed);
    });

    var html = 
      '<div class="card-elite">' +
        '<div class="card-header">' +
          '<div>' +
            '<h3 class="card-title">📚 Rayuela Curricular: Mallas Priorizadas (Ciclo ' + cicloKey + ')</h3>' +
            '<span style="font-size: 0.85rem; color: var(--text-muted);">Grados: ' + ((cicloData.grados || []).join(', ')) + ' | Etapa activa: ' + ((d && d.etapa) || 'Etapa 2') + '</span>' +
          '</div>' +
          '<div style="display: flex; gap: 8px;">' +
            '<button id="btn-imprimir-rayuela" class="btn-elite btn-outline">🖨️ Imprimir Malla</button>' +
          '</div>' +
        '</div>' +
        '<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;" class="no-print">' +
          areas.map(function(a) {
            var activeClass = self.currentArea === a.key ? 'btn-primary' : 'btn-outline';
            return '<button class="btn-elite ' + activeClass + ' tab-area-btn" data-area="' + a.key + '">' +
              a.name + ' (' + a.count + ')' +
            '</button>';
          }).join('') +
        '</div>' +
        '<div style="overflow-x: auto;">' +
          '<table class="table-print" style="width: 100%; border-collapse: collapse; font-size: 0.86rem;">' +
            '<thead>' +
              '<tr style="background: var(--surface-hover); text-align: left;">' +
                '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 22%;">Factor / Eje</th>' +
                '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 32%;">DBA / Aprendizaje Esencial</th>' +
                '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 20%;">Complejidad & Bloom</th>' +
                '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 26%;">Didáctica Situada / Mini-Proyecto</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              validItems.map(function(item) {
                return '<tr style="border-bottom: 1px solid var(--border-light);">' +
                  '<td style="padding: 10px; vertical-align: top;"><strong>' + item.factor + '</strong><br><small style="color: var(--text-muted);">' + item.subproceso + '</small></td>' +
                  '<td style="padding: 10px; vertical-align: top;"><span class="badge-pill" style="background:#e0f2fe; color:#0369a1; font-weight:700;">' + item.dbaCode + '</span><br><span style="line-height:1.45; display:inline-block; margin-top:4px;">' + item.dbaDesc + '</span></td>' +
                  '<td style="padding: 10px; vertical-align: top;"><span class="badge-pill badge-etapa2">' + item.complejidad + '</span><br><small style="color: var(--text-muted); line-height:1.4; display:inline-block; margin-top:4px;">' + item.bloom + '</small></td>' +
                  '<td style="padding: 10px; vertical-align: top; color: var(--primary);"><strong>🛠️ ' + item.didactica + '</strong></td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';

    container.innerHTML = html;

    // Eventos
    var areaButtons = container.querySelectorAll('.tab-area-btn');
    areaButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        self.currentArea = btn.getAttribute('data-area');
        self.renderRayuela();
      });
    });

    var btnPrint = document.getElementById('btn-imprimir-rayuela');
    if (btnPrint) {
      btnPrint.addEventListener('click', function() {
        window.print();
      });
    }
  }
};
