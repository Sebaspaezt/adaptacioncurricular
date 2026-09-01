// Módulo A: Diagnóstico Paramétrico PGIRE (Soporte Multirriesgo y Múltiples Amenazas Concurrentes)
var ModuloA = {
  cicloGradosMap: {
    '1': ['Grado 1° (Primaria)', 'Grado 2° (Primaria)', 'Grado 3° (Primaria)'],
    '2': ['Grado 4° (Primaria)', 'Grado 5° (Primaria)'],
    '3': ['Grado 6° (Bachillerato)', 'Grado 7° (Bachillerato)'],
    '4': ['Grado 8° (Secundaria)', 'Grado 9° (Secundaria)'],
    '5': ['Grado 10° (Media)', 'Grado 11° (Media)']
  },

  selectedCategories: ['NATURAL'],
  selectedThreats: ['Inundación'],

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

  renderCategoryCheckboxes: function() {
    var self = this;
    var container = document.getElementById('container-cat-checkboxes');
    if (!container) return;

    var categories = [
      { id: 'NATURAL', label: '🌿 NATURAL' },
      { id: 'SOCIONATURAL', label: '🌧️ SOCIONATURAL' },
      { id: 'ANTRÓPICA', label: '🏭 ANTRÓPICA' },
      { id: 'ANTRÓPICA – CONFLICTO ARMADO Y PROTECCIÓN', label: '🛡️ CONFLICTO ARMADO Y PROTECCIÓN' }
    ];

    container.innerHTML = categories.map(function(cat) {
      var isChecked = self.selectedCategories.indexOf(cat.id) !== -1;
      var selectedClass = isChecked ? 'selected' : '';
      return '<label class="chip-category-label ' + selectedClass + '" data-cat="' + cat.id + '">' +
        '<input type="checkbox" name="cat_pgire" value="' + cat.id + '" ' + (isChecked ? 'checked' : '') + '> ' +
        cat.label +
      '</label>';
    }).join('');

    var labels = container.querySelectorAll('.chip-category-label');
    labels.forEach(function(lbl) {
      var chk = lbl.querySelector('input[type="checkbox"]');
      chk.addEventListener('change', function() {
        self.handleCategoryChange();
      });
    });
  },

  handleCategoryChange: function() {
    var container = document.getElementById('container-cat-checkboxes');
    if (!container) return;

    var checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
    this.selectedCategories = [];
    checkedBoxes.forEach(function(chk) {
      this.selectedCategories.push(chk.value);
    }.bind(this));

    // Si desmarcó todo, forzamos al menos NATURAL para mantener coherencia
    if (this.selectedCategories.length === 0) {
      this.selectedCategories = ['NATURAL'];
      var firstChk = container.querySelector('input[value="NATURAL"]');
      if (firstChk) firstChk.checked = true;
    }

    // Actualizar clases CSS de los chips
    var labels = container.querySelectorAll('.chip-category-label');
    labels.forEach(function(lbl) {
      var chk = lbl.querySelector('input[type="checkbox"]');
      if (chk.checked) {
        lbl.classList.add('selected');
      } else {
        lbl.classList.remove('selected');
      }
    });

    this.renderThreatsList();
    this.updateAmenazaDetails();
  },

  renderThreatsList: function() {
    var self = this;
    var container = document.getElementById('container-amenazas-checkboxes');
    var badge = document.getElementById('badge-total-amenazas');
    if (!container) return;

    // Filtrar amenazas que pertenezcan a alguna de las categorías seleccionadas
    var filtradas = (PGIRE_DB || []).filter(function(item) {
      return self.selectedCategories.indexOf(item.categoria) !== -1;
    });

    if (filtradas.length === 0) {
      container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; padding: 8px;">No hay amenazas disponibles para las categorías seleccionadas.</div>';
      return;
    }

    // Mantener sólo las amenazas seleccionadas que sigan existiendo en el filtro
    var nombresDisponibles = filtradas.map(function(x) { return x.amenaza; });
    var validSelected = self.selectedThreats.filter(function(name) {
      return nombresDisponibles.indexOf(name) !== -1;
    });

    // Si ninguna quedó seleccionada, seleccionamos por defecto la primera disponible
    if (validSelected.length === 0 && filtradas.length > 0) {
      validSelected = [filtradas[0].amenaza];
    }
    self.selectedThreats = validSelected;

    container.innerHTML = filtradas.map(function(item) {
      var isChecked = self.selectedThreats.indexOf(item.amenaza) !== -1;
      var selectedClass = isChecked ? 'selected' : '';
      var catShort = item.categoria.indexOf('CONFLICTO') !== -1 ? '🛡️ PROTECCIÓN' :
                     item.categoria.indexOf('SOCIONATURAL') !== -1 ? '🌧️ SOCIONATURAL' :
                     item.categoria.indexOf('ANTRÓPICA') !== -1 ? '🏭 ANTRÓPICA' : '🌿 NATURAL';

      return '<label class="threat-item-card ' + selectedClass + '">' +
        '<input type="checkbox" name="threat_checkbox" value="' + item.amenaza + '" ' + (isChecked ? 'checked' : '') + '>' +
        '<div>' +
          '<strong style="display:block; color:var(--text-main); font-size:0.88rem;">' + item.amenaza + '</strong>' +
          '<span class="badge-pill" style="font-size:0.72rem; margin-top:2px; background:#f1f5f9; color:#475569;">' + catShort + '</span>' +
        '</div>' +
      '</label>';
    }).join('');

    if (badge) {
      badge.textContent = self.selectedThreats.length + ' seleccionada(s)';
    }

    // Vincular eventos en cada checkbox de amenaza
    var cards = container.querySelectorAll('.threat-item-card');
    cards.forEach(function(card) {
      var chk = card.querySelector('input[type="checkbox"]');
      chk.addEventListener('change', function() {
        self.handleThreatCheckboxChange();
      });
    });
  },

  handleThreatCheckboxChange: function() {
    var container = document.getElementById('container-amenazas-checkboxes');
    var badge = document.getElementById('badge-total-amenazas');
    if (!container) return;

    var checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
    this.selectedThreats = [];
    checkedBoxes.forEach(function(chk) {
      this.selectedThreats.push(chk.value);
    }.bind(this));

    // Si desmarcó todo, mantenemos la primera del contenedor
    if (this.selectedThreats.length === 0) {
      var firstChk = container.querySelector('input[type="checkbox"]');
      if (firstChk) {
        firstChk.checked = true;
        this.selectedThreats = [firstChk.value];
      }
    }

    // Actualizar estilos de tarjeta
    var cards = container.querySelectorAll('.threat-item-card');
    cards.forEach(function(c) {
      var chk = c.querySelector('input[type="checkbox"]');
      if (chk.checked) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });

    if (badge) {
      badge.textContent = this.selectedThreats.length + ' seleccionada(s)';
    }

    this.updateAmenazaDetails();
  },

  updateAmenazaDetails: function() {
    var self = this;
    var elemEjemplo = document.getElementById('input-ejemplo-ie');
    var elemRiesgos = document.getElementById('input-riesgos-ie');
    var elemRuta = document.getElementById('input-ruta-gire');

    var selectedItems = (PGIRE_DB || []).filter(function(x) {
      return self.selectedThreats.indexOf(x.amenaza) !== -1;
    });

    if (selectedItems.length === 0) {
      if (elemEjemplo) elemEjemplo.value = 'Sin selección de amenaza';
      if (elemRiesgos) elemRiesgos.value = 'Sin selección de riesgos';
      if (elemRuta) elemRuta.value = 'Ruta estándar CIGIRE';
      return;
    }

    // Consolidar ejemplos
    var ejemplosTexto = selectedItems.map(function(it, idx) {
      return (selectedItems.length > 1 ? (idx + 1) + '. [' + it.amenaza + ']: ' : '') + it.ejemplo;
    }).join('\n');

    // Consolidar riesgos asociados
    var riesgosTexto = selectedItems.map(function(it, idx) {
      return (selectedItems.length > 1 ? (idx + 1) + '. [' + it.amenaza + ']: ' : '') + it.riesgo;
    }).join('\n');

    // Consolidar rutas únicas activadas
    var rutasUnicas = [];
    selectedItems.forEach(function(it) {
      if (rutasUnicas.indexOf(it.ruta) === -1) {
        rutasUnicas.push(it.ruta);
      }
    });
    var rutasTexto = rutasUnicas.join('\n');

    if (elemEjemplo) elemEjemplo.value = ejemplosTexto;
    if (elemRiesgos) elemRiesgos.value = riesgosTexto;
    if (elemRuta) elemRuta.value = rutasTexto;
  },

  bindEvents: function() {
    var self = this;
    var selectCiclo = document.getElementById('select-ciclo');
    var selectEtapa = document.getElementById('select-etapa');
    var inputBloom = document.getElementById('input-bloom');
    var inputNNA = document.getElementById('input-nna');
    var labelDidactica = document.getElementById('label-didactica-nna');
    var btnGuardar = document.getElementById('btn-guardar-diagnostico');

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
    var diagnostico = {
      ciclo: document.getElementById('select-ciclo') ? document.getElementById('select-ciclo').value : '3',
      etapa: document.getElementById('select-etapa') ? document.getElementById('select-etapa').value : '',
      bloom: document.getElementById('input-bloom') ? document.getElementById('input-bloom').value : '',
      categorias: this.selectedCategories,
      categoriaAmenaza: this.selectedCategories.join(' / '),
      amenazas: this.selectedThreats,
      amenaza: this.selectedThreats.join(' + '),
      ejemploIE: document.getElementById('input-ejemplo-ie') ? document.getElementById('input-ejemplo-ie').value : '',
      riesgosIE: document.getElementById('input-riesgos-ie') ? document.getElementById('input-riesgos-ie').value : '',
      rutaGIRE: document.getElementById('input-ruta-gire') ? document.getElementById('input-ruta-gire').value : '',
      grado: document.getElementById('select-grado') ? document.getElementById('select-grado').value : '',
      nna: document.getElementById('input-nna') ? document.getElementById('input-nna').value : 25,
      didacticaNNA: this.calculateDidacticaNNA(document.getElementById('input-nna') ? document.getElementById('input-nna').value : 25),
      fechaInicio: document.getElementById('input-fecha-inicio') ? document.getElementById('input-fecha-inicio').value : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };

    if (!diagnostico.etapa || this.selectedThreats.length === 0) {
      alert('Por favor complete los campos de Etapa y seleccione al menos una Amenaza para guardar el diagnóstico.');
      return;
    }

    AuthManager.saveUserData('diagnostico', diagnostico);
    this.renderDiagnosticSummary(diagnostico);
    alert('✅ Diagnóstico Paramétrico PGIRE (Multirriesgo) guardado exitosamente.');
    
    if (this.callbacks.onDiagnosticSaved) {
      this.callbacks.onDiagnosticSaved(diagnostico);
    }
  },

  renderDiagnosticSummary: function(d) {
    var container = document.getElementById('resumen-diagnostico-card');
    if (!container) return;

    var amenazasPills = (d.amenazas || [d.amenaza]).map(function(am) {
      return '<span class="badge-pill badge-etapa2" style="margin-right: 4px; margin-bottom: 4px;">' + am + '</span>';
    }).join('');

    var categoriasPills = (d.categorias || [d.categoriaAmenaza]).map(function(cat) {
      return '<span class="badge-pill badge-etapa1" style="margin-right: 4px; margin-bottom: 4px;">' + cat + '</span>';
    }).join('');

    container.style.display = 'block';
    container.innerHTML = 
      '<div style="background: var(--surface-hover); padding: 18px; border-radius: var(--radius-md); border-left: 5px solid var(--primary);">' +
        '<h4 style="color: var(--primary); font-weight: 700; margin-bottom: 8px;">🎯 Diagnóstico Paramétrico Guardado y Activo (Multirriesgo)</h4>' +
        '<div class="grid-3" style="gap: 12px; font-size: 0.88rem;">' +
          '<div><strong>Ciclo:</strong> Ciclo ' + d.ciclo + ' | <strong>Grado:</strong> ' + d.grado + '</div>' +
          '<div><strong>Etapa:</strong> ' + d.etapa + '</div>' +
          '<div><strong>Complejidad Bloom:</strong> ' + d.bloom + '</div>' +
          '<div style="grid-column: span 3;"><strong>Categoría(s) Macro:</strong> ' + categoriasPills + '</div>' +
          '<div style="grid-column: span 3;"><strong>Amenaza(s) Diagnosticada(s):</strong> ' + amenazasPills + '</div>' +
          '<div><strong>Estrategia NNA:</strong> ' + d.didacticaNNA + ' (' + d.nna + ' NNA)</div>' +
          '<div><strong>Fecha Inicio:</strong> ' + d.fechaInicio + '</div>' +
        '</div>' +
        '<div style="margin-top: 10px; font-size: 0.85rem; color: #064e3b; border-top: 1px solid var(--border-light); padding-top: 8px;">' +
          '<strong>Ruta(s) GIRE Activada(s):</strong><br><pre style="font-family: inherit; white-space: pre-wrap; margin-top: 4px;">' + d.rutaGIRE + '</pre>' +
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
        categorias: ['NATURAL'],
        categoriaAmenaza: 'NATURAL',
        amenazas: ['Inundación'],
        amenaza: 'Inundación',
        grado: 'Grado 6° (Bachillerato)',
        nna: 28,
        didacticaNNA: '👥 TRABAJO COOPERATIVO (15 a 35 NNA)',
        fechaInicio: new Date().toISOString().split('T')[0]
      };
    }

    if (d.categorias && Array.isArray(d.categorias)) {
      this.selectedCategories = d.categorias;
    } else if (d.categoriaAmenaza) {
      this.selectedCategories = [d.categoriaAmenaza];
    } else {
      this.selectedCategories = ['NATURAL'];
    }

    if (d.amenazas && Array.isArray(d.amenazas)) {
      this.selectedThreats = d.amenazas;
    } else if (d.amenaza) {
      this.selectedThreats = [d.amenaza];
    } else {
      this.selectedThreats = ['Inundación'];
    }

    if (document.getElementById('select-ciclo')) document.getElementById('select-ciclo').value = d.ciclo;
    this.updateGradosForCiclo(d.ciclo);
    if (document.getElementById('select-grado')) document.getElementById('select-grado').value = d.grado;
    if (document.getElementById('select-etapa')) document.getElementById('select-etapa').value = d.etapa;
    if (document.getElementById('input-bloom')) document.getElementById('input-bloom').value = d.bloom || this.calculateBloom(d.etapa);

    this.renderCategoryCheckboxes();
    this.renderThreatsList();
    this.updateAmenazaDetails();

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
