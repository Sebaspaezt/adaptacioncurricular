// Módulo A: Diagnóstico Paramétrico PGIRE (Versión 2.5 - Multiciclo/Multigrado, Bloom Automático, Fechas Duales e Historial Sincronizado)
var ModuloA = {
  cicloGradosMap: {
    '1': ['Grado 1° (Primaria)', 'Grado 2° (Primaria)', 'Grado 3° (Primaria)'],
    '2': ['Grado 4° (Primaria)', 'Grado 5° (Primaria)'],
    '3': ['Grado 6° (Bachillerato)', 'Grado 7° (Bachillerato)'],
    '4': ['Grado 8° (Secundaria)', 'Grado 9° (Secundaria)'],
    '5': ['Grado 10° (Media)', 'Grado 11° (Media)']
  },

  barrerasCatalogo: [
    { id: 'asistencia', icon: '🚶', title: 'Asistencia irregular e intermitencia escolar', desc: 'Inasistencias continuas por afectación de vías, clima o temor.' },
    { id: 'desplazamiento', icon: '🚷', title: 'Desplazamiento forzado o acceso físico', desc: 'Rutas escolares cortadas, traslados involuntarios o albergues lejanos.' },
    { id: 'socioemocional', icon: '💔', title: 'Afectaciones socioemocionales y duelo', desc: 'Estrés agudo, ansiedad, duelo familiar o crisis emocional en los NNA.' },
    { id: 'materiales', icon: '🎒', title: 'Falta de materiales, útiles y textos', desc: 'Pérdida de cuadernos, útiles o falta de dotación pedagógica.' },
    { id: 'conectividad', icon: '📵', title: 'Ausencia de conectividad y tecnología', desc: 'Cero señal, falta de equipos o energía eléctrica en la sede/hogares.' },
    { id: 'rutinas', icon: '⏰', title: 'Interrupción de rutinas escolares', desc: 'Pérdida de hábitos de estudio, horarios desestructurados o dispersión.' },
    { id: 'comunicacion', icon: '📢', title: 'Barreras de comunicación y aislamiento', desc: 'Dificultad para contactar a las familias o aislamiento geográfico.' },
    { id: 'discapacidad', icon: '♿', title: 'Apoyos para estudiantes con discapacidad', desc: 'Falta de ajustes razonables (PIAR), rampas o materiales accesibles.' },
    { id: 'extraedad', icon: '📚', title: 'Extraedad y rezago pedagógico', desc: 'Trayectorias educativas previas interrumpidas o desfase edad-grado.' },
    { id: 'linguistica', icon: '🗣️', title: 'Diferencias lingüísticas o culturales', desc: 'Poblaciones étnicas, lenguas originarias o migración internacional.' },
    { id: 'familiares', icon: '👨‍👩‍👧', title: 'Cuidado familiar o trabajo infantil', desc: 'Asumir roles domésticos de cuidado de hermanos o subsistencia económica.' },
    { id: 'espacio', icon: '🏚️', title: 'Deterioro o hacinamiento del espacio', desc: 'Aulas colapsadas, sin agua/luz o hacinamiento en espacios temporales.' }
  ],

  currentBarrerasState: {},
  currentDiagnosticId: null,

  init: function(callbacks) {
    this.callbacks = callbacks || {};
    this.renderBarrerasUI();
    this.bindEvents();
    this.loadSavedDiagnostic();
  },

  // 2. Nivel Bloom: Orientador pedagógico automático (no seleccionable manualmente)
  calculateBloom: function(etapa) {
    if (!etapa) return 'Media / Intermedia (Bloom Nivel 3-4: Aplicar / Analizar)';
    if (etapa.indexOf('ETAPA 1') !== -1) {
      return 'Baja / Esencial (Bloom Nivel 1-2: Recordar / Comprender)';
    } else if (etapa.indexOf('ETAPA 2') !== -1) {
      return 'Media / Intermedia (Bloom Nivel 3-4: Aplicar / Analizar)';
    } else if (etapa.indexOf('ETAPA 3') !== -1) {
      return 'Alta / Profundización (Bloom Nivel 5-6: Evaluar / Crear)';
    }
    return 'Media / Intermedia (Bloom Nivel 3-4: Aplicar / Analizar)';
  },

  updateBloomDisplay: function(bloomVal) {
    var txtDisplay = document.getElementById('txt-bloom-display');
    var badgeDisplay = document.getElementById('display-bloom-badge');
    var selBloom = document.getElementById('select-bloom-ajustable');
    var inputHidden = document.getElementById('input-bloom');

    if (txtDisplay) txtDisplay.textContent = bloomVal;
    if (badgeDisplay) {
      if (bloomVal.indexOf('Baja') !== -1) {
        badgeDisplay.style.background = '#fef2f2';
        badgeDisplay.style.color = '#991b1b';
        badgeDisplay.style.borderColor = '#fca5a5';
      } else if (bloomVal.indexOf('Media') !== -1) {
        badgeDisplay.style.background = '#fef3c7';
        badgeDisplay.style.color = '#92400e';
        badgeDisplay.style.borderColor = '#fcd34d';
      } else {
        badgeDisplay.style.background = '#e0f2fe';
        badgeDisplay.style.color = '#0369a1';
        badgeDisplay.style.borderColor = '#7dd3fc';
      }
    }
    if (selBloom) selBloom.value = bloomVal;
    if (inputHidden) inputHidden.value = bloomVal;
  },

  // Estrategia didáctica según matrícula NNA y consideración de aula multigrado
  calculateDidacticaNNA: function(nnaCount, isMultigrado) {
    var n = parseInt(nnaCount, 10);
    if (isNaN(n) || n <= 0) return '';
    if (isMultigrado) {
      if (n < 15) return '📝 TUTORÍA 1:1 INTER-EDAD (<15 NNA - Multigrado)';
      if (n <= 35) return '👥 TRABAJO COOPERATIVO Y RINCONES (15-35 NNA - Multigrado)';
      return '⚡ MICRO-ESTACIONES MULTINIVEL (>35 NNA - Multigrado)';
    }
    if (n < 15) return '📝 TUTORÍA 1:1 (<15 NNA)';
    if (n <= 35) return '👥 TRABAJO COOPERATIVO (15 a 35 NNA)';
    return '⚡ MICRO-ESTACIONES (>35 NNA)';
  },

  // Gestión de Ciclos Múltiples (Monogrado y Multigrado)
  getSelectedCiclos: function() {
    var checkboxes = document.querySelectorAll('.ciclo-chip-input:checked');
    var selected = [];
    checkboxes.forEach(function(cb) {
      if (cb.value) selected.push(cb.value);
    });
    if (selected.length === 0) {
      var sel = document.getElementById('select-ciclo');
      return (sel && sel.value) ? [sel.value] : ['3'];
    }
    return selected;
  },

  setSelectedCiclos: function(ciclosArray, preselectedGrados) {
    if (!Array.isArray(ciclosArray) || ciclosArray.length === 0) {
      ciclosArray = ['3'];
    }
    var checkboxes = document.querySelectorAll('.ciclo-chip-input');
    checkboxes.forEach(function(cb) {
      var isChecked = ciclosArray.indexOf(cb.value) !== -1;
      cb.checked = isChecked;
      var parentLabel = cb.closest('.ciclo-chip');
      if (parentLabel) {
        if (isChecked) parentLabel.classList.add('active');
        else parentLabel.classList.remove('active');
      }
    });

    var selCiclo = document.getElementById('select-ciclo');
    if (selCiclo) selCiclo.value = ciclosArray[0] || '3';

    this.updateGradosForCiclos(ciclosArray, preselectedGrados);
  },

  // Actualización Dinámica de Grados Disponibles según Ciclos Seleccionados
  updateGradosForCiclos: function(ciclosArray, preselectedGrados) {
    var self = this;
    var container = document.getElementById('container-grado-chips');
    var selectGrado = document.getElementById('select-grado');
    if (!container) return;

    ciclosArray = ciclosArray || this.getSelectedCiclos();
    var allGrados = [];
    ciclosArray.forEach(function(c) {
      var list = self.cicloGradosMap[c] || [];
      list.forEach(function(g) {
        if (allGrados.indexOf(g) === -1) allGrados.push(g);
      });
    });

    if (allGrados.length === 0) {
      allGrados = this.cicloGradosMap['3'];
    }

    if (!preselectedGrados || preselectedGrados.length === 0) {
      preselectedGrados = [allGrados[0]];
    }

    // Generar chips interactivos de grados
    var html = allGrados.map(function(g) {
      var isChecked = preselectedGrados.indexOf(g) !== -1;
      var activeCls = isChecked ? ' active' : '';
      return '<label class="grado-chip' + activeCls + '" data-grado="' + g + '">' +
        '<input type="checkbox" class="grado-chip-input" value="' + g + '"' + (isChecked ? ' checked' : '') + '> ' +
        '<span>' + g + '</span>' +
      '</label>';
    }).join('');

    container.innerHTML = html;

    // Sincronizar select tradicional
    if (selectGrado) {
      selectGrado.innerHTML = '';
      allGrados.forEach(function(g) {
        var opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        if (preselectedGrados.indexOf(g) !== -1) opt.selected = true;
        selectGrado.appendChild(opt);
      });
    }

    // Listeners para los chips de grados
    container.querySelectorAll('.grado-chip-input').forEach(function(input) {
      input.addEventListener('change', function() {
        var parent = input.closest('.grado-chip');
        if (parent) {
          if (input.checked) parent.classList.add('active');
          else parent.classList.remove('active');
        }
        var selectedG = self.getSelectedGrados();
        if (selectGrado && selectedG.length > 0) selectGrado.value = selectedG[0];
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    });
  },

  getSelectedGrados: function() {
    var checkboxes = document.querySelectorAll('.grado-chip-input:checked');
    var selected = [];
    checkboxes.forEach(function(cb) {
      if (cb.value) selected.push(cb.value);
    });
    if (selected.length === 0) {
      var sel = document.getElementById('select-grado');
      return (sel && sel.value) ? [sel.value] : ['Grado 6° (Bachillerato)'];
    }
    return selected;
  },

  // Categorías y Amenazas PGIRE
  getSelectedCategories: function() {
    var checkboxes = document.querySelectorAll('.category-chip-input:checked');
    var selected = [];
    checkboxes.forEach(function(cb) {
      if (cb.value) selected.push(cb.value);
    });
    if (selected.length === 0) return ['Natural'];
    return selected;
  },

  filterAmenazasForCategories: function(categorias) {
    var isAll = (categorias.length === 0);
    return (PGIRE_DB || []).filter(function(item) {
      if (isAll) return true;
      return categorias.some(function(cat) {
        var cUpper = String(cat).trim().toUpperCase();
        var itemCat = String(item.categoria || '').trim().toUpperCase();
        if (cUpper.indexOf('NATURAL') !== -1 && cUpper.indexOf('SOCIO') === -1) {
          return itemCat.indexOf('NATURAL') !== -1 && itemCat.indexOf('SOCIO') === -1;
        }
        if (cUpper.indexOf('SOCIONATURAL') !== -1) {
          return itemCat.indexOf('SOCIONATURAL') !== -1;
        }
        if (cUpper.indexOf('TECNOLÓGICA') !== -1 || cUpper.indexOf('INSTITUCIONAL') !== -1 || cUpper === 'ANTRÓPICA' || cUpper === 'ANTROPICA') {
          return itemCat.indexOf('TECNOLÓGICA') !== -1 || itemCat.indexOf('INSTITUCIONAL') !== -1 || itemCat === 'ANTRÓPICA' || itemCat === 'ANTROPICA';
        }
        if (cUpper.indexOf('CONFLICTO') !== -1 || cUpper.indexOf('PROTECCIÓN') !== -1 || cUpper.indexOf('PROTECCION') !== -1) {
          return itemCat.indexOf('CONFLICTO') !== -1 || itemCat.indexOf('PROTECCIÓN') !== -1 || itemCat.indexOf('PROTECCION') !== -1;
        }
        return itemCat === cUpper;
      });
    });
  },

  populateAmenazasSelects: function(categorias) {
    var filtradas = this.filterAmenazasForCategories(categorias);
    var selPrincipal = document.getElementById('select-amenaza-principal');
    var selSec1 = document.getElementById('select-amenaza-secundaria-1');
    var selSec2 = document.getElementById('select-amenaza-secundaria-2');

    var currentP = selPrincipal ? selPrincipal.value : '';
    var currentS1 = selSec1 ? selSec1.value : '';
    var currentS2 = selSec2 ? selSec2.value : '';

    function buildOptionsHtml(defaultLabel) {
      var html = '<option value="">' + defaultLabel + '</option>';
      var groups = {};
      filtradas.forEach(function(item) {
        var cat = item.categoria || 'PGIRE';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
      });

      Object.keys(groups).forEach(function(cat) {
        html += '<optgroup label="' + cat + '">';
        groups[cat].forEach(function(it) {
          html += '<option value="' + it.amenaza + '">' + it.amenaza + '</option>';
        });
        html += '</optgroup>';
      });
      return html;
    }

    if (selPrincipal) {
      selPrincipal.innerHTML = buildOptionsHtml('-- Seleccione Amenaza Principal --');
      if (currentP) selPrincipal.value = currentP;
    }

    if (selSec1) {
      selSec1.innerHTML = buildOptionsHtml('-- Ninguna / Opcional --');
      if (currentS1) selSec1.value = currentS1;
    }

    if (selSec2) {
      selSec2.innerHTML = buildOptionsHtml('-- Ninguna / Opcional --');
      if (currentS2) selSec2.value = currentS2;
    }

    this.updateConsolidatedThreatDetails();
  },

  updateConsolidatedThreatDetails: function() {
    var selPrincipal = document.getElementById('select-amenaza-principal');
    var selSec1 = document.getElementById('select-amenaza-secundaria-1');
    var selSec2 = document.getElementById('select-amenaza-secundaria-2');
    var hiddenAmenaza = document.getElementById('select-amenaza');

    var pVal = selPrincipal ? selPrincipal.value : '';
    var s1Val = selSec1 ? selSec1.value : '';
    var s2Val = selSec2 ? selSec2.value : '';

    if (hiddenAmenaza) {
      hiddenAmenaza.value = pVal || s1Val || s2Val || 'Inundación';
    }

    var selectedNames = [pVal, s1Val, s2Val].filter(function(x) { return Boolean(x); });
    var items = selectedNames.map(function(name, idx) {
      var found = (PGIRE_DB || []).find(function(x) { return x.amenaza === name; });
      var prefix = (idx === 0 ? '🚨 [1. Principal - ' : (idx === 1 ? '⚠️ [2. Concurrente - ' : '⚠️ [3. Terciaria - ')) + name + ']: ';
      return {
        prefix: prefix,
        item: found || { ejemplo: '', riesgo: '', ruta: '' }
      };
    });

    var elemEjemplo = document.getElementById('input-ejemplo-ie');
    var elemRiesgos = document.getElementById('input-riesgos-ie');
    var elemRuta = document.getElementById('input-ruta-gire');

    if (items.length > 0) {
      if (elemEjemplo) {
        elemEjemplo.value = items.map(function(it) { return it.prefix + (it.item.ejemplo || 'Afectación en sede escolar'); }).join('\n');
      }
      if (elemRiesgos) {
        elemRiesgos.value = items.map(function(it) { return it.prefix + (it.item.riesgo || 'Riesgo institucional reportado'); }).join('\n');
      }
      if (elemRuta) {
        elemRuta.value = items.map(function(it) { return it.prefix + (it.item.ruta || 'Ruta PGIRE'); }).join('\n');
      }
    } else {
      if (elemEjemplo) elemEjemplo.value = '';
      if (elemRiesgos) elemRiesgos.value = '';
      if (elemRuta) elemRuta.value = '';
    }

    this.autoAdjustTextareas();
  },

  autoAdjustTextareas: function() {
    ['input-ejemplo-ie', 'input-riesgos-ie', 'input-ruta-gire', 'input-barreras-descripcion'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.style.height = 'auto';
        var newH = Math.max(el.scrollHeight, 56);
        el.style.height = (newH + 4) + 'px';
      }
    });
  },

  // 10.1 y 10.2: Cálculo de fechas duales, desfase lectivo y calendario escolar MEN
  calculateDatesAndPeriods: function() {
    var inputFechaInicio = document.getElementById('input-fecha-inicio');
    var inputFechaAtencion = document.getElementById('input-fecha-atencion');
    var txtDesfase = document.getElementById('txt-desfase-calculado');
    var tagPeriodo = document.getElementById('tag-periodo-sugerido');

    var fechaInicioStr = inputFechaInicio ? inputFechaInicio.value : '';
    var fechaAtencionStr = inputFechaAtencion ? inputFechaAtencion.value : '';

    if (!fechaInicioStr) return { desfaseDias: 0, desfaseSemanas: 0, periodoEnCurso: 'Periodo 1', periodosPrevios: [] };

    var dInicio = new Date(fechaInicioStr + 'T00:00:00');
    var dAtencion = fechaAtencionStr ? new Date(fechaAtencionStr + 'T00:00:00') : dInicio;

    var diffMs = dAtencion.getTime() - dInicio.getTime();
    var diffDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    var diffWeeks = Math.max(0, Math.round(diffDays / 7));

    // Determinar semana del calendario escolar oficial (inicia última semana de enero)
    var ano = dInicio.getFullYear() || 2026;
    var inicioClases = new Date(ano, 0, 26);
    var msDesdeInicio = dInicio.getTime() - inicioClases.getTime();
    var semanaEscolar = Math.max(1, Math.ceil(msDesdeInicio / (1000 * 60 * 60 * 24 * 7)));

    var periodoEnCurso = 'Periodo 1';
    var periodosPrevios = [];

    if (semanaEscolar <= 10) {
      periodoEnCurso = 'Periodo 1';
      periodosPrevios = [];
    } else if (semanaEscolar <= 20) {
      periodoEnCurso = 'Periodo 2';
      periodosPrevios = ['Periodo 1'];
    } else if (semanaEscolar <= 30) {
      periodoEnCurso = 'Periodo 3';
      periodosPrevios = ['Periodo 1', 'Periodo 2'];
    } else {
      periodoEnCurso = 'Periodo 4';
      periodosPrevios = ['Periodo 1', 'Periodo 2', 'Periodo 3'];
    }

    if (txtDesfase) {
      if (diffDays === 0) {
        txtDesfase.textContent = 'Atención inmediata el mismo día de la emergencia (Semana escolar ' + semanaEscolar + ').';
      } else {
        txtDesfase.textContent = diffDays + ' días de suspensión / ' + diffWeeks + ' semana(s) de interrupción escolar hasta reanudación.';
      }
    }

    if (tagPeriodo) {
      if (periodosPrevios.length === 0) {
        tagPeriodo.textContent = 'Ocurrencia en ' + periodoEnCurso + ' (Semana escolar ' + semanaEscolar + ')';
        tagPeriodo.style.background = '#0284c7';
      } else {
        tagPeriodo.textContent = 'Ocurrencia en ' + periodoEnCurso + ' (' + periodosPrevios.join(' y ') + ' ya cubierto/s)';
        tagPeriodo.style.background = '#1e3a8a';
      }
    }

    return {
      desfaseDias: diffDays,
      desfaseSemanas: diffWeeks,
      semanaEscolar: semanaEscolar,
      periodoEnCurso: periodoEnCurso,
      periodosPrevios: periodosPrevios
    };
  },

  renderBarrerasUI: function() {
    var self = this;
    var container = document.getElementById('container-barreras-aprendizaje');
    if (!container) return;

    var html = this.barrerasCatalogo.map(function(b) {
      var currentVal = self.currentBarrerasState[b.id] || 'Ninguna';
      var activeClass = '';
      if (currentVal === 'Baja') activeClass = 'active-low';
      else if (currentVal === 'Media') activeClass = 'active-med';
      else if (currentVal === 'Alta') activeClass = 'active-high';

      return '<div class="barrier-card ' + activeClass + '" data-barrier-id="' + b.id + '">' +
        '<div>' +
          '<div class="barrier-title"><span>' + b.icon + '</span> ' + b.title + '</div>' +
          '<div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.35;">' + b.desc + '</div>' +
        '</div>' +
        '<div class="barrier-levels">' +
          '<span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">Afectación:</span>' +
          ['Ninguna', 'Baja', 'Media', 'Alta'].map(function(lvl) {
            var selClass = (currentVal === lvl) ? ('selected-' + lvl.toLowerCase()) : '';
            return '<button type="button" class="barrier-level-btn ' + selClass + '" data-level="' + lvl + '">' + lvl + '</button>';
          }).join('') +
        '</div>' +
      '</div>';
    }).join('');

    container.innerHTML = html;

    container.querySelectorAll('.barrier-level-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var parentCard = btn.closest('.barrier-card');
        var barrierId = parentCard.getAttribute('data-barrier-id');
        var level = btn.getAttribute('data-level');

        self.currentBarrerasState[barrierId] = level;

        parentCard.classList.remove('active-low', 'active-med', 'active-high');
        if (level === 'Baja') parentCard.classList.add('active-low');
        else if (level === 'Media') parentCard.classList.add('active-med');
        else if (level === 'Alta') parentCard.classList.add('active-high');

        parentCard.querySelectorAll('.barrier-level-btn').forEach(function(b) {
          b.className = 'barrier-level-btn';
        });
        btn.classList.add('selected-' + level.toLowerCase());

        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    });
  },

  // Obtener estado del diagnóstico actual
  getLiveDiagnostic: function() {
    var user = (typeof AuthManager !== 'undefined' && AuthManager.getUserData) ? AuthManager.getUserData() : null;
    var d = user ? user.diagnostico : null;

    var selectedCiclos = this.getSelectedCiclos();
    var selectedGrados = this.getSelectedGrados();
    var isMultigrado = selectedCiclos.length > 1 || selectedGrados.length > 1;

    var selEtapa = document.getElementById('select-etapa');
    var etapa = (selEtapa && selEtapa.value) || (d && d.etapa) || 'ETAPA 2: Recuperación temprana / Lúdica';
    var bloom = this.calculateBloom(etapa);

    var selectedCats = this.getSelectedCategories();
    var selP = document.getElementById('select-amenaza-principal');
    var selS1 = document.getElementById('select-amenaza-secundaria-1');
    var selS2 = document.getElementById('select-amenaza-secundaria-2');
    var inputNNA = document.getElementById('input-nna');
    var inputFechaInicio = document.getElementById('input-fecha-inicio');
    var inputFechaAtencion = document.getElementById('input-fecha-atencion');
    var inputBarrerasDesc = document.getElementById('input-barreras-descripcion');

    var pVal = (selP && selP.value) || (d && d.amenazaPrincipal) || (d && d.amenaza) || 'Inundación';
    var s1Val = (selS1 && selS1.value) || (d && d.amenazaSecundaria1) || '';
    var s2Val = (selS2 && selS2.value) || (d && d.amenazaSecundaria2) || '';
    var amenazasTop3 = [pVal, s1Val, s2Val].filter(function(x) { return Boolean(x); });

    var nna = (inputNNA && inputNNA.value) || (d && d.nna) || 28;
    var didactica = this.calculateDidacticaNNA(nna, isMultigrado);

    var fechaInicio = (inputFechaInicio && inputFechaInicio.value) || (d && d.fechaInicio) || new Date().toISOString().split('T')[0];
    var fechaAtencion = (inputFechaAtencion && inputFechaAtencion.value) || (d && d.fechaAtencion) || fechaInicio;

    var dateAnalysis = this.calculateDatesAndPeriods();

    var elemEjemplo = document.getElementById('input-ejemplo-ie');
    var elemRiesgos = document.getElementById('input-riesgos-ie');
    var elemRuta = document.getElementById('input-ruta-gire');

    var diagId = this.currentDiagnosticId || (d && d.id) || ('diag_' + Date.now());
    var tituloContextual = etapa.split(':')[0] + ' | ' + pVal + ' (' + (isMultigrado ? 'Multigrado: C' + selectedCiclos.join('+') : 'Ciclo ' + selectedCiclos[0]) + ') - ' + fechaAtencion;

    return {
      id: diagId,
      titulo: tituloContextual,
      ciclos: selectedCiclos,
      ciclo: selectedCiclos[0] || '3',
      grados: selectedGrados,
      grado: selectedGrados.join(', ') || 'Grado 6° (Bachillerato)',
      isMultigrado: isMultigrado,
      etapa: etapa,
      bloom: bloom,
      categoriasAmenaza: selectedCats,
      categoriaAmenaza: selectedCats.join(' + ') || 'Natural',
      amenazaPrincipal: pVal,
      amenazaSecundaria1: s1Val,
      amenazaSecundaria2: s2Val,
      amenazasTop3: amenazasTop3,
      amenaza: pVal,
      ejemploIE: (elemEjemplo && elemEjemplo.value) || (d && d.ejemploIE) || '',
      riesgosIE: (elemRiesgos && elemRiesgos.value) || (d && d.riesgosIE) || '',
      rutaGIRE: (elemRuta && elemRuta.value) || (d && d.rutaGIRE) || '',
      nna: parseInt(nna, 10) || 28,
      didacticaNNA: didactica,
      fechaInicio: fechaInicio,
      fechaAtencion: fechaAtencion,
      desfaseDias: dateAnalysis.desfaseDias,
      desfaseSemanas: dateAnalysis.desfaseSemanas,
      periodoEnCurso: dateAnalysis.periodoEnCurso,
      periodosPrevios: dateAnalysis.periodosPrevios,
      barreras: Object.assign({}, this.currentBarrerasState),
      barrerasDescripcion: (inputBarrerasDesc && inputBarrerasDesc.value) || (d && d.barrerasDescripcion) || '',
      updatedAt: new Date().toISOString()
    };
  },

  // Gestión de Historial Multi-Diagnóstico
  renderHistorialSelect: function() {
    var selHistorial = document.getElementById('select-historial-diagnosticos');
    if (!selHistorial) return;

    var user = AuthManager.getUserData() || {};
    var activeId = user.activeDiagnosticId || (user.diagnostico && user.diagnostico.id) || 'diag_default_1';
    var diagnosticos = user.diagnosticos || {};

    var keys = Object.keys(diagnosticos);
    if (keys.length === 0) {
      if (user.diagnostico) {
        diagnosticos[activeId] = {
          id: activeId,
          savedAt: user.diagnostico.updatedAt || new Date().toISOString(),
          diagnostico: user.diagnostico
        };
        keys = [activeId];
      }
    }

    var html = keys.map(function(k) {
      var item = diagnosticos[k];
      var d = item.diagnostico || {};
      var isActivo = (k === activeId);
      var prefix = isActivo ? '⭐ [ACTIVO] ' : '📋 ';
      var label = prefix + (d.titulo || (d.etapa ? (d.etapa.split(':')[0] + ' - ' + (d.amenazaPrincipal || d.amenaza)) : 'Diagnóstico'));
      return '<option value="' + k + '"' + (isActivo ? ' selected' : '') + '>' + label + '</option>';
    }).join('');

    selHistorial.innerHTML = html || '<option value="">Sin diagnósticos guardados</option>';
  },

  prepareNewDiagnostic: function() {
    var newId = 'diag_' + Date.now();
    this.currentDiagnosticId = newId;

    // Resetear formulario a valores base para una nueva emergencia
    this.setSelectedCiclos(['3'], ['Grado 6° (Bachillerato)']);

    var selEtapa = document.getElementById('select-etapa');
    if (selEtapa) selEtapa.value = 'ETAPA 1: Respuesta inmediata / Contención';
    this.updateBloomDisplay(this.calculateBloom('ETAPA 1: Respuesta inmediata / Contención'));

    var today = new Date().toISOString().split('T')[0];
    if (document.getElementById('input-fecha-inicio')) document.getElementById('input-fecha-inicio').value = today;
    if (document.getElementById('input-fecha-atencion')) document.getElementById('input-fecha-atencion').value = today;

    this.currentBarrerasState = {};
    this.renderBarrerasUI();
    if (document.getElementById('input-barreras-descripcion')) document.getElementById('input-barreras-descripcion').value = '';

    this.calculateDatesAndPeriods();
    this.renderHistorialSelect();

    alert('✨ Se ha iniciado el formulario para un NUEVO Diagnóstico de Emergencia.\nComplete los nuevos datos y haga clic en "Guardar y Aplicar Diagnóstico" para registrarlo en su historial.');
  },

  bindEvents: function() {
    var self = this;
    var selCiclo = document.getElementById('select-ciclo');
    var selGrado = document.getElementById('select-grado');
    var selEtapa = document.getElementById('select-etapa');
    var selP = document.getElementById('select-amenaza-principal');
    var selS1 = document.getElementById('select-amenaza-secundaria-1');
    var selS2 = document.getElementById('select-amenaza-secundaria-2');
    var inputNNA = document.getElementById('input-nna');
    var labelDidactica = document.getElementById('label-didactica-nna');
    var inputFechaInicio = document.getElementById('input-fecha-inicio');
    var inputFechaAtencion = document.getElementById('input-fecha-atencion');
    var inputBarrerasDesc = document.getElementById('input-barreras-descripcion');
    var btnGuardar = document.getElementById('btn-guardar-diagnostico');
    var categoryCheckboxes = document.querySelectorAll('.category-chip-input');
    var cicloCheckboxes = document.querySelectorAll('.ciclo-chip-input');

    // Botones rápidos de selección de ciclos
    var btnCiclosTodos = document.getElementById('btn-ciclos-todos');
    var btnCiclosPrimaria = document.getElementById('btn-ciclos-primaria');
    var btnCiclosSecundaria = document.getElementById('btn-ciclos-secundaria');
    var btnCiclosLimpiar = document.getElementById('btn-ciclos-limpiar');

    if (btnCiclosTodos) {
      btnCiclosTodos.addEventListener('click', function(e) {
        e.preventDefault();
        self.setSelectedCiclos(['1', '2', '3', '4', '5']);
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    if (btnCiclosPrimaria) {
      btnCiclosPrimaria.addEventListener('click', function(e) {
        e.preventDefault();
        self.setSelectedCiclos(['1', '2']);
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    if (btnCiclosSecundaria) {
      btnCiclosSecundaria.addEventListener('click', function(e) {
        e.preventDefault();
        self.setSelectedCiclos(['3', '4', '5']);
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    if (btnCiclosLimpiar) {
      btnCiclosLimpiar.addEventListener('click', function(e) {
        e.preventDefault();
        self.setSelectedCiclos(['3']);
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    // Botones rápidos de selección de grados
    var btnGradosTodos = document.getElementById('btn-grados-todos');
    var btnGradosLimpiar = document.getElementById('btn-grados-limpiar');

    if (btnGradosTodos) {
      btnGradosTodos.addEventListener('click', function(e) {
        e.preventDefault();
        var allBoxes = document.querySelectorAll('.grado-chip-input');
        allBoxes.forEach(function(b) {
          b.checked = true;
          var parent = b.closest('.grado-chip');
          if (parent) parent.classList.add('active');
        });
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    if (btnGradosLimpiar) {
      btnGradosLimpiar.addEventListener('click', function(e) {
        e.preventDefault();
        var allBoxes = document.querySelectorAll('.grado-chip-input');
        allBoxes.forEach(function(b, idx) {
          b.checked = (idx === 0);
          var parent = b.closest('.grado-chip');
          if (parent) {
            if (idx === 0) parent.classList.add('active');
            else parent.classList.remove('active');
          }
        });
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    // Listeners de los chips de ciclo
    cicloCheckboxes.forEach(function(cb) {
      cb.addEventListener('change', function() {
        var parentLabel = cb.closest('.ciclo-chip');
        if (parentLabel) {
          if (cb.checked) parentLabel.classList.add('active');
          else parentLabel.classList.remove('active');
        }
        var selectedC = self.getSelectedCiclos();
        if (selCiclo) selCiclo.value = selectedC[0] || '3';
        self.updateGradosForCiclos(selectedC);
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    });

    if (selCiclo) {
      selCiclo.addEventListener('change', function() {
        self.setSelectedCiclos([selCiclo.value]);
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    if (selGrado) {
      selGrado.addEventListener('change', function() {
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    // Etapa -> Bloom Automático
    if (selEtapa) {
      selEtapa.addEventListener('change', function() {
        var recBloom = self.calculateBloom(selEtapa.value);
        self.updateBloomDisplay(recBloom);
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    // Categorías PGIRE
    categoryCheckboxes.forEach(function(cb) {
      cb.addEventListener('change', function() {
        var parentLabel = cb.closest('.category-chip');
        if (parentLabel) {
          if (cb.checked) parentLabel.classList.add('active');
          else parentLabel.classList.remove('active');
        }
        var selectedCats = self.getSelectedCategories();
        self.populateAmenazasSelects(selectedCats);
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    });

    [selP, selS1, selS2].forEach(function(elem) {
      if (elem) {
        elem.addEventListener('change', function() {
          self.updateConsolidatedThreatDetails();
          if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
        });
      }
    });

    if (inputNNA && labelDidactica) {
      inputNNA.addEventListener('input', function() {
        var isMulti = self.getSelectedCiclos().length > 1;
        labelDidactica.textContent = self.calculateDidacticaNNA(inputNNA.value, isMulti);
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    if (inputFechaInicio) {
      inputFechaInicio.addEventListener('change', function() {
        if (inputFechaAtencion && (!inputFechaAtencion.value || inputFechaAtencion.value < inputFechaInicio.value)) {
          inputFechaAtencion.value = inputFechaInicio.value;
        }
        self.calculateDatesAndPeriods();
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    if (inputFechaAtencion) {
      inputFechaAtencion.addEventListener('change', function() {
        self.calculateDatesAndPeriods();
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    if (inputBarrerasDesc) {
      inputBarrerasDesc.addEventListener('input', function() {
        self.autoAdjustTextareas();
      });
    }

    // Historial: Cargar Diagnóstico seleccionado
    var btnCargarHistorial = document.getElementById('btn-cargar-diagnostico-historial');
    if (btnCargarHistorial) {
      btnCargarHistorial.addEventListener('click', function(e) {
        e.preventDefault();
        var selHistorial = document.getElementById('select-historial-diagnosticos');
        var diagId = selHistorial ? selHistorial.value : '';
        if (!diagId) return alert('Por favor seleccione un diagnóstico del historial.');

        AuthManager.setActiveDiagnostic(diagId);
        self.loadSavedDiagnostic();

        if (typeof ModuloB !== 'undefined' && ModuloB && typeof ModuloB.renderRayuela === 'function') {
          ModuloB.renderRayuela();
        }
        if (typeof ModuloC !== 'undefined' && ModuloC && typeof ModuloC.renderMonitoreo === 'function') {
          ModuloC.renderMonitoreo();
        }

        alert('✅ Diagnóstico cargado exitosamente. Se han sincronizado las planificaciones de la Rayuela y el Monitoreo Semanal.');
      });
    }

    // Historial: Crear Nuevo Diagnóstico
    var btnNuevoDiag = document.getElementById('btn-nuevo-diagnostico');
    if (btnNuevoDiag) {
      btnNuevoDiag.addEventListener('click', function(e) {
        e.preventDefault();
        self.prepareNewDiagnostic();
      });
    }

    // Botones de Manual de Usuario en Footer
    var btnVerManual = document.getElementById('btn-ver-manual');
    if (btnVerManual) {
      btnVerManual.addEventListener('click', function(e) {
        e.preventDefault();
        var modal = document.getElementById('modal-manual');
        if (modal) modal.style.display = 'flex';
      });
    }

    var btnModalPrint = document.getElementById('btn-modal-print-manual');
    if (btnModalPrint) {
      btnModalPrint.addEventListener('click', function(e) {
        e.preventDefault();
        var iframe = document.getElementById('iframe-manual');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.print();
        } else {
          window.print();
        }
      });
    }

    var btnImprimirManual = document.getElementById('btn-imprimir-manual');
    if (btnImprimirManual) {
      btnImprimirManual.addEventListener('click', function(e) {
        e.preventDefault();
        var iframe = document.getElementById('iframe-manual');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.print();
        } else {
          window.open('manual_usuario.html', '_blank');
        }
      });
    }

    // Exportar Ficha a CSV
    var btnExcelDiag = document.getElementById('btn-exportar-excel-diagnostico');
    if (btnExcelDiag) {
      btnExcelDiag.addEventListener('click', function(e) {
        e.preventDefault();
        var d = self.getLiveDiagnostic();
        var user = (typeof AuthManager !== 'undefined' && AuthManager.getUserData) ? AuthManager.getUserData() : null;

        var csvRows = [
          ['PARÁMETRO DIAGNÓSTICO', 'VALOR REGISTRADO / ESTIMACIÓN'],
          ['Docente Responsable', (user && user.nombreCompleto) || 'Docente Territorial'],
          ['Institución Educativa', (user && user.institucion) || 'Sede Educativa Rural'],
          ['Ciclos Formativos', d.ciclos.join(', ')],
          ['Grados Escolares', d.grado],
          ['Atención Multigrado', d.isMultigrado ? 'SÍ (Aula Multigrado Activa)' : 'NO (Monogrado)'],
          ['Etapa de Respuesta INEE', d.etapa],
          ['Complejidad y Desafío Cognitivo (Bloom)', d.bloom],
          ['Categorías de Amenaza', d.categoriaAmenaza],
          ['Amenaza Principal', d.amenazaPrincipal],
          ['Amenaza Secundaria 1', d.amenazaSecundaria1 || '(Ninguna)'],
          ['Amenaza Secundaria 2', d.amenazaSecundaria2 || '(Ninguna)'],
          ['Consolidado Multirriesgo Top 3', (d.amenazasTop3 || []).join(' + ')],
          ['Ejemplos Contextualizados en la IE', (d.ejemploIE || '').replace(/[\r\n]+/g, ' ')],
          ['Riesgos Escolares Asociados', (d.riesgosIE || '').replace(/[\r\n]+/g, ' ')],
          ['Rutas PGIRE de Articulación', (d.rutaGIRE || '').replace(/[\r\n]+/g, ' ')],
          ['Matrícula de NNA', d.nna + ' estudiantes'],
          ['Estrategia Didáctica por NNA', d.didacticaNNA],
          ['Fecha Ocurrencia de la Emergencia', d.fechaInicio],
          ['Fecha Inicio / Reanudación de Clases', d.fechaAtencion],
          ['Desfase Escolar Estimado', d.desfaseDias + ' días (~' + d.desfaseSemanas + ' semanas)'],
          ['Periodo Escolar en Curso', d.periodoEnCurso],
          ['Periodos Previos Abordados', (d.periodosPrevios || []).join(', ') || '(Ninguno - Inicio de año)'],
          ['Observación de Barreras del Docente', (d.barrerasDescripcion || '').replace(/[\r\n]+/g, ' ')]
        ];

        if (d.barreras) {
          Object.keys(d.barreras).forEach(function(bKey) {
            csvRows.push(['Barrera BAP: ' + bKey, d.barreras[bKey]]);
          });
        }

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
        a.download = 'ficha_diagnostica_emergencia_' + (d.ciclos || ['3']).join('_') + '_' + new Date().toISOString().split('T')[0] + '.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    var btnPrintDiag = document.getElementById('btn-imprimir-diagnostico');
    if (btnPrintDiag) {
      btnPrintDiag.addEventListener('click', function(e) {
        e.preventDefault();
        var d = self.getLiveDiagnostic();
        self.renderDiagnosticSummary(d);
        window.print();
      });
    }

    if (btnGuardar) {
      btnGuardar.addEventListener('click', function(e) {
        e.preventDefault();
        self.saveDiagnostic();
      });
    }

    window.addEventListener('resize', function() {
      self.autoAdjustTextareas();
    });
  },

  saveDiagnostic: function() {
    var d = this.getLiveDiagnostic();

    if (!d.etapa || !d.amenazaPrincipal) {
      alert('Por favor complete los campos obligatorios: Etapa y Amenaza Principal.');
      return;
    }

    this.currentDiagnosticId = d.id;

    // Historial y persistencia
    var user = AuthManager.getUserData() || {};
    var history = user.diagnosticoHistory || [];
    var existingIndex = history.findIndex(function(h) { return h.id === d.id; });
    if (existingIndex >= 0) {
      history[existingIndex] = {
        id: d.id,
        savedAt: new Date().toISOString(),
        diagnostico: JSON.parse(JSON.stringify(d))
      };
    } else {
      history.push({
        id: d.id,
        savedAt: new Date().toISOString(),
        diagnostico: JSON.parse(JSON.stringify(d))
      });
    }

    AuthManager.saveUserData('diagnosticoHistory', history);
    AuthManager.saveUserData('diagnostico', d);

    this.renderHistorialSelect();
    this.renderDiagnosticSummary(d);
    alert('✅ Diagnóstico Integrado y Parametrización guardados exitosamente en su historial.\n\nRedirigiendo automáticamente a la Rayuela Curricular (Módulo B)...');

    if (this.callbacks.onDiagnosticSaved) {
      this.callbacks.onDiagnosticSaved(d);
    }

    if (typeof window.switchTab === 'function') {
      window.switchTab('tab-rayuela');
    }
  },

  renderDiagnosticSummary: function(d) {
    var container = document.getElementById('resumen-diagnostico-card');
    if (!container) return;

    var activeBarrerasList = [];
    if (d.barreras) {
      Object.keys(d.barreras).forEach(function(k) {
        var lvl = d.barreras[k];
        if (lvl && lvl !== 'Ninguna') {
          activeBarrerasList.push('<strong>' + k + ':</strong> ' + lvl);
        }
      });
    }

    var amenazasLabel = (d.amenazasTop3 && d.amenazasTop3.length > 0) ? d.amenazasTop3.join(' + ') : d.amenaza;
    var ciclosLabel = (d.ciclos && d.ciclos.length > 1) ? ('Multigrado (Ciclos ' + d.ciclos.join(', ') + ')') : ('Ciclo ' + d.ciclo);

    container.style.display = 'block';
    container.innerHTML = 
      '<div style="background: var(--surface-hover); padding: 18px; border-radius: var(--radius-md); border-left: 5px solid var(--primary);">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">' +
          '<h4 style="color: var(--primary); font-weight: 700; margin:0;">🎯 Diagnóstico Activo y Sincronizado</h4>' +
          '<span class="badge-pill badge-etapa2">' + d.periodoEnCurso + '</span>' +
        '</div>' +
        '<div class="grid-3" style="gap: 12px; font-size: 0.88rem;">' +
          '<div><strong>Ciclos y Grados:</strong> ' + ciclosLabel + ' | ' + d.grado + '</div>' +
          '<div><strong>Etapa:</strong> ' + d.etapa + '</div>' +
          '<div><strong>Demanda Bloom (Auto):</strong> ' + d.bloom + '</div>' +
          '<div><strong>Multirriesgo Top 3:</strong> ' + amenazasLabel + '</div>' +
          '<div><strong>Estrategia NNA:</strong> ' + d.didacticaNNA + ' (' + d.nna + ' NNA)</div>' +
          '<div><strong>Fechas Duales:</strong> Emergencia: ' + d.fechaInicio + ' | Atención: ' + d.fechaAtencion + '</div>' +
        '</div>' +
        (activeBarrerasList.length > 0 ? (
          '<div style="margin-top: 10px; font-size: 0.82rem; color: #92400e; background: #fef3c7; padding: 6px 12px; border-radius: 4px;">' +
            '<strong>🧩 Barreras de Aprendizaje Activas:</strong> ' + activeBarrerasList.join(' | ') +
          '</div>'
        ) : '') +
        (d.barrerasDescripcion ? (
          '<div style="margin-top: 6px; font-size: 0.82rem; color: #475569; font-style: italic;">' +
            '<strong>Observación de Aula:</strong> "' + d.barrerasDescripcion + '"' +
          '</div>'
        ) : '') +
      '</div>';
  },

  loadSavedDiagnostic: function() {
    var user = AuthManager.getUserData();
    var d = user ? user.diagnostico : null;
    if (!d) {
      d = {
        id: 'diag_default_1',
        ciclos: ['3'],
        ciclo: '3',
        grados: ['Grado 6° (Bachillerato)'],
        grado: 'Grado 6° (Bachillerato)',
        isMultigrado: false,
        etapa: 'ETAPA 2: Recuperación temprana / Lúdica',
        bloom: 'Media / Intermedia (Bloom Nivel 3-4: Aplicar / Analizar)',
        categoriasAmenaza: ['Natural'],
        categoriaAmenaza: 'Natural',
        amenazaPrincipal: 'Inundación',
        amenazaSecundaria1: '',
        amenazaSecundaria2: '',
        amenazasTop3: ['Inundación'],
        amenaza: 'Inundación',
        nna: 28,
        didacticaNNA: '👥 TRABAJO COOPERATIVO (15 a 35 NNA)',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaAtencion: new Date().toISOString().split('T')[0],
        desfaseDias: 0,
        desfaseSemanas: 0,
        periodoEnCurso: 'Periodo 1',
        periodosPrevios: [],
        barreras: {},
        barrerasDescripcion: ''
      };
    }

    this.currentDiagnosticId = d.id || 'diag_default_1';

    // Cargar selección de ciclos y grados
    var ciclos = d.ciclos || (d.ciclo ? [d.ciclo] : ['3']);
    var grados = d.grados || (d.grado ? [d.grado] : ['Grado 6° (Bachillerato)']);
    this.setSelectedCiclos(ciclos, grados);

    if (document.getElementById('select-etapa')) document.getElementById('select-etapa').value = d.etapa;

    var bloomVal = d.bloom || this.calculateBloom(d.etapa);
    this.updateBloomDisplay(bloomVal);

    var cats = d.categoriasAmenaza || [d.categoriaAmenaza || 'Natural'];
    var categoryCheckboxes = document.querySelectorAll('.category-chip-input');
    categoryCheckboxes.forEach(function(cb) {
      cb.checked = cats.some(function(c) { return String(c).toLowerCase().indexOf(String(cb.value).toLowerCase()) !== -1; });
      var parentLabel = cb.closest('.category-chip');
      if (parentLabel) {
        if (cb.checked) parentLabel.classList.add('active');
        else parentLabel.classList.remove('active');
      }
    });

    this.populateAmenazasSelects(cats);

    var selP = document.getElementById('select-amenaza-principal');
    var selS1 = document.getElementById('select-amenaza-secundaria-1');
    var selS2 = document.getElementById('select-amenaza-secundaria-2');

    if (selP && d.amenazaPrincipal) selP.value = d.amenazaPrincipal;
    else if (selP && d.amenaza) selP.value = d.amenaza;

    if (selS1 && d.amenazaSecundaria1) selS1.value = d.amenazaSecundaria1;
    if (selS2 && d.amenazaSecundaria2) selS2.value = d.amenazaSecundaria2;

    this.updateConsolidatedThreatDetails();

    if (document.getElementById('input-nna')) {
      document.getElementById('input-nna').value = d.nna;
      if (document.getElementById('label-didactica-nna')) {
        document.getElementById('label-didactica-nna').textContent = this.calculateDidacticaNNA(d.nna, d.isMultigrado);
      }
    }

    if (document.getElementById('input-fecha-inicio')) document.getElementById('input-fecha-inicio').value = d.fechaInicio;
    if (document.getElementById('input-fecha-atencion')) document.getElementById('input-fecha-atencion').value = d.fechaAtencion || d.fechaInicio;

    this.calculateDatesAndPeriods();

    if (d.barreras) {
      this.currentBarrerasState = Object.assign({}, d.barreras);
      this.renderBarrerasUI();
    }

    if (document.getElementById('input-barreras-descripcion') && d.barrerasDescripcion) {
      document.getElementById('input-barreras-descripcion').value = d.barrerasDescripcion;
    }

    this.renderHistorialSelect();
    this.renderDiagnosticSummary(d);
  }
};
