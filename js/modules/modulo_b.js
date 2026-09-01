// Módulo B: Rayuela Curricular (Biblioteca de Planificación Curricular y Mallas Priorizadas)
var ModuloB = {
  currentArea: 'lenguaje',
  filterRecommendedOnly: false,

  init: function() {
    this.renderRayuela();
  },

  isSurvivalRecommended: function(item, userDiagnostic) {
    if (!userDiagnostic) return false;
    var cats = userDiagnostic.categorias || [userDiagnostic.categoriaAmenaza || ''];
    var ams = userDiagnostic.amenazas || [userDiagnostic.amenaza || ''];
    var catsStr = cats.join(' ').toUpperCase();
    var amsStr = ams.join(' ').toUpperCase();
    var afectacion = (item.afectacion || item.aprendizaje || '').toUpperCase();
    var tipoRiesgo = (item.tipo_riesgo || item.tipo_afectacion || '').toUpperCase();

    if (catsStr.indexOf('CONFLICTO') !== -1 || catsStr.indexOf('PROTECCIÓN') !== -1 || amsStr.indexOf('ARMADO') !== -1 || amsStr.indexOf('MINAS') !== -1 || amsStr.indexOf('MAP') !== -1 || amsStr.indexOf('CONFINAMIENTO') !== -1) {
      if (afectacion.indexOf('MINAS') !== -1 || afectacion.indexOf('ARMADOS') !== -1 || afectacion.indexOf('SEXUAL') !== -1 || afectacion.indexOf('TRATA') !== -1 || afectacion.indexOf('JUSTICIA') !== -1) {
        return true;
      }
    }

    if (catsStr.indexOf('NATURAL') !== -1 || catsStr.indexOf('SOCIONATURAL') !== -1 || amsStr.indexOf('INUNDACIÓN') !== -1 || amsStr.indexOf('SISMO') !== -1 || amsStr.indexOf('DESLIZAMIENTO') !== -1 || amsStr.indexOf('HÍDRICA') !== -1) {
      if (afectacion.indexOf('DESASTRES') !== -1 || afectacion.indexOf('PELIGROS') !== -1 || afectacion.indexOf('AGUA') !== -1 || afectacion.indexOf('WASH') !== -1 || afectacion.indexOf('SALUD') !== -1) {
        return true;
      }
    }

    if (catsStr.indexOf('ANTRÓPICA') !== -1 || amsStr.indexOf('VIOLENCIA') !== -1 || amsStr.indexOf('CIBERACOSO') !== -1 || amsStr.indexOf('SPA') !== -1) {
      if (afectacion.indexOf('PSICOSOCIALES') !== -1 || afectacion.indexOf('VIOLENCIA') !== -1 || afectacion.indexOf('DIGITALES') !== -1 || afectacion.indexOf('ESTIGMA') !== -1) {
        return true;
      }
    }

    return false;
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
          desafio: item.desafio || 'Diseñar un plan de acción de aula para emergencias',
          explorar: item.explorar || '',
          crear: item.crear || '',
          compartir: item.compartir || ''
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
      if (parsed) {
        if (self.currentArea === 'supervivencia') {
          parsed.isRecommended = self.isSurvivalRecommended(item, d);
        }
        validItems.push(parsed);
      }
    });

    // Ordenar supervivencia para que los recomendados aparezcan primero
    if (this.currentArea === 'supervivencia') {
      validItems.sort(function(a, b) {
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;
        return 0;
      });
    }

    // Encabezados dinámicos según el tipo de área
    var theadHTML = '';
    if (this.currentArea === 'socioemocional') {
      theadHTML = 
        '<tr style="background: var(--surface-hover); text-align: left;">' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 20%;">Dimensión & Etapa de Respuesta</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 34%;">Habilidad & Objetivo de Aprendizaje (Bloom)</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 16%;">Proceso Cognitivo (Bloom)</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 30%;">Contenido de Aprendizaje & Evidencias Clave</th>' +
        '</tr>';
    } else if (this.currentArea === 'supervivencia') {
      theadHTML = 
        '<tr style="background: var(--surface-hover); text-align: left;">' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 22%;">Tipología de Riesgo & Afectación</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 32%;">Aprendizaje Clave & Objetivo de Protección</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 16%;">Proceso Cognitivo (Bloom)</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 30%;">Mini-Proyecto Situado & Fases de Acción</th>' +
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
            '<span style="line-height:1.45; display:inline-block; margin-top:5px; font-weight:600;">' + (item.objetivo_bloom || item.habilidad) + '</span>' +
          '</td>' +
          '<td style="padding: 10px; vertical-align: top;">' +
            '<span class="badge-pill badge-etapa2">' + (item.proceso_bloom || 'Aplicar') + '</span>' +
          '</td>' +
          '<td style="padding: 10px; vertical-align: top; font-size: 0.83rem; line-height: 1.4;">' +
            '<div style="background:#f8fafc; padding:6px 8px; border-radius:4px; margin-bottom:4px; border:1px solid #e2e8f0;">' +
              '<strong>📚 Contenido:</strong><br>' + contenidoLimpio +
            '</div>' +
            (item.evidencia_conmigo ? '<div style="margin-top:4px;"><strong style="color:var(--primary);">🎯 Evidencia (Propia):</strong> <em>' + item.evidencia_conmigo + '</em></div>' : '') +
            (item.evidencia_otro ? '<div style="margin-top:2px;"><strong style="color:#0369a1;">👥 Evidencia (Con pares):</strong> <em>' + item.evidencia_otro + '</em></div>' : '') +
          '</td>' +
        '</tr>';
      } else if (item.type === 'supervivencia') {
        var badgePriorizado = item.isRecommended ? '<span class="badge-pill" style="background:#fef3c7; color:#92400e; font-weight:800; margin-bottom:4px; display:inline-block;">⭐ PRIORIZADO SEGÚN DIAGNÓSTICO</span><br>' : '';
        var filaBackground = item.isRecommended ? 'background-color: #fafdfb;' : '';

        return '<tr style="border-bottom: 1px solid var(--border-light); ' + filaBackground + '">' +
          '<td style="padding: 10px; vertical-align: top;">' +
            badgePriorizado +
            '<strong style="color:#b91c1c;">🛡️ ' + item.tipo_riesgo + '</strong><br>' +
            '<span class="badge-pill" style="background:#fee2e2; color:#991b1b; margin-top:3px;">' + item.afectacion + '</span>' +
          '</td>' +
          '<td style="padding: 10px; vertical-align: top;">' +
            '<span style="color:var(--text-muted); font-size:0.82rem; display:block; margin-bottom:3px; line-height:1.35;">' + item.aprendizaje_clave + '</span>' +
            '<strong style="color:var(--text-main); line-height:1.4; display:inline-block;">' + (item.objetivo_aprendizaje || item.aprendizaje_clave) + '</strong>' +
          '</td>' +
          '<td style="padding: 10px; vertical-align: top;">' +
            '<span class="badge-pill badge-etapa1">' + (item.proceso_bloom || 'Comprender + Aplicar') + '</span>' +
          '</td>' +
          '<td style="padding: 10px; vertical-align: top; line-height: 1.4; font-size:0.83rem;">' +
            '<strong style="color: var(--primary); font-size:0.88rem; display:block;">🛠️ ' + item.miniproyecto + '</strong>' +
            (item.desafio ? '<span style="color: #334155; display:block; margin-top:4px;"><strong>Desafío:</strong> ' + item.desafio + '</span>' : '') +
            (item.explorar ? '<div style="background:#f1f5f9; padding:4px 6px; border-radius:3px; margin-top:4px;"><strong>1. Explorar:</strong> ' + item.explorar.split('\n')[0] + '</div>' : '') +
            (item.crear ? '<div style="background:#f0fdf4; padding:4px 6px; border-radius:3px; margin-top:2px;"><strong>2. Crear:</strong> ' + item.crear.split('\n')[0] + '</div>' : '') +
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

    var bannerContextual = '';
    if (this.currentArea === 'supervivencia' && d && d.amenazas) {
      bannerContextual = 
        '<div class="no-print" style="background:#fefce8; border:1px solid #fde047; padding:10px 14px; border-radius:var(--radius-sm); margin-bottom:14px; font-size:0.86rem; color:#854d0e;">' +
          '⭐ <strong>Articulación con Diagnóstico de Aula:</strong> Los mini-proyectos marcados con <strong>PRIORIZADO</strong> responden directamente a las amenazas diagnosticadas (<em>' + (d.amenazas.join(', ')) + '</em>).' +
        '</div>';
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
        bannerContextual +
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
