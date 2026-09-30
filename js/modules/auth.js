// Módulo de Autenticación, Gestión de Roles y Permisos RBAC (Secretaría de Educación Departamental / Gobernación de Norte de Santander)
// Adaptado con fidelidad al alcance pedagógico real de la Plataforma de Flexibilización y Adaptación Curricular en Emergencias.

var AuthManager = {
  // Catálogo de Roles Adaptados Estrictamente a Nuestra Herramienta Curricular:
  ROLES: {
    ADMIN: {
      id: 'ADMIN',
      nombre: 'Administrador (SED / Responsable Institucional)',
      badge: '👑 Administrador',
      badgeClass: 'badge-role-admin',
      permisos: {
        canEdit: true,
        canCreateUsers: true,
        canManagePlatform: true,
        canExportReport: true,
        description: 'Gestionar usuarios y credenciales, configurar parámetros institucionales y supervisar todos los planes curriculares de emergencia.'
      }
    },
    TECNICO: {
      id: 'TECNICO',
      nombre: 'Usuario Técnico (Equipo SED / Calidad y Cobertura)',
      badge: '🛠️ Usuario Técnico',
      badgeClass: 'badge-role-tecnico',
      permisos: {
        canEdit: true,
        canCreateUsers: false,
        canManagePlatform: false,
        canExportReport: true,
        description: 'Consultar y acompañar la flexibilización curricular de las IE del departamento; registrar y actualizar planes pedagógicos y monitoreo.'
      }
    },
    IE: {
      id: 'IE',
      nombre: 'Usuario IE (Rectores / Directivos / Docentes de la IE)',
      badge: '🏫 Usuario IE',
      badgeClass: 'badge-role-ie',
      permisos: {
        canEdit: true,
        canCreateUsers: false,
        canManagePlatform: false,
        canExportReport: true,
        description: 'Diligenciar el diagnóstico pedagógico (Módulo A), planificar la canasta en la Rayuela Curricular (Módulo B) y registrar el Monitoreo Semanal (Módulo C) de su propia institución.'
      }
    },
    CONSULTA: {
      id: 'CONSULTA',
      nombre: 'Usuario de Consulta (Docentes Observadores / Cooperantes / Veeduría)',
      badge: '👁️ Usuario de Consulta',
      badgeClass: 'badge-role-consulta',
      permisos: {
        canEdit: false,
        canCreateUsers: false,
        canManagePlatform: false,
        canExportReport: true,
        description: 'Consultar diagnósticos, explorar mallas curriculares, visualizar avances de monitoreo y exportar constancias e informes en modo lectura.'
      }
    }
  },

  getUsers: function() {
    var raw = localStorage.getItem('nrc_users');
    return raw ? JSON.parse(raw) : {};
  },

  getCurrentUser: function() {
    return localStorage.getItem('nrc_current_user') || 'admin_sed';
  },

  ensureDefaultUser: function() {
    var users = this.getUsers();
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

    var baseTemplate = {
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

    // 1. Administrador (SED / Responsable Institucional)
    if (!users['admin_sed']) {
      users['admin_sed'] = Object.assign({}, baseTemplate, {
        password: btoa('admin123*'),
        nombreCompleto: 'Administrador SED',
        institucion: 'Secretaría de Educación Departamental de Norte de Santander',
        rol: 'ADMIN',
        cargo: 'Responsable Institucional de la Plataforma'
      });
    }

    // 2. Usuario Técnico (SED)
    if (!users['tecnico_sed']) {
      users['tecnico_sed'] = Object.assign({}, baseTemplate, {
        password: btoa('tecnico123*'),
        nombreCompleto: 'Equipo Técnico Pedagógico SED',
        institucion: 'Secretaría de Educación Departamental',
        rol: 'TECNICO',
        cargo: 'Equipo de Calidad y Cobertura Educativa'
      });
    }

    // 3. Usuario IE (Institución Educativa)
    if (!users['usuario_ie']) {
      users['usuario_ie'] = Object.assign({}, baseTemplate, {
        password: btoa('ie123*'),
        nombreCompleto: 'Directivo / Docente IE',
        institucion: 'Institución Educativa Departamental',
        rol: 'IE',
        cargo: 'Directivo / Docente de la IE'
      });
    }

    // 4. Usuario de Consulta
    if (!users['usuario_consulta']) {
      users['usuario_consulta'] = Object.assign({}, baseTemplate, {
        password: btoa('consulta123*'),
        nombreCompleto: 'Usuario de Consulta',
        institucion: 'Comunidad Educativa / Organismos Cooperantes',
        rol: 'CONSULTA',
        cargo: 'Observador / Consulta de Planes'
      });
    }

    // Retrocompatibilidad con docente territorial
    if (!users['docente_nrc']) {
      users['docente_nrc'] = Object.assign({}, baseTemplate, {
        password: btoa('1234'),
        nombreCompleto: 'Docente Territorial',
        institucion: 'Institución Educativa Rural de Emergencia',
        rol: 'IE',
        cargo: 'Docente de Aula'
      });
    }

    localStorage.setItem('nrc_users', JSON.stringify(users));

    if (!localStorage.getItem('nrc_current_user')) {
      localStorage.setItem('nrc_current_user', 'admin_sed');
    }
  },

  register: function(username, password, nombreCompleto, institucion, rol) {
    var users = this.getUsers();
    if (users[username]) {
      return { success: false, message: 'El usuario ya existe.' };
    }

    var validRol = (rol && this.ROLES[rol]) ? rol : 'IE';
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
      institucion: institucion || 'Institución Educativa Departamental',
      rol: validRol,
      cargo: this.ROLES[validRol].nombre,
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
    this.applyRoleRestrictions();
    return { success: true, user: users[username] };
  },

  logout: function() {
    localStorage.removeItem('nrc_current_user');
  },

  getUserData: function() {
    this.ensureDefaultUser();
    var current = this.getCurrentUser();
    var users = this.getUsers();
    var u = users[current] || users['admin_sed'] || users['docente_nrc'] || null;
    if (u && !u.rol) {
      u.rol = 'IE';
    }
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

  getUserRoleInfo: function() {
    var u = this.getUserData();
    var r = (u && u.rol) ? u.rol : 'CONSULTA';
    return this.ROLES[r] || this.ROLES.CONSULTA;
  },

  canCurrentUserEdit: function() {
    var info = this.getUserRoleInfo();
    return !!(info.permisos && info.permisos.canEdit);
  },

  saveUserData: function(key, data) {
    if (!this.canCurrentUserEdit()) {
      console.warn('Acción bloqueada: El perfil actual tiene permisos de solo lectura.');
      return false;
    }
    this.ensureDefaultUser();
    var current = this.getCurrentUser();
    var users = this.getUsers();
    if (users[current]) {
      users[current][key] = data;

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
      return true;
    }
    return false;
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
  },

  applyRoleRestrictions: function() {
    var roleInfo = this.getUserRoleInfo();
    var canEdit = this.canCurrentUserEdit();

    // Banner de modo solo lectura
    var readOnlyBanner = document.getElementById('banner-role-readonly');
    if (!canEdit) {
      if (!readOnlyBanner) {
        readOnlyBanner = document.createElement('div');
        readOnlyBanner.id = 'banner-role-readonly';
        readOnlyBanner.className = 'role-readonly-alert';
        readOnlyBanner.innerHTML = '<span>👁️ <strong>MODO DE CONSULTA:</strong> Ha ingresado con un perfil de Solo Lectura (' + roleInfo.nombre + '). Puede navegar por las mallas curriculares, revisar diagnósticos y exportar reportes, pero no puede modificar ni guardar datos.</span>';
        var mainEl = document.querySelector('.main-container');
        if (mainEl && mainEl.firstChild) {
          mainEl.insertBefore(readOnlyBanner, mainEl.firstChild);
        }
      } else {
        readOnlyBanner.style.display = 'block';
      }
    } else if (readOnlyBanner) {
      readOnlyBanner.style.display = 'none';
    }

    // Botones de guardado/edición de nuestra herramienta
    var saveButtons = [
      'btn-guardar-diagnostico',
      'btn-guardar-monitoreo',
      'btn-sincronizar-canasta-monitoreo',
      'btn-promover-etapa',
      'btn-nuevo-diagnostico'
    ];

    saveButtons.forEach(function(btnId) {
      var btn = document.getElementById(btnId);
      if (btn) {
        if (!canEdit) {
          btn.disabled = true;
          btn.classList.add('btn-disabled-rbac');
          btn.title = 'Acción no permitida en modo consulta.';
        } else {
          btn.disabled = false;
          btn.classList.remove('btn-disabled-rbac');
          btn.title = '';
        }
      }
    });

    // Deshabilitar checkboxes y selects de la rayuela/monitoreo si es solo lectura
    document.querySelectorAll('.plan-checkbox, .select-item-state, .select-avance-accion, .input-observaciones-accion').forEach(function(el) {
      el.disabled = !canEdit;
    });
  }
};
