// Módulo de Autenticación y Gestión de Usuarios Locales (Offline First con Trazabilidad Multi-Diagnóstico)
var AuthManager = {
  getUsers: function() {
    var raw = localStorage.getItem('nrc_users');
    return raw ? JSON.parse(raw) : {};
  },

  getCurrentUser: function() {
    return localStorage.getItem('nrc_current_user') || 'docente_nrc';
  },

  ensureDefaultUser: function() {
    var users = this.getUsers();
    if (!users['docente_nrc']) {
      var defaultDiag = {
        id: 'diag_default_1',
        titulo: 'Etapa 2 | Inundación (Ciclo III - Grados 6° y 7°)',
        ciclo: '3',
        ciclos: ['3'],
        grado: 'Grado 6° (Bachillerato)',
        grados: ['Grado 6° (Bachillerato)'],
        isMultigrado: false,
        etapa: 'ETAPA 2: Recuperación temprana / Lúdica',
        bloom: 'Media / Intermedia (Bloom Nivel 3-4: Aplicar / Analizar)',
        categoriasAmenaza: ['Natural'],
        categoriaAmenaza: 'Natural',
        amenaza: 'Inundación',
        amenazaPrincipal: 'Inundación',
        amenazasTop3: ['Inundación'],
        ejemploIE: '🚨 [1. Principal - Inundación]: Creciente de río o quebrada',
        riesgosIE: '🚨 [1. Principal - Inundación]: Daños a infraestructura, suspensión de actividades académicas',
        rutaGIRE: '🚨 [1. Principal - Inundación]: Mesa Territorial de Gestión del Riesgo (CMGRD / CDGRD / UNGRD) + Bomberos + Defensa Civil + Cruz Roja + Alcaldía',
        nna: 28,
        didacticaNNA: '👥 TRABAJO COOPERATIVO (15 a 35 NNA)',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaAtencion: new Date().toISOString().split('T')[0],
        desfaseDias: 0,
        desfaseSemanas: 0,
        periodoEnCurso: 'Periodo 1',
        periodosPrevios: [],
        barreras: {},
        barrerasDescripcion: '',
        createdAt: new Date().toISOString()
      };

      users['docente_nrc'] = {
        password: btoa('1234'),
        nombreCompleto: 'Docente Territorial NRC',
        institucion: 'Institución Educativa Rural de Emergencia',
        createdAt: new Date().toISOString(),
        activeDiagnosticId: 'diag_default_1',
        diagnostico: defaultDiag,
        diagnosticos: {
          'diag_default_1': {
            id: 'diag_default_1',
            savedAt: new Date().toISOString(),
            diagnostico: defaultDiag,
            estadosCurriculo: {},
            seleccionCurricular: {},
            monitoreo: {}
          }
        },
        estadosCurriculo: {},
        seleccionCurricular: {},
        monitoreo: {},
        diagnosticoHistory: [
          {
            id: 'diag_default_1',
            savedAt: new Date().toISOString(),
            diagnostico: defaultDiag
          }
        ]
      };
      localStorage.setItem('nrc_users', JSON.stringify(users));
    }
    if (!localStorage.getItem('nrc_current_user')) {
      localStorage.setItem('nrc_current_user', 'docente_nrc');
    }
  },

  register: function(username, password, nombreCompleto, institucion) {
    var users = this.getUsers();
    if (users[username]) {
      return { success: false, message: 'El usuario ya existe.' };
    }
    var newDiagId = 'diag_' + Date.now();
    var initDiag = {
      id: newDiagId,
      titulo: 'Diagnóstico Inicial de Emergencia',
      ciclo: '3',
      ciclos: ['3'],
      grado: 'Grado 6° (Bachillerato)',
      grados: ['Grado 6° (Bachillerato)'],
      isMultigrado: false,
      etapa: 'ETAPA 1: Respuesta inmediata / Contención',
      bloom: 'Baja / Esencial (Bloom Nivel 1-2: Recordar / Comprender)',
      categoriasAmenaza: ['Natural'],
      categoriaAmenaza: 'Natural',
      amenaza: 'Inundación',
      amenazaPrincipal: 'Inundación',
      amenazasTop3: ['Inundación'],
      ejemploIE: 'Afectación en sede escolar',
      riesgosIE: 'Riesgo institucional reportado',
      rutaGIRE: 'Ruta PGIRE',
      nna: 25,
      didacticaNNA: '👥 TRABAJO COOPERATIVO (15 a 35 NNA)',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaAtencion: new Date().toISOString().split('T')[0],
      desfaseDias: 0,
      desfaseSemanas: 0,
      periodoEnCurso: 'Periodo 1',
      periodosPrevios: [],
      barreras: {},
      barrerasDescripcion: '',
      createdAt: new Date().toISOString()
    };

    users[username] = {
      password: btoa(password),
      nombreCompleto: nombreCompleto || username,
      institucion: institucion || 'Institución Educativa Rural',
      createdAt: new Date().toISOString(),
      activeDiagnosticId: newDiagId,
      diagnostico: initDiag,
      diagnosticos: {
        [newDiagId]: {
          id: newDiagId,
          savedAt: new Date().toISOString(),
          diagnostico: initDiag,
          estadosCurriculo: {},
          seleccionCurricular: {},
          monitoreo: {}
        }
      },
      estadosCurriculo: {},
      seleccionCurricular: {},
      monitoreo: {},
      diagnosticoHistory: [
        {
          id: newDiagId,
          savedAt: new Date().toISOString(),
          diagnostico: initDiag
        }
      ]
    };
    localStorage.setItem('nrc_users', JSON.stringify(users));
    this.login(username, password);
    return { success: true };
  },

  login: function(username, password) {
    var users = this.getUsers();
    if (!users[username]) {
      return { success: false, message: 'Usuario no registrado.' };
    }
    if (users[username].password !== btoa(password)) {
      return { success: false, message: 'Contraseña incorrecta.' };
    }
    localStorage.setItem('nrc_current_user', username);
    return { success: true, user: users[username] };
  },

  logout: function() {
    localStorage.removeItem('nrc_current_user');
  },

  getUserData: function() {
    this.ensureDefaultUser();
    var current = this.getCurrentUser();
    var users = this.getUsers();
    var u = users[current] || users['docente_nrc'] || null;
    if (u && !u.diagnosticos) {
      u.diagnosticos = {};
      var d = u.diagnostico || {};
      var diagId = d.id || ('diag_' + Date.now());
      d.id = diagId;
      u.activeDiagnosticId = diagId;
      u.diagnosticos[diagId] = {
        id: diagId,
        savedAt: d.createdAt || new Date().toISOString(),
        diagnostico: d,
        estadosCurriculo: u.estadosCurriculo || {},
        seleccionCurricular: u.seleccionCurricular || {},
        monitoreo: u.monitoreo || {}
      };
      users[current] = u;
      localStorage.setItem('nrc_users', JSON.stringify(users));
    }
    return u;
  },

  saveUserData: function(key, data) {
    this.ensureDefaultUser();
    var current = this.getCurrentUser();
    var users = this.getUsers();
    if (users[current]) {
      users[current][key] = data;

      // Mantener vinculación con el diagnóstico activo
      var activeId = users[current].activeDiagnosticId || (users[current].diagnostico && users[current].diagnostico.id) || 'diag_default_1';
      users[current].diagnosticos = users[current].diagnosticos || {};
      
      if (!users[current].diagnosticos[activeId]) {
        users[current].diagnosticos[activeId] = {
          id: activeId,
          savedAt: new Date().toISOString(),
          diagnostico: users[current].diagnostico || {},
          estadosCurriculo: {},
          seleccionCurricular: {},
          monitoreo: {}
        };
      }

      var currentDiagEntry = users[current].diagnosticos[activeId];
      if (key === 'diagnostico') {
        currentDiagEntry.diagnostico = data;
        currentDiagEntry.id = data.id || activeId;
        users[current].activeDiagnosticId = currentDiagEntry.id;
      } else if (key === 'monitoreo') {
        currentDiagEntry.monitoreo = data;
      } else if (key === 'estadosCurriculo') {
        currentDiagEntry.estadosCurriculo = data;
      } else if (key === 'seleccionCurricular') {
        currentDiagEntry.seleccionCurricular = data;
      }

      currentDiagEntry.updatedAt = new Date().toISOString();
      localStorage.setItem('nrc_users', JSON.stringify(users));
    }
  },

  setActiveDiagnostic: function(diagId) {
    this.ensureDefaultUser();
    var current = this.getCurrentUser();
    var users = this.getUsers();
    if (users[current] && users[current].diagnosticos && users[current].diagnosticos[diagId]) {
      var entry = users[current].diagnosticos[diagId];
      users[current].activeDiagnosticId = diagId;
      users[current].diagnostico = entry.diagnostico || {};
      users[current].estadosCurriculo = entry.estadosCurriculo || {};
      users[current].seleccionCurricular = entry.seleccionCurricular || {};
      users[current].monitoreo = entry.monitoreo || {};
      localStorage.setItem('nrc_users', JSON.stringify(users));
      return entry;
    }
    return null;
  }
};
