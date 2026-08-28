// Módulo B: Rayuela Curricular (Biblioteca de Planificación)
var ModuloB = {
  currentArea: 'lenguaje',

  init: function() {
    this.renderRayuela();
  },

  renderRayuela: function() {
    var self = this;
    var user = AuthManager.getUserData();
    var d = user ? user.diagnostico : null;
    var cicloKey = String((d && d.ciclo) || '3');
    var cicloData = CURRICULUM_DB[cicloKey] || CURRICULUM_DB['3'] || {};

    var container = document.getElementById('modulo-b-content');
    if (!container) return;

    var areas = [
      { key: 'lenguaje', name: '📖 Lenguaje', count: (cicloData.lenguaje || []).length },
      { key: 'matematicas', name: '📐 Matemáticas', count: (cicloData.matematicas || []).length },
      { key: 'sociales', name: '🌍 Ciencias Sociales (MEN 2026)', count: (cicloData.sociales || []).length },
      { key: 'naturales', name: '🔬 Ciencias Naturales & WASH', count: (cicloData.naturales || []).length },
      { key: 'socioemocional', name: '🌱 Socioemocional & Vida', count: (HABS_SUPS_DB.habilidades || []).length },
      { key: 'supervivencia', name: '🛡️ Supervivencia & ERM', count: (HABS_SUPS_DB.supervivencia || []).length }
    ];

    var items = [];
    if (this.currentArea === 'socioemocional') {
      items = (HABS_SUPS_DB && HABS_SUPS_DB.habilidades) || [];
    } else if (this.currentArea === 'supervivencia') {
      items = (HABS_SUPS_DB && HABS_SUPS_DB.supervivencia) || [];
    } else {
      items = cicloData[this.currentArea] || [];
    }

    var html = 
      '<div class="card-elite">' +
        '<div class="card-header">' +
          '<div>' +
            '<h3 class="card-title">📚 Rayuela Curricular: Biblioteca de Mallas Priorizadas (Ciclo ' + cicloKey + ')</h3>' +
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
                '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 30%;">DBA / Aprendizaje Esencial</th>' +
                '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 20%;">Complejidad & Bloom</th>' +
                '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 28%;">Didáctica Situada / Mini-Proyecto</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              items.map(function(item) {
                var factorText = item.factor || item.eje || item.pensamiento || item.categoria || 'Eje';
                var subText = item.subproceso || item.habilidad || item.area || '';
                var dbaCode = item.dba_code || item.codigo || item.id || 'NÚCLEO';
                var dbaDesc = item.dba_desc || item.enunciado || item.descripcion || item.evidencia || '';
                var compl = item.complejidad || 'Intermedia';
                var bloomText = item.bloom || item.objetivo_bloom || 'Aplicar y reflexionar';
                var didact = item.didactica || item.miniproyecto || item.estrategia || 'Taller situado de aprendizaje';

                return '<tr style="border-bottom: 1px solid var(--border-light);">' +
                  '<td style="padding: 10px; vertical-align: top;"><strong>' + factorText + '</strong><br><small style="color: var(--text-muted);">' + subText + '</small></td>' +
                  '<td style="padding: 10px; vertical-align: top;"><span class="badge-pill" style="background:#e0f2fe; color:#0369a1;">' + dbaCode + '</span><br>' + dbaDesc + '</td>' +
                  '<td style="padding: 10px; vertical-align: top;"><span class="badge-pill badge-etapa2">' + compl + '</span><br>' + bloomText + '</td>' +
                  '<td style="padding: 10px; vertical-align: top; color: var(--primary);"><strong>🛠️ ' + didact + '</strong></td>' +
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
