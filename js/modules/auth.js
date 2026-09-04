// Módulo de Autenticación y Gestión de Usuarios Locales (Offline First)
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
      users['docente_nrc'] = {
        password: btoa('1234'),
        nombreCompleto: 'Docente Territorial NRC',
        institucion: 'Institución Educativa Rural de Emergencia',
        createdAt: new Date().toISOString(),
        diagnostico: {
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
        },
        monitoreo: {}
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
    users[username] = {
      password: btoa(password),
      nombreCompleto: nombreCompleto || username,
      institucion: institucion || 'Institución Educativa Rural',
      createdAt: new Date().toISOString(),
      diagnostico: null,
      monitoreo: {}
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
    return users[current] || users['docente_nrc'] || null;
  },

  saveUserData: function(key, data) {
    this.ensureDefaultUser();
    var current = this.getCurrentUser();
    var users = this.getUsers();
    if (users[current]) {
      users[current][key] = data;
      localStorage.setItem('nrc_users', JSON.stringify(users));
    }
  }
};
