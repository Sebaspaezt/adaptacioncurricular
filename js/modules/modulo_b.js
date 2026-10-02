// Módulo B: Rayuela Curricular (Biblioteca de Planificación - Versión 2.5 con Multiciclo/Multigrado, Periodos, Canasta y Normas INEE)
var ModuloB = {
  currentArea: 'lenguaje',
  currentPeriodoFilter: 'todos', // 'todos', '1', '2', '3', '4'
  currentCycleFilter: 'todos', // 'todos' o número de ciclo específico '1', '2', etc.

  init: function() {
    this.renderRayuela();
  },

  getItemFields: function(item, areaKey, itemIndex, totalItems, cycleInfo) {
    areaKey = areaKey || this.currentArea;
    if (!item) return null;
    totalItems = totalItems || 8;
    itemIndex = (typeof itemIndex === 'number') ? itemIndex : 0;
    cycleInfo = cycleInfo || {};

    // Asignación de periodo escolar académico (P1, P2, P3, P4)
    var pNum = Math.min(4, Math.floor((itemIndex / Math.max(1, totalItems)) * 4) + 1);
    var periodoLabel = 'Periodo ' + pNum;
    var cPrefix = cycleInfo.key ? ('c' + cycleInfo.key + '_') : '';
    var itemId = cPrefix + areaKey + '_' + itemIndex;

    var cycleBadge = cycleInfo.roman ? ('Ciclo ' + cycleInfo.roman) : '';

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
        areaKey: areaKey,
        itemIndex: itemIndex,
        cycleKey: cycleInfo.key || '3',
        cycleRoman: cycleInfo.roman || 'III',
        cycleBadge: cycleBadge,
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
          areaKey: areaKey,
          itemIndex: itemIndex,
          cycleKey: 'transversal',
          cycleRoman: 'Transversal',
          cycleBadge: '🌱 Bienestar Transversal',
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
          areaKey: areaKey,
          itemIndex: itemIndex,
          cycleKey: 'transversal',
          cycleRoman: 'Transversal',
          cycleBadge: '🛡️ Protección Transversal',
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
        areaKey: areaKey,
        itemIndex: itemIndex,
        cycleKey: cycleInfo.key || '3',
        cycleRoman: cycleInfo.roman || 'III',
        cycleBadge: cycleBadge,
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
    // Fallback para IDs sin prefijo de ciclo
    var fallbackId = item.areaKey ? (item.areaKey + '_' + item.itemIndex) : item.id.replace(/^c\d+_/, '');
    if (userStates && userStates[fallbackId]) {
      return userStates[fallbackId];
    }

    var isTransversal = (
      item.id.indexOf('socioemocional') !== -1 ||
      item.id.indexOf('supervivencia') !== -1 ||
      item.dbaCode === 'SOCIOEMOCIONAL' ||
      item.dbaCode === 'SUPERVIVENCIA' ||
      item.dbaCode === 'ERAE (Minas)' ||
      item.dbaCode === 'WASH (Agua)'
    );

    if (isTransversal) {
      return 'pendiente';
    }

    // Estimación por fecha de emergencia
    if (d && d.periodosPrevios && Array.isArray(d.periodosPrevios)) {
      if (d.periodosPrevios.indexOf('Periodo ' + item.periodoNum) !== -1) {
        return 'abordado';
      }
    }

    return 'pendiente';
  },

  isItemSelectedForPlan: function(item, userSelection, state, isAcademicArea, d) {
    if (userSelection && typeof userSelection[item.id] === 'boolean') {
      return userSelection[item.id];
    }
    var fallbackId = item.areaKey ? (item.areaKey + '_' + item.itemIndex) : item.id.replace(/^c\d+_/, '');
    if (userSelection && typeof userSelection[fallbackId] === 'boolean') {
      return userSelection[fallbackId];
    }

    // En Etapa 1: blindaje INEE (socioemocional y supervivencia pre-seleccionados)
    var isEtapa1 = (d && d.etapa && d.etapa.indexOf('ETAPA 1') !== -1);
    if (isEtapa1 && !isAcademicArea) {
      return true;
    }

    // Si es área académica y está pendiente
    if (state === 'pendiente') {
      if (d && d.periodoEnCurso) {
        return ('Periodo ' + item.periodoNum) === d.periodoEnCurso;
      }
      return true;
    }

    return false;
  },

  // Recolectar todos los items para un área dada según los ciclos activos
  getItemsForArea: function(areaKey, selectedCycles, habsList, supsList) {
    var self = this;
    var allItems = [];

    if (areaKey === 'socioemocional') {
      (habsList || []).forEach(function(it, idx) {
        var parsed = self.getItemFields(it, 'socioemocional', idx, habsList.length, { key: 'transversal', roman: 'T' });
        if (parsed) allItems.push(parsed);
      });
      return allItems;
    }

    if (areaKey === 'supervivencia') {
      (supsList || []).forEach(function(it, idx) {
        var parsed = self.getItemFields(it, 'supervivencia', idx, supsList.length, { key: 'transversal', roman: 'T' });
        if (parsed) allItems.push(parsed);
      });
      return allItems;
    }

    // Áreas disciplinarias: recolectar de todos los ciclos seleccionados
    selectedCycles.forEach(function(cKey) {
      var cData = (CURRICULUM_DB && CURRICULUM_DB[cKey]) || {};
      var rawList = cData[areaKey] || [];
      var cInfo = {
        key: cKey,
        roman: cData.roman || cKey,
        badge: 'Ciclo ' + (cData.roman || cKey),
        title: cData.stage_title || ('Ciclo ' + cKey)
      };

      rawList.forEach(function(rawIt, idx) {
        var parsed = self.getItemFields(rawIt, areaKey, idx, rawList.length, cInfo);
        if (parsed) allItems.push(parsed);
      });
    });

    return allItems;
  },

  buildAreaTableHTML: function(areaKey, selectedCycles, habsList, supsList, d, userStates, userSelection) {
    var self = this;
    var items = this.getItemsForArea(areaKey, selectedCycles, habsList, supsList);

    var isSocio = (areaKey === 'socioemocional');
    var isSuperv = (areaKey === 'supervivencia');
    var isAcademic = (!isSocio && !isSuperv);
    var isMultigrado = (selectedCycles.length > 1);

    // Filtrado por Periodo (solo áreas ordinarias)
    var validItems = items.filter(function(item) {
      if (isAcademic && self.currentPeriodoFilter !== 'todos') {
        if (String(item.periodoNum) !== self.currentPeriodoFilter) return false;
      }
      if (isAcademic && isMultigrado && self.currentCycleFilter !== 'todos') {
        if (String(item.cycleKey) !== self.currentCycleFilter) return false;
      }
      return true;
    });

    // Barreras activas
    var activeBarriersList = [];
    if (d && d.barreras) {
      Object.keys(d.barreras).forEach(function(bKey) {
        var lvl = d.barreras[bKey];
        if (lvl === 'Media' || lvl === 'Alta') {
          activeBarriersList.push(bKey);
        }
      });
    }

    var th0 = 'Plan / Estado';
    var th1 = isMultigrado ? 'Ciclo & Periodo' : 'Factor / Eje & Periodo';
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
          var isChecked = self.isItemSelectedForPlan(item, userSelection, state, isAcademic, d);

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
          if (isAcademic) {
            periodoBadgeHTML = '<span class="badge-pill" style="background:#e2e8f0; color:#334155; font-size:0.7rem; margin-top:4px; display:inline-block;">📅 ' + item.periodo + '</span>';
          } else if (isSocio) {
            periodoBadgeHTML = '<span class="badge-pill badge-etapa2" style="font-size:0.7rem; margin-top:4px; display:inline-block;">' + item.periodo + '</span>';
          }

          var cycleBadgeHTML = '';
          if (isAcademic && isMultigrado) {
            cycleBadgeHTML = '<span class="badge-pill" style="background:#e0e7ff; color:#3730a3; font-weight:700; font-size:0.72rem; margin-bottom:4px; display:inline-block;">' + item.cycleBadge + '</span><br>';
          }

          var articulacionHTML = '';
          if (isAcademic) {
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
              '<div class="no-print" style="display:flex; flex-direction:column; gap:6px;">' +
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
              '<div class="print-only-text" style="display:none; font-size:7.5pt; line-height:1.3;">' +
                '<strong>' + (isChecked ? '✓ EN PLAN' : '— NO INCLUIDO') + '</strong><br>' +
                '<span style="text-transform:uppercase; color:#334155;">Estado: ' + state + '</span>' +
              '</div>' +
            '</td>' +
            '<td style="padding: 10px; vertical-align: top;">' +
              cycleBadgeHTML +
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
              (activeBarriersList.length > 0 ? ('<div style="font-size:0.75rem; color:#9a3412; background:#ffedd5; padding:3px 6px; border-radius:4px; margin-top:4px;"><strong>🧩 Ajuste por Barrera:</strong> Diversificar consignas y apoyos (' + activeBarriersList.slice(0, 2).join(', ') + ')</div>') : '') +
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
    
    var selectedCycles = (d && d.ciclos && d.ciclos.length > 0) ? d.ciclos : [(d && d.ciclo) || '3'];
    var isMultigrado = (selectedCycles.length > 1);

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
      { key: 'lenguaje', name: '📖 Lenguaje', count: this.getItemsForArea('lenguaje', selectedCycles, habsList, supsList).length },
      { key: 'matematicas', name: '📐 Matemáticas', count: this.getItemsForArea('matematicas', selectedCycles, habsList, supsList).length },
      { key: 'sociales', name: '🌍 Ciencias Sociales (MEN 2026)', count: this.getItemsForArea('sociales', selectedCycles, habsList, supsList).length },
      { key: 'naturales', name: '🔬 Ciencias Naturales & WASH', count: this.getItemsForArea('naturales', selectedCycles, habsList, supsList).length },
      { key: 'socioemocional', name: '🌱 Socioemocional & Bienestar', count: habsList.length },
      { key: 'supervivencia', name: '🛡️ Supervivencia & ERAE/WASH', count: supsList.length }
    ];

    // Conteo en vivo de aprendizajes seleccionados por área
    var countsByArea = { lenguaje: 0, matematicas: 0, sociales: 0, naturales: 0, socioemocional: 0, supervivencia: 0 };
    areas.forEach(function(a) {
      var allItems = self.getItemsForArea(a.key, selectedCycles, habsList, supsList);
      allItems.forEach(function(parsed) {
        var st = self.getItemState(parsed, d, userStates);
        var sel = self.isItemSelectedForPlan(parsed, userSelection, st, (a.key !== 'socioemocional' && a.key !== 'supervivencia'), d);
        if (sel) {
          countsByArea[a.key]++;
        }
      });
    });
    var totalSelected = Object.keys(countsByArea).reduce(function(acc, k) { return acc + countsByArea[k]; }, 0);

    var isEtapa1 = (d && d.etapa && d.etapa.indexOf('ETAPA 1') !== -1);
    var isAcademicArea = (self.currentArea !== 'socioemocional' && self.currentArea !== 'supervivencia');

    // Banner Contextual de Diagnóstico Activo
    var amenazasLabel = (d && d.amenazasTop3 && d.amenazasTop3.length > 0) ? d.amenazasTop3.join(' + ') : ((d && d.amenaza) || 'Emergencia territorial');
    var bannerContexto_HTML = 
      '<div class="diagnostic-context-banner">' +
        '<div>' +
          '<strong>📌 Diagnóstico Curricular Vinculado:</strong> ' + ((d && d.etapa && d.etapa.split(':')[0]) || 'Etapa 2') + ' | ' +
          '<strong>Multirriesgo:</strong> ' + amenazasLabel + ' | ' +
          '<strong>' + (isMultigrado ? ('Multigrado (' + selectedCycles.map(function(c) { return 'Ciclo ' + c; }).join(', ') + ')') : ('Ciclo ' + selectedCycles[0])) + '</strong> ' +
          '(' + ((d && d.nna) || 28) + ' NNA - ' + ((d && d.didacticaNNA) || 'TRABAJO COOPERATIVO') + ') | ' +
          '<em>Reanudación: ' + ((d && d.fechaAtencion) || '2026-03-22') + '</em>' +
        '</div>' +
        '<div>' +
          '<button type="button" class="btn-micro" onclick="window.switchTab(\'tab-diagnostico\');" style="background:white; border-color:#86efac; color:#166534; font-weight:700;">' +
            '⚙️ Ver / Cambiar Diagnóstico' +
          '</button>' +
        '</div>' +
      '</div>';

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

    // Barra de filtros por Ciclo (solo si hay más de 1 ciclo en multigrado)
    var cicloFilterBar_HTML = '';
    if (isMultigrado && isAcademicArea) {
      cicloFilterBar_HTML = 
        '<div class="periodos-bar no-print" style="margin-bottom: 10px; background: #e0e7ff; border-left: 4px solid #4338ca;">' +
          '<span style="font-size:0.82rem; font-weight:700; color:#3730a3;">🏫 Filtro Multigrado por Ciclo:</span>' +
          '<button class="ciclo-tab-btn ' + (self.currentCycleFilter === 'todos' ? 'active' : '') + '" data-ciclo="todos">Todos los Ciclos (' + selectedCycles.map(function(c) { return 'Ciclo ' + c; }).join('+') + ')</button>' +
          selectedCycles.map(function(c) {
            var act = (self.currentCycleFilter === c) ? 'active' : '';
            var cObj = (CURRICULUM_DB && CURRICULUM_DB[c]) || {};
            return '<button class="ciclo-tab-btn ' + act + '" data-ciclo="' + c + '">Ciclo ' + (cObj.roman || c) + '</button>';
          }).join('') +
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

    var activeTableHTML = this.buildAreaTableHTML(this.currentArea, selectedCycles, habsList, supsList, d, userStates, userSelection);

    var html = 
      '<div class="card-elite">' +
        bannerContexto_HTML +
        '<div class="card-header" style="flex-wrap: wrap; gap: 12px;">' +
          '<div>' +
            '<h2 class="card-title">📚 Biblioteca de Adaptación y Rayuela Curricular</h2>' +
            '<p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">' +
              'Planificación pedagógica situada. Seleccione los aprendizajes esenciales que integrará en la Canasta de Flexibilización Curricular para el seguimiento en el Módulo C.' +
            '</p>' +
          '</div>' +
          '<div style="display: flex; gap: 8px; flex-wrap: wrap;">' +
            '<button id="btn-exportar-rayuela" class="btn-elite btn-secondary">📊 Exportar Malla a Excel</button>' +
            '<button id="btn-imprimir-rayuela" class="btn-elite btn-outline">🖨️ Imprimir Malla</button>' +
          '</div>' +
        '</div>' +

        bannerINEE_HTML +
        bannerPeriodo_HTML +

        '<!-- Pestañas de Áreas Disciplinares y Transversales -->' +
        '<div class="tabs-nav no-print" style="margin-bottom: 14px; border-bottom: 2px solid var(--border-medium);">' +
          areas.map(function(a) {
            var activeClass = (self.currentArea === a.key) ? 'active' : '';
            var countSel = countsByArea[a.key] || 0;
            var badgeSelHTML = (countSel > 0) ? (' <span class="badge-pill" style="background:#059669; color:white; font-size:0.7rem; padding:1px 6px;">' + countSel + ' en plan</span>') : '';
            return '<button class="tab-button tab-rayuela-area ' + activeClass + '" data-area="' + a.key + '">' +
              a.name + ' (' + a.count + ')' + badgeSelHTML +
            '</button>';
          }).join('') +
        '</div>' +

        cicloFilterBar_HTML +
        periodosBar_HTML +

        '<!-- Tabla Curricular Dinámica -->' +
        '<div id="table-rayuela-container" style="overflow-x: auto;">' +
          activeTableHTML +
        '</div>' +

        '<!-- Dock Flotante de Canasta de Aprendizajes -->' +
        '<div class="selection-dock-bar selection-dock no-print">' +
          '<div class="selection-dock-badges">' +
            '<span>🧺 <strong>Canasta Curricular de Emergencia:</strong></span>' +
            '<span class="dock-badge active-count">' + totalSelected + ' Aprendizajes seleccionados</span>' +
            '<span class="dock-badge">📖 ' + countsByArea.lenguaje + ' Lenguaje</span>' +
            '<span class="dock-badge">📐 ' + countsByArea.matematicas + ' Matemáticas</span>' +
            '<span class="dock-badge">🌍 ' + countsByArea.sociales + ' Sociales</span>' +
            '<span class="dock-badge">🔬 ' + countsByArea.naturales + ' Naturales</span>' +
            '<span class="dock-badge">🌱 ' + countsByArea.socioemocional + ' Socioemocional</span>' +
            '<span class="dock-badge">🛡️ ' + countsByArea.supervivencia + ' Supervivencia</span>' +
          '</div>' +
          '<div style="display:flex; gap:8px;">' +
            '<button id="btn-seleccionar-todos-area" class="btn-elite btn-outline" style="font-size:0.8rem; background:white; color:var(--primary); padding:6px 12px;">+ Marcar toda el área</button>' +
            '<button id="btn-deseleccionar-todos-area" class="btn-elite btn-outline" style="font-size:0.8rem; background:white; color:#b91c1c; padding:6px 12px;">Desmarcar área</button>' +
            '<button id="btn-sincronizar-canasta-monitoreo" class="btn-elite btn-primary" style="font-size:0.82rem; padding:8px 16px;">🚀 Sincronizar Canasta con Módulo C</button>' +
          '</div>' +
        '</div>' +

      '</div>';

    container.innerHTML = html;

    // Listeners de pestañas de área
    container.querySelectorAll('.tab-rayuela-area').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        self.currentArea = btn.getAttribute('data-area');
        self.renderRayuela();
      });
    });

    // Listeners de filtro por ciclo (multigrado)
    container.querySelectorAll('.ciclo-tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        self.currentCycleFilter = btn.getAttribute('data-ciclo');
        self.renderRayuela();
      });
    });

    // Listeners de filtro de periodo
    container.querySelectorAll('.periodo-tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        self.currentPeriodoFilter = btn.getAttribute('data-periodo');
        self.renderRayuela();
      });
    });

    // Listener para el botón Sincronizar Canasta con Módulo C
    var btnSync = document.getElementById('btn-sincronizar-canasta-monitoreo');
    if (btnSync) {
      btnSync.addEventListener('click', function(e) {
        e.preventDefault();
        var u = AuthManager.getUserData() || {};
        AuthManager.saveUserData('seleccionCurricular', u.seleccionCurricular);
        if (typeof ModuloC !== 'undefined' && ModuloC && typeof ModuloC.renderMonitoreo === 'function') {
          ModuloC.renderMonitoreo();
        }
        alert('🎉 ¡Canasta Curricular Sincronizada!\nSe han vinculado ' + totalSelected + ' aprendizajes prioritarios con el cronograma y bitácora del Módulo C.\n\nRedirigiendo al Monitoreo Semanal...');
        if (typeof window.switchTab === 'function') {
          window.switchTab('tab-monitoreo');
        }
      });
    }

    // Listeners de Checkboxes de Canasta
    container.querySelectorAll('.plan-checkbox').forEach(function(cb) {
      cb.addEventListener('change', function() {
        var itemId = cb.getAttribute('data-item-id');
        var u = AuthManager.getUserData() || {};
        u.seleccionCurricular = u.seleccionCurricular || {};
        u.seleccionCurricular[itemId] = cb.checked;
        AuthManager.saveUserData('seleccionCurricular', u.seleccionCurricular);
        self.renderRayuela();
      });
    });

    // Listeners de Select de Estado
    container.querySelectorAll('.select-item-state').forEach(function(sel) {
      sel.addEventListener('change', function() {
        var itemId = sel.getAttribute('data-item-id');
        var u = AuthManager.getUserData() || {};
        u.estadosCurriculo = u.estadosCurriculo || {};
        u.estadosCurriculo[itemId] = sel.value;
        if (sel.value === 'abordado') {
          u.seleccionCurricular = u.seleccionCurricular || {};
          u.seleccionCurricular[itemId] = false;
        }
        AuthManager.saveUserData('estadosCurriculo', u.estadosCurriculo);
        AuthManager.saveUserData('seleccionCurricular', u.seleccionCurricular);
        self.renderRayuela();
      });
    });

    // Botones de acción rápida en Canasta
    var btnMarcarArea = document.getElementById('btn-seleccionar-todos-area');
    if (btnMarcarArea) {
      btnMarcarArea.addEventListener('click', function(e) {
        e.preventDefault();
        var u = AuthManager.getUserData() || {};
        u.seleccionCurricular = u.seleccionCurricular || {};
        container.querySelectorAll('.plan-checkbox').forEach(function(cb) {
          var id = cb.getAttribute('data-item-id');
          u.seleccionCurricular[id] = true;
        });
        AuthManager.saveUserData('seleccionCurricular', u.seleccionCurricular);
        self.renderRayuela();
      });
    }

    var btnDesmarcarArea = document.getElementById('btn-deseleccionar-todos-area');
    if (btnDesmarcarArea) {
      btnDesmarcarArea.addEventListener('click', function(e) {
        e.preventDefault();
        var u = AuthManager.getUserData() || {};
        u.seleccionCurricular = u.seleccionCurricular || {};
        container.querySelectorAll('.plan-checkbox').forEach(function(cb) {
          var id = cb.getAttribute('data-item-id');
          u.seleccionCurricular[id] = false;
        });
        AuthManager.saveUserData('seleccionCurricular', u.seleccionCurricular);
        self.renderRayuela();
      });
    }

    // Botones de re-aplicar fechas o resetear a pendiente
    var btnReaplicar = document.getElementById('btn-reaplicar-fechas');
    if (btnReaplicar) {
      btnReaplicar.addEventListener('click', function(e) {
        e.preventDefault();
        var u = AuthManager.getUserData() || {};
        u.estadosCurriculo = {};
        AuthManager.saveUserData('estadosCurriculo', u.estadosCurriculo);
        self.renderRayuela();
        alert('📅 Fechas re-aplicadas: los periodos previos a la emergencia se han pre-marcado como ya abordados.');
      });
    }

    var btnReset = document.getElementById('btn-reset-pendientes');
    if (btnReset) {
      btnReset.addEventListener('click', function(e) {
        e.preventDefault();
        var u = AuthManager.getUserData() || {};
        u.estadosCurriculo = {};
        container.querySelectorAll('.select-item-state').forEach(function(sel) {
          var id = sel.getAttribute('data-item-id');
          u.estadosCurriculo[id] = 'pendiente';
        });
        AuthManager.saveUserData('estadosCurriculo', u.estadosCurriculo);
        self.renderRayuela();
        alert('🎯 Todos los aprendizajes se han establecido como pendientes para flexibilización.');
      });
    }

    // Exportar e Imprimir Módulo B
    var btnPrintB = document.getElementById('btn-imprimir-rayuela');
    if (btnPrintB) {
      btnPrintB.addEventListener('click', function(e) {
        e.preventDefault();
        window.print();
      });
    }

    var btnExportB = document.getElementById('btn-exportar-rayuela');
    if (btnExportB) {
      btnExportB.addEventListener('click', function(e) {
        e.preventDefault();
        var items = self.getItemsForArea(self.currentArea, selectedCycles, habsList, supsList);
        var csvRows = [
          ['CICLO', 'PERIODO', 'FACTOR / EJE', 'SUBPROCESO', 'DBA CODIGO', 'DBA DESCRIPCION', 'COMPLEJIDAD', 'OBJETIVO BLOOM', 'SABER', 'HACER', 'SER', 'DIDACTICA', 'ESTADO DOCENTE', 'EN PLAN CANASTA']
        ];

        items.forEach(function(it) {
          var st = self.getItemState(it, d, userStates);
          var isSel = self.isItemSelectedForPlan(it, userSelection, st, (self.currentArea !== 'socioemocional' && self.currentArea !== 'supervivencia'), d);
          csvRows.push([
            it.cycleBadge || 'Ciclo ' + (d.ciclo || '3'),
            it.periodo,
            it.factor,
            it.subproceso,
            it.dbaCode,
            it.dbaDesc,
            it.complejidad,
            it.bloom,
            it.saber,
            it.hacer,
            it.ser,
            it.didactica,
            st,
            isSel ? 'SI' : 'NO'
          ]);
        });

        var formatCSVCell = function(val) {
          var str = (val === null || val === undefined) ? '' : String(val);
          if (str.indexOf(';') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
            return '"' + str.replace(/"/g, '""') + '"';
          }
          return str;
        };

        var csvContent = '\uFEFF' + csvRows.map(function(row) {
          return row.map(formatCSVCell).join(';');
        }).join('\r\n');

        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'malla_curricular_' + self.currentArea + '_multiciclo_' + new Date().toISOString().split('T')[0] + '.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }
};
