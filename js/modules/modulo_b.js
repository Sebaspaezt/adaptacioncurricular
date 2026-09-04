// Módulo B: Rayuela Curricular (Biblioteca de Planificación)
var ModuloB = {
  currentArea: 'lenguaje',

  init: function() {
    this.renderRayuela();
  },

  getItemFields: function(item, areaKey) {
    areaKey = areaKey || this.currentArea;
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
        saber: item[6] || '',
        hacer: item[7] || '',
        ser: item[8] || '',
        didactica: item[7] || item[6] || 'Taller situado y pedagógico de aula'
      };
    } else if (item && typeof item === 'object') {
      if (areaKey === 'socioemocional' || (item.habilidad && item.saber && item.hacer)) {
        if (item.habilidad && (item.habilidad.indexOf('Etapa de respuesta') !== -1 || (item.hacer && item.hacer.indexOf('=SUBTOTAL') !== -1))) {
          return null;
        }
        return {
          factor: item.habilidad ? ('🏷️ ' + item.habilidad.trim()) : 'Dimensión Socioemocional',
          subproceso: item.saber ? ('🎯 Dimensión: ' + item.saber) : '',
          dbaCode: 'SOCIOEMOCIONAL',
          dbaDesc: item.hacer || 'Competencia para la vida y bienestar integral',
          complejidad: 'Transversal',
          bloom: 'Autorregulación y empatía',
          saber: 'Conmigo mismo: Autoconocimiento y gestión emocional',
          hacer: 'Con el otro: Empatía, diálogo y resolución pacífica',
          ser: 'Con el entorno: Convivencia y resiliencia colectiva',
          didactica: 'Círculos de palabra y kit de contención socioemocional'
        };
      }
      if (areaKey === 'supervivencia' || (item.tipo_afectacion && item.aprendizaje)) {
        if (item.tipo_afectacion && (item.tipo_afectacion.indexOf('Tipologías') !== -1 || (item.aprendizaje && item.aprendizaje.indexOf('=SUBTOTAL') !== -1))) {
          return null;
        }
        var tipologiaLabel = (item.tipo_afectacion || 'Riesgo').replace(/_/g, ' ');
        return {
          factor: '🛡️ ' + tipologiaLabel,
          subproceso: item.aprendizaje ? ('🔍 Foco de Riesgo: ' + item.aprendizaje) : '',
          dbaCode: 'ERM / WASH',
          dbaDesc: item.riesgo || 'Protección escolar y salvaguarda de vidas',
          complejidad: 'Protección',
          bloom: item.miniproyecto || 'Identificar rutas seguras y protocolos de autocuidado',
          saber: 'Identificación temprana de señales de peligro',
          hacer: item.miniproyecto || 'Protocolos de autoprotección y rutas seguras',
          ser: 'Cuidado mutuo y cultura de prevención comunitaria',
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
        saber: item.saber || '',
        hacer: item.hacer || '',
        ser: item.ser || '',
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
      var parsed = self.getItemFields(item, self.currentArea);
      if (parsed) validItems.push(parsed);
    });

    // Determinar encabezados diferenciados según el tipo de área
    var isSocio = (this.currentArea === 'socioemocional');
    var isSuperv = (this.currentArea === 'supervivencia');

    var th1 = 'Factor / Eje (EBC)';
    var th2 = 'DBA / Aprendizaje Esencial (Articulación EBC-DBA)';
    var th3 = 'Complejidad & Bloom';
    var th4 = 'Didáctica Situada / Mini-Proyecto';

    if (isSocio) {
      th1 = '🌱 Dimensión & Etapa de Respuesta';
      th2 = 'Habilidad Clave & Competencia de Bienestar';
      th3 = 'Enfoque & Proceso Psicosocial';
      th4 = 'Didáctica de Contención Socioemocional';
    } else if (isSuperv) {
      th1 = '🛡️ Tipología de Riesgo & Afectación PGIRE';
      th2 = 'Aprendizaje Clave & Enfoque de Autoprotección';
      th3 = 'Complejidad de Seguridad & Desafío';
      th4 = 'Mini-Proyecto Situado & Protocolos de Aula';
    }

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
                '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 22%;">' + th1 + '</th>' +
                '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 34%;">' + th2 + '</th>' +
                '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 18%;">' + th3 + '</th>' +
                '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 26%;">' + th4 + '</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              validItems.map(function(item) {
                var badgeBg = '#e0f2fe';
                var badgeColor = '#0369a1';
                if (isSocio) {
                  badgeBg = '#dcfce7';
                  badgeColor = '#166534';
                } else if (isSuperv) {
                  badgeBg = '#fee2e2';
                  badgeColor = '#991b1b';
                }

                return '<tr style="border-bottom: 1px solid var(--border-light);">' +
                  '<td style="padding: 10px; vertical-align: top;">' +
                    '<strong>' + item.factor + '</strong>' +
                    (item.subproceso ? ('<br><small style="color: var(--text-muted); display:inline-block; margin-top:3px;">' + item.subproceso + '</small>') : '') +
                  '</td>' +
                  '<td style="padding: 10px; vertical-align: top;">' +
                    '<span class="badge-pill" style="background:' + badgeBg + '; color:' + badgeColor + '; font-weight:700;">' + item.dbaCode + '</span>' +
                    '<div style="line-height:1.45; margin-top:5px;">' + item.dbaDesc + '</div>' +
                  '</td>' +
                  '<td style="padding: 10px; vertical-align: top;">' +
                    '<span class="badge-pill badge-etapa2">' + item.complejidad + '</span>' +
                    '<br><small style="color: var(--text-muted); line-height:1.4; display:inline-block; margin-top:4px;">' + item.bloom + '</small>' +
                  '</td>' +
                  '<td style="padding: 10px; vertical-align: top; color: var(--primary);">' +
                    '<strong>🛠️ ' + item.didactica + '</strong>' +
                  '</td>' +
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
