// Módulo A: Diagnóstico Paramétrico PGIRE
var ModuloA = {
  cicloGradosMap: {
    '1': ['Grado 1° (Primaria)', 'Grado 2° (Primaria)', 'Grado 3° (Primaria)'],
    '2': ['Grado 4° (Primaria)', 'Grado 5° (Primaria)'],
    '3': ['Grado 6° (Bachillerato)', 'Grado 7° (Bachillerato)'],
    '4': ['Grado 8° (Secundaria)', 'Grado 9° (Secundaria)'],
    '5': ['Grado 10° (Media)', 'Grado 11° (Media)']
  },

  init: function(callbacks) {
    this.callbacks = callbacks || {};
    this.bindEvents();
    this.loadSavedDiagnostic();
  },

  calculateBloom: function(etapa) {
    if (!etapa) return '';
    if (etapa.indexOf('ETAPA 1') !== -1) {
      return 'Baja / Esencial (Bloom Nivel 1-2: Recordar / Comprender)';
    } else if (etapa.indexOf('ETAPA 2') !== -1) {
      return 'Media / Intermedia (Bloom Nivel 3-4: Aplicar / Analizar)';
    } else if (etapa.indexOf('ETAPA 3') !== -1) {
      return 'Alta / Profundización (Bloom Nivel 5-6: Evaluar / Crear)';
    }
    return '';
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
      selected.push(cb.value);
    });
    if (selected.length === 0) {
      var selectCat = document.getElementById('select-cat-amenaza');
      if (selectCat && selectCat.value) {
        selected.push(selectCat.value);
      }
    }
    return selected;
  },

  filterAmenazas: function(categorias) {
    var select = document.getElementById('select-amenaza');
    if (!select) return;
    select.innerHTML = '<option value="">-- Seleccione Amenaza Específica --</option>';

    if (typeof categorias === 'string') {
      categorias = [categorias];
    }
    categorias = categorias || [];

    var isAll = (categorias.length === 0 || categorias.indexOf('TODAS LAS CATEGORÍAS (Diagnóstico Multirriesgo Integral)') !== -1);

    var filtradas = (PGIRE_DB || []).filter(function(item) {
      if (isAll) return true;
      return categorias.some(function(cat) {
        var cUpper = String(cat).toUpperCase();
        var itemCat = String(item.categoria || '').toUpperCase();
        return itemCat.indexOf(cUpper) !== -1 || cUpper.indexOf(itemCat) !== -1;
      });
    });

    filtradas.forEach(function(item) {
      var opt = document.createElement('option');
      opt.value = item.amenaza;
      opt.textContent = '[' + (item.categoria || 'PGIRE') + '] ' + item.amenaza;
      select.appendChild(opt);
    });
  },

  updateAmenazaDetails: function(amenazaNombre) {
    var item = (PGIRE_DB || []).find(function(x) { return x.amenaza === amenazaNombre; });
    var elemEjemplo = document.getElementById('input-ejemplo-ie');
    var elemRiesgos = document.getElementById('input-riesgos-ie');
    var elemRuta = document.getElementById('input-ruta-gire');

    if (item) {
      if (elemEjemplo) elemEjemplo.value = item.ejemplo || '';
      if (elemRiesgos) elemRiesgos.value = item.riesgo || '';
      if (elemRuta) elemRuta.value = item.ruta || '';
    } else {
      if (elemEjemplo) elemEjemplo.value = '';
      if (elemRiesgos) elemRiesgos.value = '';
      if (elemRuta) elemRuta.value = '';
    }
  },

  bindEvents: function() {
    var self = this;
    var selectCiclo = document.getElementById('select-ciclo');
    var selectEtapa = document.getElementById('select-etapa');
    var inputBloom = document.getElementById('input-bloom');
    var selectAmenaza = document.getElementById('select-amenaza');
    var inputNNA = document.getElementById('input-nna');
    var labelDidactica = document.getElementById('label-didactica-nna');
    var btnGuardar = document.getElementById('btn-guardar-diagnostico');
    var categoryCheckboxes = document.querySelectorAll('.category-chip-input');

    if (selectCiclo) {
      selectCiclo.addEventListener('change', function() {
        self.updateGradosForCiclo(selectCiclo.value);
      });
    }

    if (selectEtapa && inputBloom) {
      selectEtapa.addEventListener('change', function() {
        inputBloom.value = self.calculateBloom(selectEtapa.value);
      });
    }

    categoryCheckboxes.forEach(function(cb) {
      cb.addEventListener('change', function() {
        var parentLabel = cb.closest('.category-chip');
        if (parentLabel) {
          if (cb.checked) {
            parentLabel.classList.add('active');
          } else {
            parentLabel.classList.remove('active');
          }
        }
        var selectedCats = self.getSelectedCategories();
        self.filterAmenazas(selectedCats);
        self.updateAmenazaDetails('');
      });
    });

    var selectCat = document.getElementById('select-cat-amenaza');
    if (selectCat) {
      selectCat.addEventListener('change', function() {
        var val = selectCat.value;
        categoryCheckboxes.forEach(function(cb) {
          if (val === 'TODAS LAS CATEGORÍAS (Diagnóstico Multirriesgo Integral)') {
            cb.checked = true;
          } else {
            cb.checked = (cb.value === val);
          }
          var parentLabel = cb.closest('.category-chip');
          if (parentLabel) {
            if (cb.checked) parentLabel.classList.add('active');
            else parentLabel.classList.remove('active');
          }
        });
        self.filterAmenazas(self.getSelectedCategories());
        self.updateAmenazaDetails('');
      });
    }

    if (selectAmenaza) {
      selectAmenaza.addEventListener('change', function() {
        self.updateAmenazaDetails(selectAmenaza.value);
      });
    }

    if (inputNNA && labelDidactica) {
      inputNNA.addEventListener('input', function() {
        labelDidactica.textContent = self.calculateDidacticaNNA(inputNNA.value);
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
    var self = this;
    var selectedCats = this.getSelectedCategories();
    var selectAmenaza = document.getElementById('select-amenaza');
    var amenazaVal = selectAmenaza ? selectAmenaza.value : '';

    var diagnostico = {
      ciclo: document.getElementById('select-ciclo') ? document.getElementById('select-ciclo').value : '3',
      etapa: document.getElementById('select-etapa') ? document.getElementById('select-etapa').value : '',
      bloom: document.getElementById('input-bloom') ? document.getElementById('input-bloom').value : '',
      categoriasAmenaza: selectedCats,
      categoriaAmenaza: selectedCats.join(' + ') || 'MULTIRRIESGO',
      amenaza: amenazaVal,
      ejemploIE: document.getElementById('input-ejemplo-ie') ? document.getElementById('input-ejemplo-ie').value : '',
      riesgosIE: document.getElementById('input-riesgos-ie') ? document.getElementById('input-riesgos-ie').value : '',
      rutaGIRE: document.getElementById('input-ruta-gire') ? document.getElementById('input-ruta-gire').value : '',
      grado: document.getElementById('select-grado') ? document.getElementById('select-grado').value : '',
      nna: document.getElementById('input-nna') ? document.getElementById('input-nna').value : 25,
      didacticaNNA: this.calculateDidacticaNNA(document.getElementById('input-nna') ? document.getElementById('input-nna').value : 25),
      fechaInicio: document.getElementById('input-fecha-inicio') ? document.getElementById('input-fecha-inicio').value : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };

    if (!diagnostico.etapa || !diagnostico.amenaza) {
      alert('Por favor complete los campos de Etapa y Amenaza para guardar el diagnóstico.');
      return;
    }

    AuthManager.saveUserData('diagnostico', diagnostico);
    this.renderDiagnosticSummary(diagnostico);
    alert('✅ Diagnóstico de Aula guardado exitosamente.');
    
    if (this.callbacks.onDiagnosticSaved) {
      this.callbacks.onDiagnosticSaved(diagnostico);
    }
  },

  renderDiagnosticSummary: function(d) {
    var container = document.getElementById('resumen-diagnostico-card');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = 
      '<div style="background: var(--surface-hover); padding: 18px; border-radius: var(--radius-md); border-left: 5px solid var(--primary);">' +
        '<h4 style="color: var(--primary); font-weight: 700; margin-bottom: 8px;">🎯 Diagnóstico Guardado y Activo</h4>' +
        '<div class="grid-3" style="gap: 12px; font-size: 0.88rem;">' +
          '<div><strong>Ciclo:</strong> Ciclo ' + d.ciclo + ' | <strong>Grado:</strong> ' + d.grado + '</div>' +
          '<div><strong>Etapa:</strong> ' + d.etapa + '</div>' +
          '<div><strong>Complejidad Bloom:</strong> ' + d.bloom + '</div>' +
          '<div><strong>Amenaza:</strong> [' + (d.categoriaAmenaza || 'PGIRE') + '] ' + d.amenaza + '</div>' +
          '<div><strong>Estrategia NNA:</strong> ' + d.didacticaNNA + ' (' + d.nna + ' NNA)</div>' +
          '<div><strong>Fecha Inicio:</strong> ' + d.fechaInicio + '</div>' +
        '</div>' +
        '<div style="margin-top: 10px; font-size: 0.85rem; color: #064e3b;">' +
          '<strong>Articulación Institucional PGIRE:</strong> ' + d.rutaGIRE +
        '</div>' +
      '</div>';
  },

  loadSavedDiagnostic: function() {
    var user = AuthManager.getUserData();
    var d = user ? user.diagnostico : null;
    if (!d) {
      d = {
        ciclo: '3',
        etapa: 'ETAPA 2: Recuperación temprana / Lúdica',
        bloom: 'Media / Intermedia (Bloom Nivel 3-4: Aplicar / Analizar)',
        categoriasAmenaza: ['NATURAL'],
        categoriaAmenaza: 'NATURAL',
        amenaza: 'Inundación',
        ejemploIE: 'Creciente de río o quebrada',
        riesgosIE: 'Daños a infraestructura, suspensión de actividades académicas',
        rutaGIRE: '🏛️ Instancias PGIRE: Mesa Territorial de Gestión del Riesgo (CMGRD / CDGRD / UNGRD) + Bomberos + Defensa Civil + Cruz Roja + Alcaldía',
        grado: 'Grado 6° (Bachillerato)',
        nna: 28,
        didacticaNNA: '👥 TRABAJO COOPERATIVO (15 a 35 NNA)',
        fechaInicio: new Date().toISOString().split('T')[0]
      };
    }

    if (document.getElementById('select-ciclo')) document.getElementById('select-ciclo').value = d.ciclo;
    this.updateGradosForCiclo(d.ciclo);
    if (document.getElementById('select-grado')) document.getElementById('select-grado').value = d.grado;
    if (document.getElementById('select-etapa')) document.getElementById('select-etapa').value = d.etapa;
    if (document.getElementById('input-bloom')) document.getElementById('input-bloom').value = d.bloom || this.calculateBloom(d.etapa);

    var cats = d.categoriasAmenaza || (d.categoriaAmenaza ? [d.categoriaAmenaza] : ['NATURAL']);
    var categoryCheckboxes = document.querySelectorAll('.category-chip-input');
    categoryCheckboxes.forEach(function(cb) {
      cb.checked = cats.indexOf(cb.value) !== -1;
      var parentLabel = cb.closest('.category-chip');
      if (parentLabel) {
        if (cb.checked) parentLabel.classList.add('active');
        else parentLabel.classList.remove('active');
      }
    });

    if (document.getElementById('select-cat-amenaza')) {
      document.getElementById('select-cat-amenaza').value = cats.length === 1 ? cats[0] : (cats.length > 1 ? 'TODAS LAS CATEGORÍAS (Diagnóstico Multirriesgo Integral)' : '');
    }

    this.filterAmenazas(cats);

    if (document.getElementById('select-amenaza')) {
      document.getElementById('select-amenaza').value = d.amenaza;
    }
    this.updateAmenazaDetails(d.amenaza);

    if (document.getElementById('input-nna')) {
      document.getElementById('input-nna').value = d.nna;
      if (document.getElementById('label-didactica-nna')) {
        document.getElementById('label-didactica-nna').textContent = this.calculateDidacticaNNA(d.nna);
      }
    }
    if (document.getElementById('input-fecha-inicio')) document.getElementById('input-fecha-inicio').value = d.fechaInicio;

    this.renderDiagnosticSummary(d);
  }
};
