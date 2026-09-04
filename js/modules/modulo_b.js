// Módulo B: Rayuela Curricular (Biblioteca de Planificación)
var ModuloB = {
  currentArea: 'lenguaje',

  init: function() {
    this.renderRayuela();
  },

  getItemFields: function(item, areaKey) {
    areaKey = areaKey || this.currentArea;
    if (!item) return null;
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

  buildAreaTableHTML: function(areaKey, cicloData, habsList, supsList) {
    var self = this;
    var rawItems = [];
    if (areaKey === 'socioemocional') {
      rawItems = habsList || [];
    } else if (areaKey === 'supervivencia') {
      rawItems = supsList || [];
    } else {
      rawItems = (cicloData && cicloData[areaKey]) || [];
    }

    var validItems = [];
    rawItems.forEach(function(item) {
      var parsed = self.getItemFields(item, areaKey);
      if (parsed) validItems.push(parsed);
    });

    var isSocio = (areaKey === 'socioemocional');
    var isSuperv = (areaKey === 'supervivencia');

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

    return '<table class="table-print" style="width: 100%; border-collapse: collapse; font-size: 0.86rem; margin-bottom: 24px;">' +
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
            badgeBg = '#fef3c7';
            badgeColor = '#92400e';
          } else if (isSuperv) {
            badgeBg = '#fee2e2';
            badgeColor = '#991b1b';
          }

          var articulacionHTML = '';
          if (!isSocio && !isSuperv) {
            articulacionHTML = '<div style="line-height:1.45; margin-top:5px; font-size: 0.88rem;">' +
              '<span class="badge-pill" style="background:' + badgeBg + '; color:' + badgeColor + '; font-weight:700; margin-bottom: 4px;">' + item.dbaCode + '</span> ' +
              '<span>' + item.dbaDesc + '</span>' +
              (item.subproceso ? ('<div style="color: var(--primary-dark); font-size: 0.8rem; margin-top: 4px; background: var(--primary-subtle); padding: 4px 8px; border-radius: 4px;"><strong>🔗 Articulación EBC-DBA:</strong> ' + item.subproceso + '</div>') : '') +
            '</div>';
          } else {
            articulacionHTML = '<span class="badge-pill" style="background:' + badgeBg + '; color:' + badgeColor + '; font-weight:700;">' + item.dbaCode + '</span>' +
              '<div style="line-height:1.45; margin-top:5px;">' + item.dbaDesc + '</div>';
          }

          return '<tr style="border-bottom: 1px solid var(--border-light);">' +
            '<td style="padding: 10px; vertical-align: top;">' +
              '<strong>' + item.factor + '</strong>' +
              (item.subproceso && (isSocio || isSuperv) ? ('<br><small style="color: var(--text-muted); display:inline-block; margin-top:3px;">' + item.subproceso + '</small>') : '') +
            '</td>' +
            '<td style="padding: 10px; vertical-align: top;">' +
              articulacionHTML +
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
    '</table>';
  },

  renderRayuela: function() {
    var self = this;
    var user = (typeof AuthManager !== 'undefined' && AuthManager.getUserData) ? AuthManager.getUserData() : null;
    var d = (typeof ModuloA !== 'undefined' && ModuloA.getLiveDiagnostic) ? ModuloA.getLiveDiagnostic() : (user ? user.diagnostico : null);
    var cicloKey = String((d && d.ciclo) || '3');
    var cicloData = (CURRICULUM_DB && CURRICULUM_DB[cicloKey]) || (CURRICULUM_DB && CURRICULUM_DB['3']) || {};

    var container = document.getElementById('modulo-b-content');
    if (!container) return;

    var habsList = ((HABS_SUPS_DB && HABS_SUPS_DB.habilidades) || []).filter(function(h) {
      return h && h.habilidad && h.habilidad.indexOf('Etapa de respuesta') === -1 && (!h.hacer || h.hacer.indexOf('=SUBTOTAL') === -1);
    });

    var supsList = ((HABS_SUPS_DB && HABS_SUPS_DB.supervivencia) || []).filter(function(s) {
      return s && s.tipo_afectacion && s.tipo_afectacion.indexOf('Tipologías') === -1 && (!s.aprendizaje || s.aprendizaje.indexOf('=SUBTOTAL') === -1);
    });

    var areas = [
      { key: 'lenguaje', name: '📖 Lenguaje', count: ((cicloData && cicloData.lenguaje) || []).length },
      { key: 'matematicas', name: '📐 Matemáticas', count: ((cicloData && cicloData.matematicas) || []).length },
      { key: 'sociales', name: '🌍 Ciencias Sociales (MEN 2026)', count: ((cicloData && cicloData.sociales) || []).length },
      { key: 'naturales', name: '🔬 Ciencias Naturales & WASH', count: ((cicloData && cicloData.naturales) || []).length },
      { key: 'socioemocional', name: '🌱 Socioemocional & Vida', count: habsList.length },
      { key: 'supervivencia', name: '🛡️ Supervivencia & ERM', count: supsList.length }
    ];

    var activeTableHTML = this.buildAreaTableHTML(this.currentArea, cicloData, habsList, supsList);

    var fullPrintHTML = areas.map(function(a, idx) {
      var tableHTML = self.buildAreaTableHTML(a.key, cicloData, habsList, supsList);
      var pageBreakClass = idx > 0 ? 'print-area-break' : '';
      return '<div class="print-area-section ' + pageBreakClass + '" style="margin-bottom: 28px;">' +
        '<h3 style="color: var(--primary); font-weight: 800; margin-bottom: 10px; border-bottom: 2px solid var(--primary); padding-bottom: 4px;">' +
          a.name + ' — Malla Curricular Priorizada (Ciclo ' + cicloKey + ')' +
        '</h3>' +
        tableHTML +
      '</div>';
    }).join('');

    var html = 
      '<div class="card-elite">' +
        '<div class="card-header">' +
          '<div>' +
            '<h3 class="card-title">📚 Rayuela Curricular: Mallas Priorizadas (Ciclo ' + cicloKey + ')</h3>' +
            '<span style="font-size: 0.85rem; color: var(--text-muted);">Grados: ' + (((cicloData && cicloData.grados) || []).join(', ')) + ' | Etapa activa: ' + ((d && d.etapa) || 'Etapa 2') + '</span>' +
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
        '<div class="no-print" style="overflow-x: auto;">' +
          activeTableHTML +
        '</div>' +
        '<div id="full-print-matrix-container" style="display: none;">' +
          '<div style="text-align: center; margin-bottom: 18px; border-bottom: 2px solid #005A36; padding-bottom: 10px;">' +
            '<h2 style="color: #005A36; font-size: 1.3rem; margin-bottom: 4px;">Malla Curricular Completa Flexibilizada en Emergencias</h2>' +
            '<p style="font-size: 0.85rem; color: #475569;">Ciclo ' + cicloKey + ' (' + (((cicloData && cicloData.grados) || []).join(', ')) + ') | Docente: ' + ((user && user.nombreCompleto) || 'Docente') + ' | Institución: ' + ((user && user.institucion) || 'IE Rural') + '</p>' +
          '</div>' +
          fullPrintHTML +
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
        var printContainer = document.getElementById('full-print-matrix-container');
        if (printContainer) {
          printContainer.style.display = 'block';
        }
        window.print();
        setTimeout(function() {
          if (printContainer) {
            printContainer.style.display = 'none';
          }
        }, 1000);
      });
    }
  }
};
