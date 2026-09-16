// Módulo B: Rayuela Curricular (Biblioteca de Planificación - Versión 2.2 con Periodos, Canasta y Normas INEE)
var ModuloB = {
  currentArea: 'lenguaje',
  currentPeriodoFilter: 'todos', // 'todos', '1', '2', '3', '4'

  init: function() {
    this.renderRayuela();
  },

  getItemFields: function(item, areaKey, itemIndex, totalItems) {
    areaKey = areaKey || this.currentArea;
    if (!item) return null;
    totalItems = totalItems || 8;
    itemIndex = (typeof itemIndex === 'number') ? itemIndex : 0;

    // Asignación de periodo escolar académico (P1, P2, P3, P4)
    var pNum = Math.min(4, Math.floor((itemIndex / Math.max(1, totalItems)) * 4) + 1);
    var periodoLabel = 'Periodo ' + pNum;
    var itemId = areaKey + '_' + itemIndex;

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
        id: itemId,
        periodoNum: pNum,
        periodo: periodoLabel,
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
        var etapaSocio = 'Etapa 2';
        var habText = String(item.habilidad || '');
        if (habText.indexOf('Etapa 1') !== -1) etapaSocio = 'Etapa 1';
        else if (habText.indexOf('Etapa 3') !== -1) etapaSocio = 'Etapa 3';

        return {
          id: itemId,
          periodoNum: (etapaSocio === 'Etapa 1' ? 1 : (etapaSocio === 'Etapa 2' ? 2 : 3)),
          periodo: etapaSocio + ' (Respuesta)',
          etapaSocio: etapaSocio,
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
        var apr = String(item.aprendizaje || '');
        var tagSigla = 'SUPERVIVENCIA';
        if (apr.toLowerCase().indexOf('erae') !== -1 || apr.toLowerCase().indexOf('minas') !== -1) tagSigla = 'ERAE (Minas)';
        else if (apr.toLowerCase().indexOf('wash') !== -1 || apr.toLowerCase().indexOf('agua') !== -1) tagSigla = 'WASH (Agua)';

        return {
          id: itemId,
          periodoNum: 1,
          periodo: 'Protección Integral',
          factor: '🛡️ ' + tipologiaLabel,
          subproceso: item.aprendizaje ? ('🔍 Foco de Riesgo: ' + item.aprendizaje) : '',
          dbaCode: tagSigla,
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
        id: itemId,
        periodoNum: pNum,
        periodo: periodoLabel,
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

  getItemState: function(item, d, userStates) {
    if (userStates && userStates[item.id]) {
      return userStates[item.id];
    }
    // Si no ha sido modificado manualmente por el docente, verificar estimación por fecha de emergencia
    if (d && d.periodosPrevios && Array.isArray(d.periodosPrevios)) {
      if (d.periodosPrevios.indexOf('Periodo ' + item.periodoNum) !== -1) {
        return 'abordado';
      }
    }
    return 'pendiente';
  },

  isItemSelectedForPlan: function(item, userSelection, autoRec) {
    if (userSelection && typeof userSelection[item.id] !== 'undefined') {
      return Boolean(userSelection[item.id]);
    }
    // Si no hay selección manual, usar la recomendación inicial
    return Boolean(autoRec && autoRec[item.id]);
  },

  buildAreaTableHTML: function(areaKey, cicloData, habsList, supsList, d, userStates, userSelection) {
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
    rawItems.forEach(function(item, idx) {
      var parsed = self.getItemFields(item, areaKey, idx, rawItems.length);
      if (parsed) validItems.push(parsed);
    });

    var isSocio = (areaKey === 'socioemocional');
    var isSuperv = (areaKey === 'supervivencia');
    var isEtapa1 = (d && d.etapa && d.etapa.indexOf('ETAPA 1') !== -1);

    // Filtrar por periodo seleccionado en pestaña si aplica
    if (!isSocio && !isSuperv && self.currentPeriodoFilter !== 'todos') {
      var targetP = parseInt(self.currentPeriodoFilter, 10);
      validItems = validItems.filter(function(x) { return x.periodoNum === targetP; });
    }

    // En Etapa 1, si es socioemocional, priorizar Etapa 1
    if (isSocio && isEtapa1) {
      // Ordenar para que los de Etapa 1 aparezcan primero
      validItems.sort(function(a, b) {
        if (a.etapaSocio === 'Etapa 1' && b.etapaSocio !== 'Etapa 1') return -1;
        if (a.etapaSocio !== 'Etapa 1' && b.etapaSocio === 'Etapa 1') return 1;
        return 0;
      });
    }

    // En supervivencia, destacar las que coinciden con las amenazas Top 3 del diagnóstico
    var top3Names = (d && d.amenazasTop3) || (d && d.amenaza ? [d.amenaza] : []);
    if (isSuperv && top3Names.length > 0) {
      validItems.sort(function(a, b) {
        var matchA = top3Names.some(function(t) { return (a.factor + ' ' + a.subproceso).toLowerCase().indexOf(t.toLowerCase()) !== -1; });
        var matchB = top3Names.some(function(t) { return (b.factor + ' ' + b.subproceso).toLowerCase().indexOf(t.toLowerCase()) !== -1; });
        if (matchA && !matchB) return -1;
        if (!matchA && matchB) return 1;
        return 0;
      });
    }

    var th0 = 'Plan / Estado';
    var th1 = 'Factor / Eje & Periodo';
    var th2 = 'DBA / Aprendizaje Esencial';
    var th3 = 'Complejidad & Bloom';
    var th4 = 'Didáctica Situada';

    if (isSocio) {
      th1 = '🌱 Dimensión & Etapa';
      th2 = 'Habilidad Clave & Competencia';
      th3 = 'Proceso Psicosocial';
      th4 = 'Didáctica de Contención';
    } else if (isSuperv) {
      th1 = '🛡️ Tipología de Riesgo';
      th2 = 'Aprendizaje de Autoprotección';
      th3 = 'Enfoque de Seguridad';
      th4 = 'Protocolos de Aula (ERAE / WASH)';
    }

    return '<table class="table-print" style="width: 100%; border-collapse: collapse; font-size: 0.86rem; margin-bottom: 24px;">' +
      '<thead>' +
        '<tr style="background: var(--surface-hover); text-align: left;">' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 18%;">' + th0 + '</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 18%;">' + th1 + '</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 30%;">' + th2 + '</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 14%;">' + th3 + '</th>' +
          '<th style="padding: 10px; border-bottom: 2px solid var(--border-medium); width: 20%;">' + th4 + '</th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>' +
        validItems.map(function(item) {
          var state = self.getItemState(item, d, userStates);
          var isChecked = self.isItemSelectedForPlan(item, userSelection);

          var rowClass = 'row-pending';
          if (state === 'abordado') rowClass = 'row-addressed';
          else if (state === 'aplazado') rowClass = 'row-postponed';

          var badgeBg = '#e0f2fe';
          var badgeColor = '#0369a1';
          if (isSocio) {
            badgeBg = '#fef3c7';
            badgeColor = '#92400e';
          } else if (isSuperv) {
            badgeBg = '#fee2e2';
            badgeColor = '#991b1b';
          }

          var periodoBadgeHTML = '';
          if (!isSocio && !isSuperv) {
            periodoBadgeHTML = '<span class="badge-pill" style="background:#e2e8f0; color:#334155; font-size:0.7rem; margin-top:4px; display:inline-block;">📅 ' + item.periodo + '</span>';
          } else if (isSocio) {
            periodoBadgeHTML = '<span class="badge-pill badge-etapa2" style="font-size:0.7rem; margin-top:4px; display:inline-block;">' + item.periodo + '</span>';
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

          var checkboxLabel = isChecked ? '✓ En Plan (Mód. C)' : '+ Incluir en Plan';
          if (state === 'abordado') {
            checkboxLabel = isChecked ? '🔄 Repaso activo' : '👁️ Abordado (Excluido)';
          }

          return '<tr class="' + rowClass + '" style="border-bottom: 1px solid var(--border-light);">' +
            '<td style="padding: 10px; vertical-align: top;">' +
              '<div style="display:flex; flex-direction:column; gap:6px;">' +
                '<label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-size:0.82rem; font-weight:700; color:' + (isChecked ? 'var(--primary)' : 'var(--text-muted)') + ';">' +
                  '<input type="checkbox" class="plan-checkbox" data-item-id="' + item.id + '" data-area="' + areaKey + '" ' + (isChecked ? 'checked' : '') + ' style="accent-color:var(--primary); width:16px; height:16px;">' +
                  '<span>' + checkboxLabel + '</span>' +
                '</label>' +
                '<select class="select-item-state" data-item-id="' + item.id + '" style="font-size:0.75rem; padding:3px 6px; border-radius:4px; border:1px solid var(--border-medium); background:white;">' +
                  '<option value="pendiente" ' + (state === 'pendiente' ? 'selected' : '') + '>🎯 Pendiente</option>' +
                  '<option value="abordado" ' + (state === 'abordado' ? 'selected' : '') + '>👁️ Ya abordado</option>' +
                  '<option value="aplazado" ' + (state === 'aplazado' ? 'selected' : '') + '>⏸️ Pospuesto</option>' +
                '</select>' +
              '</div>' +
            '</td>' +
            '<td style="padding: 10px; vertical-align: top;">' +
              '<strong>' + item.factor + '</strong>' +
              (item.subproceso && (isSocio || isSuperv) ? ('<br><small style="color: var(--text-muted); display:inline-block; margin-top:3px;">' + item.subproceso + '</small>') : '') +
              '<br>' + periodoBadgeHTML +
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

    var userStates = (user && user.estadosCurriculo) || {};
    var userSelection = (user && user.seleccionCurricular) || {};

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
      { key: 'socioemocional', name: '🌱 Socioemocional & Bienestar', count: habsList.length },
      { key: 'supervivencia', name: '🛡️ Supervivencia & ERAE/WASH', count: supsList.length }
    ];

    // Conteo en vivo de aprendizajes seleccionados por área
    var countsByArea = { lenguaje: 0, matematicas: 0, sociales: 0, naturales: 0, socioemocional: 0, supervivencia: 0 };
    Object.keys(userSelection).forEach(function(k) {
      if (userSelection[k]) {
        var prefix = k.split('_')[0];
        if (countsByArea[prefix] !== undefined) countsByArea[prefix]++;
      }
    });
    var totalSelected = Object.keys(countsByArea).reduce(function(acc, k) { return acc + countsByArea[k]; }, 0);

    var isEtapa1 = (d && d.etapa && d.etapa.indexOf('ETAPA 1') !== -1);
    var isAcademicArea = (self.currentArea !== 'socioemocional' && self.currentArea !== 'supervivencia');

    var bannerINEE_HTML = '';
    if (isEtapa1) {
      bannerINEE_HTML = 
        '<div class="info-banner-inee">' +
          '<strong>🕊️ Normas Mínimas INEE (Etapa 1: Respuesta y Contención):</strong> ' +
          'Se prioriza el soporte psicosocial, el bienestar socioemocional y los mensajes clave de supervivencia (<strong>Agua, Saneamiento e Higiene WASH</strong> y <strong>Educación en el Riesgo de Artefactos Explosivos ERAE</strong>). ' +
          'Los contenidos de ciencias básicas formales se sugieren para la fase 2 de recuperación, permitiendo concentrar el esfuerzo inicial en la contención y seguridad integral del grupo.' +
        '</div>';
    }

    var bannerPeriodo_HTML = '';
    if (d && d.periodosPrevios && d.periodosPrevios.length > 0) {
      bannerPeriodo_HTML = 
        '<div class="info-banner-periodo">' +
          '<div>' +
            '<strong>📅 Estimación por Fecha de Emergencia (' + (d.fechaInicio || '') + '):</strong> ' +
            'Los aprendizajes correspondientes a <strong>' + d.periodosPrevios.join(' y ') + '</strong> se han pre-marcado automáticamente como <em>Ya abordados</em> en el calendario regular. Puede modificar su estado o marcarlos como repaso si lo requiere.' +
          '</div>' +
          '<div style="display:flex; gap:6px;">' +
            '<button id="btn-reaplicar-fechas" class="btn-elite btn-outline" style="padding:4px 8px; font-size:0.75rem; background:white;">Re-aplicar Fechas</button>' +
            '<button id="btn-reset-pendientes" class="btn-elite btn-outline" style="padding:4px 8px; font-size:0.75rem; background:white;">Todo a Pendiente</button>' +
          '</div>' +
        '</div>';
    }

    // Barra de filtros por Periodo (solo para áreas académicas)
    var periodosBar_HTML = '';
    if (isAcademicArea) {
      periodosBar_HTML = 
        '<div class="periodos-bar no-print">' +
          '<span style="font-size:0.82rem; font-weight:700; color:var(--text-muted);">Filtrar por Periodo Escolar:</span>' +
          ['todos', '1', '2', '3', '4'].map(function(p) {
            var label = (p === 'todos') ? 'Todos los Periodos' : ('Periodo ' + p);
            var act = (self.currentPeriodoFilter === p) ? 'active' : '';
            return '<button class="periodo-tab-btn ' + act + '" data-periodo="' + p + '">' + label + '</button>';
          }).join('') +
        '</div>';
    }

    var activeTableHTML = this.buildAreaTableHTML(this.currentArea, cicloData, habsList, supsList, d, userStates, userSelection);

    var fullPrintHTML = areas.map(function(a, idx) {
      var tableHTML = self.buildAreaTableHTML(a.key, cicloData, habsList, supsList, d, userStates, userSelection);
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
            '<h3 class="card-title">📚 Rayuela Curricular: Selección y Planificación (Ciclo ' + cicloKey + ')</h3>' +
            '<span style="font-size: 0.85rem; color: var(--text-muted);">' +
              'Grados: ' + (((cicloData && cicloData.grados) || []).join(', ')) + ' | ' +
              'Etapa: ' + ((d && d.etapa) || 'Etapa 2') + ' | ' +
              'Amenaza: ' + ((d && d.amenazasTop3 && d.amenazasTop3.join(', ')) || (d && d.amenaza) || 'Natural') +
            '</span>' +
          '</div>' +
          '<div style="display: flex; gap: 8px;">' +
            '<button id="btn-imprimir-rayuela" class="btn-elite btn-outline">🖨️ Imprimir Malla</button>' +
          '</div>' +
        '</div>' +

        bannerINEE_HTML +
        bannerPeriodo_HTML +

        '<!-- Pestañas de Áreas -->' +
        '<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;" class="no-print">' +
          areas.map(function(a) {
            var activeClass = self.currentArea === a.key ? 'btn-primary' : 'btn-outline';
            return '<button class="btn-elite ' + activeClass + ' tab-area-btn" data-area="' + a.key + '">' +
              a.name + ' (' + a.count + ')' +
            '</button>';
          }).join('') +
        '</div>' +

        periodosBar_HTML +

        '<div class="no-print" style="overflow-x: auto;">' +
          activeTableHTML +
        '</div>' +

        '<!-- Canasta Curricular Dock Flotante -->' +
        '<div class="selection-dock-bar no-print">' +
          '<div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">' +
            '<div><strong>🧺 Canasta Curricular Seleccionada:</strong></div>' +
            '<div class="selection-dock-badges">' +
              '<span class="dock-badge ' + (countsByArea.lenguaje > 0 ? 'active-count' : '') + '">📖 Lenguaje: ' + countsByArea.lenguaje + '</span>' +
              '<span class="dock-badge ' + (countsByArea.matematicas > 0 ? 'active-count' : '') + '">📐 Mates: ' + countsByArea.matematicas + '</span>' +
              '<span class="dock-badge ' + (countsByArea.sociales > 0 ? 'active-count' : '') + '">🌍 Sociales: ' + countsByArea.sociales + '</span>' +
              '<span class="dock-badge ' + (countsByArea.naturales > 0 ? 'active-count' : '') + '">🔬 Naturales: ' + countsByArea.naturales + '</span>' +
              '<span class="dock-badge ' + (countsByArea.socioemocional > 0 ? 'active-count' : '') + '">🌱 Socioemocional: ' + countsByArea.socioemocional + '</span>' +
              '<span class="dock-badge ' + (countsByArea.supervivencia > 0 ? 'active-count' : '') + '">🛡️ ERAE/WASH: ' + countsByArea.supervivencia + '</span>' +
              '<span class="dock-badge active-count" style="background:#f59e0b; color:#0f172a;">Total: ' + totalSelected + '</span>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<button id="btn-sincronizar-canasta-monitoreo" class="btn-elite btn-secondary" style="background:#059669; font-weight:800; border:none; padding:10px 18px;">' +
              '🚀 Sincronizar Selección con Monitoreo (Módulo C)' +
            '</button>' +
          '</div>' +
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

    // Eventos de Navegación por Áreas
    container.querySelectorAll('.tab-area-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        self.currentArea = btn.getAttribute('data-area');
        self.renderRayuela();
      });
    });

    // Eventos de Filtro por Periodo
    container.querySelectorAll('.periodo-tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        self.currentPeriodoFilter = btn.getAttribute('data-periodo');
        self.renderRayuela();
      });
    });

    // Checkbox de selección en plan
    container.querySelectorAll('.plan-checkbox').forEach(function(chk) {
      chk.addEventListener('change', function() {
        var itemId = chk.getAttribute('data-item-id');
        var u = AuthManager.getUserData() || {};
        u.seleccionCurricular = u.seleccionCurricular || {};
        u.seleccionCurricular[itemId] = chk.checked;
        AuthManager.saveUserData('seleccionCurricular', u.seleccionCurricular);
        self.renderRayuela();
      });
    });

    // Cambio de estado pedagógico por ítem (pendiente, abordado, aplazado)
    container.querySelectorAll('.select-item-state').forEach(function(sel) {
      sel.addEventListener('change', function() {
        var itemId = sel.getAttribute('data-item-id');
        var u = AuthManager.getUserData() || {};
        u.estadosCurriculo = u.estadosCurriculo || {};
        u.estadosCurriculo[itemId] = sel.value;

        // Si se marca como abordado o aplazado, desmarcar de la canasta por defecto a menos que sea repaso
        u.seleccionCurricular = u.seleccionCurricular || {};
        if (sel.value === 'aplazado') {
          u.seleccionCurricular[itemId] = false;
        } else if (sel.value === 'abordado') {
          // Mantener solo si el docente expresamente lo dejó
          u.seleccionCurricular[itemId] = false;
        } else if (sel.value === 'pendiente') {
          u.seleccionCurricular[itemId] = true;
        }

        AuthManager.saveUserData('estadosCurriculo', u.estadosCurriculo);
        AuthManager.saveUserData('seleccionCurricular', u.seleccionCurricular);
        self.renderRayuela();
      });
    });

    // Botones de acción de fechas
    var btnReapply = document.getElementById('btn-reaplicar-fechas');
    if (btnReapply) {
      btnReapply.addEventListener('click', function() {
        var u = AuthManager.getUserData() || {};
        u.estadosCurriculo = {}; // Limpia para que tome el cálculo del diagnóstico
        AuthManager.saveUserData('estadosCurriculo', u.estadosCurriculo);
        self.renderRayuela();
      });
    }

    var btnReset = document.getElementById('btn-reset-pendientes');
    if (btnReset) {
      btnReset.addEventListener('click', function() {
        var u = AuthManager.getUserData() || {};
        u.estadosCurriculo = {};
        // Marcar todo como pendiente forzado
        var allKeys = [];
        container.querySelectorAll('.select-item-state').forEach(function(s) {
          allKeys.push(s.getAttribute('data-item-id'));
        });
        allKeys.forEach(function(k) { u.estadosCurriculo[k] = 'pendiente'; });
        AuthManager.saveUserData('estadosCurriculo', u.estadosCurriculo);
        self.renderRayuela();
      });
    }

    // Botón de sincronización con Monitoreo Semanal
    var btnSync = document.getElementById('btn-sincronizar-canasta-monitoreo');
    if (btnSync) {
      btnSync.addEventListener('click', function() {
        if (typeof ModuloC !== 'undefined' && ModuloC && typeof ModuloC.renderMonitoreo === 'function') {
          ModuloC.renderMonitoreo();
        }
        alert('✅ Canasta Curricular sincronizada exitosamente con el Módulo C (Monitoreo Semanal).\nPuede ingresar a la pestaña "📋 Módulo C" para ver el plan organizado por semanas.');
        if (typeof window.switchTab === 'function') {
          window.switchTab('tab-monitoreo');
        }
      });
    }

    // Impresión
    var btnPrint = document.getElementById('btn-imprimir-rayuela');
    if (btnPrint) {
      btnPrint.addEventListener('click', function() {
        var printContainer = document.getElementById('full-print-matrix-container');
        if (printContainer) printContainer.style.display = 'block';
        window.print();
        setTimeout(function() {
          if (printContainer) printContainer.style.display = 'none';
        }, 1000);
      });
    }
  }
};
