// Módulo B: Rayuela Curricular (Biblioteca de Planificación Curricular y Mallas Priorizadas)
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
        type: 'academic',
        factor: item[0] || 'Eje Curricular',
        subproceso: item[1] || '',
        dbaCode: dbaCode,
        dbaDesc: dbaDesc,
        complejidad: item[4] || 'Intermedia',
        bloom: item[5] || 'Aplicar y contextualizar en el entorno',
        didactica: item[7] || item[6] || 'Taller situado y pedagógico de aula'
      };
    } else if (item && typeof item === 'object') {
      // Habilidades Socioemocionales y de Vida
      if (item.dimension || (item.habilidad && item.saber)) {
        return {
          type: 'socioemocional',
          dimension: item.dimension || item.saber || 'Personal-Emocional',
          etapa: item.etapa || 'Etapa 1. Recreativa y preparatoria',
          habilidad: item.habilidad || item.hacer || 'Competencia para la vida y bienestar',
          objetivo_bloom: item.objetivo_bloom || 'Identificar y gestionar emociones básicas en situaciones cotidianas.',
          proceso_bloom: item.proceso_bloom || 'Comprender + Aplicar',
          contenido: item.contenido || '• Autoconocimiento y contención emocional.\n• Técnicas de respiración y calma.',
          evidencia_conmigo: item.evidencia_conmigo || 'Describe sus emociones y necesidades con tranquilidad.',
          evidencia_otro: item.evidencia_otro || 'Escucha y apoya a sus compañeros en momentos de tensión.',
          evidencia_entorno: item.evidencia_entorno || 'Participa en espacios seguros de cuidado mutuo.'
        };
      }
      // Aprendizajes de Supervivencia y Protección (WASH / ERM)
      if (item.tipo_riesgo || item.afectacion || (item.tipo_afectacion && item.aprendizaje)) {
        return {
          type: 'supervivencia',
          tipo_riesgo: (item.tipo_riesgo || item.tipo_afectacion || 'Riesgos físicos y ambientales').replace(/_/g, ' '),
          afectacion: item.afectacion || item.aprendizaje || 'Protección y autocuidado',
          aprendizaje_clave: item.aprendizaje_clave || item.riesgo || 'Adopta conductas seguras y reconoce rutas de protección escolar.',
          objetivo_aprendizaje: item.objetivo_aprendizaje || item.miniproyecto || 'Identificar riesgos en el entorno y aplicar medidas básicas de autoprotección.',
          proceso_bloom: item.proceso_bloom || 'Comprender + Aplicar',
          contenido: item.contenido || '• Protocolos seguros de evacuación y alertas tempranas.\n• Rutas de protección institucional.',
          miniproyecto: item.miniproyecto || 'Mapa escolar de riesgos y protocolos seguros',
          desafio: item.desafio || 'Diseñar un plan de acción de aula para emergencias'
        };
      }
      return {
        type: 'academic',
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

    var habsList = (HABS_SUPS_DB && HABS_SUPS_DB.habilidades) || [];
    var supsList = (HABS_SUPS_DB && HABS_SUPS_DB.supervivencia) || [];

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

    // Encabezados dinámicos según el tipo de área (Títulos estrictos según normativa y hoja Monitoreo)
    var theadHTML = '';
    if (this.currentArea === 'socioemocional') {
      theadHTML = 
        '<tr style="background: var(--surface-hover); text-align: left;">' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 22%;">Dimensión & Etapa de Respuesta</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 34%;">Habilidad & Objetivo de Aprendizaje (Bloom)</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 18%;">Proceso Cognitivo (Bloom)</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 26%;">Contenido de Aprendizaje & Evidencias Clave</th>' +
        '</tr>';
    } else if (this.currentArea === 'supervivencia') {
      theadHTML = 
        '<tr style="background: var(--surface-hover); text-align: left;">' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 22%;">Tipología de Riesgo & Afectación</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 34%;">Aprendizaje Clave & Objetivo de Protección</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 18%;">Proceso Cognitivo (Bloom)</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 26%;">Mini-Proyecto Situado & Desafío</th>' +
        '</tr>';
    } else {
      theadHTML = 
        '<tr style="background: var(--surface-hover); text-align: left;">' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 22%;">Factor / Eje</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 32%;">DBA / Aprendizaje Esencial</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 20%;">Complejidad & Bloom</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 26%;">Didáctica Situada / Mini-Proyecto</th>' +
        '</tr>';
    }

    // Filas dinámicas según el tipo de área
    var tbodyHTML = validItems.map(function(item) {
      if (item.type === 'socioemocional') {
        var contenidoLimpio = (item.contenido || '').replace(/\n/g, '<br>');
        return '<tr style="border-bottom: 1px solid var(--border-light);">' +
          '<td style="padding: 10px; vertical-align: top;">' +
            '<strong style="color:var(--primary-dark);">' + item.dimension + '</strong><br>' +
            '<small style="color: var(--text-muted); line-height: 1.35; display:inline-block; margin-top:3px;">' + item.etapa + '</small>' +
          '</td>' +
          '<td style="padding: 10px; vertical-align: top;">' +
            '<span class="badge-pill" style="background:#ecfdf5; color:#065f46; font-weight:700;">🌱 ' + item.habilidad + '</span><br>' +
            '<span style="line-height:1.45; display:inline-block; margin-top:5px;">' + (item.objetivo_bloom || item.habilidad) + '</span>' +
          '</td>' +
          '<td style="padding: 10px; vertical-align: top;">' +
            '<span class="badge-pill badge-etapa2">' + (item.proceso_bloom || 'Aplicar') + '</span>' +
          '</td>' +
          '<td style="padding: 10px; vertical-align: top; font-size: 0.83rem; line-height: 1.4;">' +
            '<div style="background:#f8fafc; padding:6px 8px; border-radius:4px; margin-bottom:4px;">' +
              '<strong>📚 Contenido:</strong><br>' + contenidoLimpio +
            '</div>' +
            (item.evidencia_conmigo ? '<strong style="color:var(--primary);">🎯 Evidencia:</strong> <em>' + item.evidencia_conmigo + '</em>' : '') +
          '</td>' +
        '</tr>';
      } else if (item.type === 'supervivencia') {
        return '<tr style="border-bottom: 1px solid var(--border-light);">' +
          '<td style="padding: 10px; vertical-align: top;">' +
            '<strong style="color:#b91c1c;">🛡️ ' + item.tipo_riesgo + '</strong><br>' +
            '<span class="badge-pill" style="background:#fee2e2; color:#991b1b; margin-top:3px;">' + item.afectacion + '</span>' +
          '</td>' +
          '<td style="padding: 10px; vertical-align: top;">' +
            '<span style="color:var(--text-muted); font-size:0.82rem; display:block; margin-bottom:3px;">' + item.aprendizaje_clave + '</span>' +
            '<strong style="color:var(--text-main); line-height:1.4; display:inline-block;">' + (item.objetivo_aprendizaje || item.aprendizaje_clave) + '</strong>' +
          '</td>' +
          '<td style="padding: 10px; vertical-align: top;">' +
            '<span class="badge-pill badge-etapa1">' + (item.proceso_bloom || 'Comprender + Aplicar') + '</span>' +
          '</td>' +
          '<td style="padding: 10px; vertical-align: top; line-height: 1.4;">' +
            '<strong style="color: var(--primary); display:block;">🛠️ ' + item.miniproyecto + '</strong>' +
            (item.desafio ? '<span style="color: var(--text-muted); font-size: 0.82rem; display:block; margin-top:4px;"><strong>Desafío:</strong> ' + item.desafio + '</span>' : '') +
          '</td>' +
        '</tr>';
      } else {
        // Áreas académicas regulares (Lenguaje, Matemáticas, Sociales, Naturales)
        return '<tr style="border-bottom: 1px solid var(--border-light);">' +
          '<td style="padding: 10px; vertical-align: top;"><strong>' + item.factor + '</strong><br><small style="color: var(--text-muted);">' + item.subproceso + '</small></td>' +
          '<td style="padding: 10px; vertical-align: top;"><span class="badge-pill" style="background:#e0f2fe; color:#0369a1; font-weight:700;">' + item.dbaCode + '</span><br><span style="line-height:1.45; display:inline-block; margin-top:4px;">' + item.dbaDesc + '</span></td>' +
          '<td style="padding: 10px; vertical-align: top;"><span class="badge-pill badge-etapa2">' + item.complejidad + '</span><br><small style="color: var(--text-muted); line-height:1.4; display:inline-block; margin-top:4px;">' + item.bloom + '</small></td>' +
          '<td style="padding: 10px; vertical-align: top; color: var(--primary);"><strong>🛠️ ' + item.didactica + '</strong></td>' +
        '</tr>';
      }
    }).join('');

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
            '<thead>' + theadHTML + '</thead>' +
            '<tbody>' + tbodyHTML + '</tbody>' +
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
