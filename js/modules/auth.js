// Módulo de Autenticación, Gestión de Roles y Permisos RBAC (Secretaría de Educación Departamental / Gobernación de Norte de Santander)
// Compatible con Arquitectura Offline-First y Despliegue en Subdominio Institucional
var AuthManager = {
  // Catálogo Oficial de Roles y Capacidades según requerimiento SED
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
        canSwitchIE: true,
        scopeIE: 'all',
        description: 'Crear y gestionar usuarios, asignar permisos, configurar y administrar la plataforma.'
      }
    },
    TECNICO: {
      id: 'TECNICO',
      nombre: 'Usuario Técnico (Equipo SED / Gestión del Riesgo / Planeación)',
      badge: '🛠️ Usuario Técnico',
      badgeClass: 'badge-role-tecnico',
      permisos: {
        canEdit: true,
        canCreateUsers: false,
        canManagePlatform: false,
        canExportReport: true,
        canSwitchIE: true,
        scopeIE: 'all',
        description: 'Consultar el IRE, mapas, filtros, indicadores y resultados; cargar y actualizar información según sus competencias.'
      }
    },
    IE: {
      id: 'IE',
      nombre: 'Usuario IE (Rectores / Directivos Docentes)',
      badge: '🏫 Usuario IE',
      badgeClass: 'badge-role-ie',
      permisos: {
        canEdit: true,
        canCreateUsers: false,
        canManagePlatform: false,
        canExportReport: true,
        canSwitchIE: false,
        scopeIE: 'own',
        description: 'Consultar información y resultados, y actualizar la información correspondiente a su propia institución educativa, sin modificar información de otras IE.'
      }
    },
    CONSULTA: {
      id: 'CONSULTA',
      nombre: 'Usuario de Consulta (Otros Usuarios Autorizados / Cooperantes)',
      badge: '👁️ Usuario de Consulta',
      badgeClass: 'badge-role-consulta',
      permisos: {
        canEdit: false,
        canCreateUsers: false,
        canManagePlatform: false,
        canExportReport: true,
        canSwitchIE: true,
        scopeIE: 'all',
        description: 'Consultar resultados, mapas e información habilitada, sin modificar datos.'
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
        nombreCompleto: 'Ing. Carlos Mendoza (SED Administrador TIC)',
        institucion: 'Secretaría de Educación Departamental de Norte de Santander',
        municipio: 'Cúcuta',
        dane: '154001000000',
        rol: 'ADMIN',
        cargo: 'Responsable Institucional de la Herramienta'
      });
    }

    // 2. Usuario Técnico (SED / Planeación / Gestión del Riesgo)
    if (!users['tecnico_sed']) {
      users['tecnico_sed'] = Object.assign({}, baseTemplate, {
        password: btoa('tecnico123*'),
        nombreCompleto: 'Dra. Liliana Gómez (Equipo Técnico SED / IRE)',
        institucion: 'Subsecretaría de Planeación y Gestión del Riesgo SED',
        municipio: 'Cúcuta',
        dane: '154001000001',
        rol: 'TECNICO',
        cargo: 'Especialista en Gestión del Riesgo y Emergencias'
      });
    }

    // 3. Usuario IE (Rector / Directivo Docente)
    if (!users['rector_tibucito']) {
      users['rector_tibucito'] = Object.assign({}, baseTemplate, {
        password: btoa('rector123*'),
        nombreCompleto: 'Lic. Álvaro Restrepo (Rector)',
        institucion: 'I.E. Rural Campo Dos - Sede Central',
        municipio: 'Tibú',
        dane: '254810000123',
        rol: 'IE',
        cargo: 'Rector de Institución Educativa'
      });
    }

    // 4. Usuario de Consulta (Público / Cooperantes / Veeduría)
    if (!users['consulta_nrc']) {
      users['consulta_nrc'] = Object.assign({}, baseTemplate, {
        password: btoa('consulta123*'),
        nombreCompleto: 'Equipo Humanitario de Consulta (NRC / MEN / Veeduría)',
        institucion: 'Mesa Humanitaria Departamental',
        municipio: 'Norte de Santander (Departamental)',
        dane: '000000000000',
        rol: 'CONSULTA',
        cargo: 'Observador / Cooperante Humanitario'
      });
    }

    // Compatibilidad retroactiva con docente_nrc previo
    if (!users['docente_nrc']) {
      users['docente_nrc'] = Object.assign({}, baseTemplate, {
        password: btoa('1234'),
        nombreCompleto: 'Docente Territorial NRC',
        institucion: 'Institución Educativa Rural de Emergencia',
        municipio: 'Tibú',
        dane: '254810000123',
        rol: 'IE',
        cargo: 'Docente de Aula'
      });
    }

    localStorage.setItem('nrc_users', JSON.stringify(users));

    if (!localStorage.getItem('nrc_current_user')) {
      localStorage.setItem('nrc_current_user', 'admin_sed');
    }
  },

  register: function(username, password, nombreCompleto, institucion, rol, dane, municipio) {
    var users = this.getUsers();
    if (users[username]) {
      return { success: false, message: 'El usuario ya se encuentra registrado.' };
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
      municipio: municipio || 'Norte de Santander',
      dane: dane || '154001000000',
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
      return { success: false, message: 'Usuario no registrado en el sistema institucional.' };
    }
    if (users[username].password !== btoa(password)) {
      return { success: false, message: 'Contraseña incorrecta para el usuario indicado.' };
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
      u.rol = 'IE'; // Default seguro
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
      console.warn('Acción bloqueada: El perfil actual tiene permisos de solo consulta (Read-Only).');
      return false;
    }
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

  // Aplicación Dinámica de Restricciones RBAC en la Interfaz Web
  applyRoleRestrictions: function() {
    var user = this.getUserData();
    var roleInfo = this.getUserRoleInfo();
    var canEdit = this.canCurrentUserEdit();

    // 1. Notificación o banner de solo lectura si es perfil de consulta
    var readOnlyBanner = document.getElementById('banner-role-readonly');
    if (!canEdit) {
      if (!readOnlyBanner) {
        readOnlyBanner = document.createElement('div');
        readOnlyBanner.id = 'banner-role-readonly';
        readOnlyBanner.className = 'role-readonly-alert';
        readOnlyBanner.innerHTML = '<span>👁️ <strong>MODO CONSULTA INSTITUCIONAL:</strong> Ha iniciado sesión con perfil de Solo Lectura (' + roleInfo.nombre + '). Puede navegar, aplicar filtros y exportar constancias, pero la modificación de datos y parámetros se encuentra deshabilitada.</span>';
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

    // 2. Deshabilitar o bloquear botones de guardado en modo Consulta
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
          btn.title = 'Acción bloqueada: Su perfil cuenta con acceso de consulta exclusivamente.';
        } else {
          btn.disabled = false;
          btn.classList.remove('btn-disabled-rbac');
          btn.title = '';
        }
      }
    });

    // 3. Deshabilitar selectores y checkboxes interactivos de edición si no tiene permiso
    document.querySelectorAll('.plan-checkbox, .select-item-state, .select-avance-accion, .input-observaciones-accion').forEach(function(el) {
      el.disabled = !canEdit;
    });

    // 4. Si el usuario es de rol IE, fijar y reflejar su I.E. y DANE
    var ieInput = document.getElementById('auth-ie');
    if (ieInput && roleInfo.id === 'IE' && user.institucion) {
      ieInput.value = user.institucion + (user.dane ? (' [DANE: ' + user.dane + ']') : '');
      ieInput.disabled = true;
    } else if (ieInput) {
      ieInput.disabled = false;
    }
  }
};
