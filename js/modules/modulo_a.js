// Módulo A: Diagnóstico Paramétrico PGIRE (Versión 2.2 - Multirriesgo, Barreras y Fechas Duales)
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

  init: function(callbacks) {
    this.callbacks = callbacks || {};
    this.renderBarrerasUI();
    this.bindEvents();
    this.loadSavedDiagnostic();
  },

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

  calculateDidacticaNNA: function(nnaCount) {
    var n = parseInt(nnaCount, 10);
    if (isNaN(n) || n <= 0) return '';
    if (n < 15) return '📝 TUTORÍA 1:1 (<15 NNA)';
    if (n <= 35) return '👥 TRABAJO COOPERATIVO (15 a 35 NNA)';
    return '⚡ MICRO-ESTACIONES (>35 NNA)';
  },

  updateGradosForCiclo: function(ciclo) {
    var selectGrado = document.getElementById('select-grado');
    if (!selectGrado) return;
    var grados = this.cicloGradosMap[ciclo] || this.cicloGradosMap['3'];
    selectGrado.innerHTML = '';
    grados.forEach(function(g) {
      var opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      selectGrado.appendChild(opt);
    });
  },

  getSelectedCategories: function() {
    var checkboxes = document.querySelectorAll('.category-chip-input:checked');
    var selected = [];
    checkboxes.forEach(function(cb) {
      if (cb.value) selected.push(cb.value);
    });
    if (selected.length === 0) {
      return ['Natural'];
    }
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
  },

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

    // Determinar semana del calendario escolar oficial (inicia aprox. 26 de enero del año de la emergencia)
    var ano = dInicio.getFullYear() || 2026;
    var inicioClases = new Date(ano, 0, 26); // 26 de enero
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

    // Listeners para los botones de nivel
    container.querySelectorAll('.barrier-level-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var parentCard = btn.closest('.barrier-card');
        var barrierId = parentCard.getAttribute('data-barrier-id');
        var level = btn.getAttribute('data-level');

        self.currentBarrerasState[barrierId] = level;

        // Actualizar visualmente la tarjeta
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

  getLiveDiagnostic: function() {
    var user = (typeof AuthManager !== 'undefined' && AuthManager.getUserData) ? AuthManager.getUserData() : null;
    var d = user ? user.diagnostico : null;
    var selectedCats = this.getSelectedCategories();

    var selCiclo = document.getElementById('select-ciclo');
    var selGrado = document.getElementById('select-grado');
    var selEtapa = document.getElementById('select-etapa');
    var selBloom = document.getElementById('select-bloom-ajustable');
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

    var ciclo = (selCiclo && selCiclo.value) || (d && d.ciclo) || '3';
    var etapa = (selEtapa && selEtapa.value) || (d && d.etapa) || 'ETAPA 2: Recuperación temprana / Lúdica';
    var bloom = (selBloom && selBloom.value) || (d && d.bloom) || this.calculateBloom(etapa);
    var grado = (selGrado && selGrado.value) || (d && d.grado) || 'Grado 6° (Bachillerato)';
    var nna = (inputNNA && inputNNA.value) || (d && d.nna) || 28;
    var didactica = this.calculateDidacticaNNA(nna) || (d && d.didacticaNNA) || '👥 TRABAJO COOPERATIVO (15 a 35 NNA)';

    var fechaInicio = (inputFechaInicio && inputFechaInicio.value) || (d && d.fechaInicio) || new Date().toISOString().split('T')[0];
    var fechaAtencion = (inputFechaAtencion && inputFechaAtencion.value) || (d && d.fechaAtencion) || fechaInicio;

    var dateAnalysis = this.calculateDatesAndPeriods();

    var elemEjemplo = document.getElementById('input-ejemplo-ie');
    var elemRiesgos = document.getElementById('input-riesgos-ie');
    var elemRuta = document.getElementById('input-ruta-gire');

    return {
      ciclo: String(ciclo),
      grado: grado,
      etapa: etapa,
      bloom: bloom,
      categoriasAmenaza: selectedCats,
      categoriaAmenaza: selectedCats.join(' + ') || 'Natural',
      amenazaPrincipal: pVal,
      amenazaSecundaria1: s1Val,
      amenazaSecundaria2: s2Val,
      amenazasTop3: amenazasTop3,
      amenaza: pVal, // Retrocompatibilidad
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

  bindEvents: function() {
    var self = this;
    var selCiclo = document.getElementById('select-ciclo');
    var selGrado = document.getElementById('select-grado');
    var selEtapa = document.getElementById('select-etapa');
    var selBloom = document.getElementById('select-bloom-ajustable');
    var inputBloomHidden = document.getElementById('input-bloom');
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

    if (selCiclo) {
      selCiclo.addEventListener('change', function() {
        self.updateGradosForCiclo(selCiclo.value);
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    if (selGrado) {
      selGrado.addEventListener('change', function() {
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    if (selEtapa) {
      selEtapa.addEventListener('change', function() {
        var recBloom = self.calculateBloom(selEtapa.value);
        if (selBloom) {
          selBloom.value = recBloom;
        }
        if (inputBloomHidden) inputBloomHidden.value = recBloom;
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    if (selBloom) {
      selBloom.addEventListener('change', function() {
        if (inputBloomHidden) inputBloomHidden.value = selBloom.value;
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }


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
        labelDidactica.textContent = self.calculateDidacticaNNA(inputNNA.value);
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    if (inputFechaInicio) {
      inputFechaInicio.addEventListener('change', function() {
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
        if (self.callbacks.onDiagnosticChanged) self.callbacks.onDiagnosticChanged(self.getLiveDiagnostic());
      });
    }

    if (btnGuardar) {
      btnGuardar.addEventListener('click', function(e) {
        e.preventDefault();
        self.saveDiagnostic();
      });
    }
  },

  saveDiagnostic: function() {
    var d = this.getLiveDiagnostic();

    if (!d.etapa || !d.amenazaPrincipal) {
      alert('Por favor complete los campos obligatorios: Etapa y Amenaza Principal.');
      return;
    }

    // Historial y persistencia
    var user = AuthManager.getUserData() || {};
    var history = user.diagnosticoHistory || [];
    history.push({
      savedAt: new Date().toISOString(),
      diagnostico: JSON.parse(JSON.stringify(d))
    });
    AuthManager.saveUserData('diagnosticoHistory', history);
    AuthManager.saveUserData('diagnostico', d);

    this.renderDiagnosticSummary(d);
    alert('✅ Diagnóstico Integrado y Parametrización guardados exitosamente.');

    if (this.callbacks.onDiagnosticSaved) {
      this.callbacks.onDiagnosticSaved(d);
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

    container.style.display = 'block';
    container.innerHTML = 
      '<div style="background: var(--surface-hover); padding: 18px; border-radius: var(--radius-md); border-left: 5px solid var(--primary);">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">' +
          '<h4 style="color: var(--primary); font-weight: 700; margin:0;">🎯 Diagnóstico Activo y Sincronizado</h4>' +
          '<span class="badge-pill badge-etapa2">' + d.periodoEnCurso + '</span>' +
        '</div>' +
        '<div class="grid-3" style="gap: 12px; font-size: 0.88rem;">' +
          '<div><strong>Ciclo:</strong> Ciclo ' + d.ciclo + ' | <strong>Grado:</strong> ' + d.grado + '</div>' +
          '<div><strong>Etapa:</strong> ' + d.etapa + '</div>' +
          '<div><strong>Demanda Bloom:</strong> ' + d.bloom + '</div>' +
          '<div><strong>Multirriesgo Top 3:</strong> ' + amenazasLabel + '</div>' +
          '<div><strong>Estrategia NNA:</strong> ' + d.didacticaNNA + ' (' + d.nna + ' NNA)</div>' +
          '<div><strong>Fechas:</strong> Emergencia: ' + d.fechaInicio + ' | Atención: ' + d.fechaAtencion + '</div>' +
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
        ciclo: '3',
        grado: 'Grado 6° (Bachillerato)',
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
        barreras: {},
        barrerasDescripcion: ''
      };
    }

    if (document.getElementById('select-ciclo')) document.getElementById('select-ciclo').value = d.ciclo;
    this.updateGradosForCiclo(d.ciclo);
    if (document.getElementById('select-grado')) document.getElementById('select-grado').value = d.grado;
    if (document.getElementById('select-etapa')) document.getElementById('select-etapa').value = d.etapa;

    var bloomVal = d.bloom || this.calculateBloom(d.etapa);
    if (document.getElementById('select-bloom-ajustable')) document.getElementById('select-bloom-ajustable').value = bloomVal;
    if (document.getElementById('input-bloom')) document.getElementById('input-bloom').value = bloomVal;

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
        document.getElementById('label-didactica-nna').textContent = this.calculateDidacticaNNA(d.nna);
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

    this.renderDiagnosticSummary(d);
  }
};
