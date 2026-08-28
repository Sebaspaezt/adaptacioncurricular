// Controlador Principal de la Aplicación Web NRC
function initApp() {
  AuthManager.ensureDefaultUser();
  initAuthUI();
  initNavigation();
  initAccordions();

  // Iniciar Módulos
  ModuloA.init({
    onDiagnosticSaved: function(d) {
      ModuloB.renderRayuela();
      ModuloC.renderMonitoreo();
    }
  });
  ModuloB.init();
  ModuloC.init();
}

function initAuthUI() {
  var modalAuth = document.getElementById('modal-auth');
  var btnLogin = document.getElementById('btn-login-submit');
  var btnRegister = document.getElementById('btn-register-submit');
  var btnLogout = document.getElementById('btn-logout');
  var userDisplay = document.getElementById('user-display-name');
  var userBadge = document.getElementById('user-profile-badge');
  var btnCloseModal = document.getElementById('btn-close-modal');

  function updateDisplay() {
    var user = AuthManager.getUserData();
    if (userDisplay && user) {
      userDisplay.textContent = user.nombreCompleto || 'Docente Territorial';
    }
  }

  updateDisplay();

  if (userBadge) {
    userBadge.addEventListener('click', function() {
      if (modalAuth) modalAuth.style.display = 'flex';
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', function() {
      if (modalAuth) modalAuth.style.display = 'none';
    });
  }

  if (btnLogin) {
    btnLogin.addEventListener('click', function(e) {
      e.preventDefault();
      var u = document.getElementById('auth-user') ? document.getElementById('auth-user').value.trim() : '';
      var p = document.getElementById('auth-pass') ? document.getElementById('auth-pass').value : '';
      if (!u || !p) return alert('Por favor ingrese usuario y contraseña.');
      var res = AuthManager.login(u, p);
      if (res.success) {
        if (modalAuth) modalAuth.style.display = 'none';
        updateDisplay();
        ModuloA.loadSavedDiagnostic();
        ModuloB.renderRayuela();
        ModuloC.renderMonitoreo();
        alert('Bienvenido/a, ' + (res.user.nombreCompleto || u));
      } else {
        alert(res.message);
      }
    });
  }

  if (btnRegister) {
    btnRegister.addEventListener('click', function(e) {
      e.preventDefault();
      var u = document.getElementById('auth-user') ? document.getElementById('auth-user').value.trim() : '';
      var p = document.getElementById('auth-pass') ? document.getElementById('auth-pass').value : '';
      var n = document.getElementById('auth-name') ? document.getElementById('auth-name').value.trim() : '';
      var ie = document.getElementById('auth-ie') ? document.getElementById('auth-ie').value.trim() : '';
      if (!u || !p) return alert('Por favor ingrese usuario y contraseña.');
      var res = AuthManager.register(u, p, n, ie);
      if (res.success) {
        if (modalAuth) modalAuth.style.display = 'none';
        updateDisplay();
        alert('Perfil docente creado exitosamente.');
      } else {
        alert(res.message);
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', function() {
      if (modalAuth) modalAuth.style.display = 'flex';
    });
  }
}

function initNavigation() {
  var tabs = document.querySelectorAll('.nav-tab');
  var sections = {
    'tab-diagnostico': document.getElementById('section-diagnostico'),
    'tab-rayuela': document.getElementById('section-rayuela'),
    'tab-monitoreo': document.getElementById('section-monitoreo')
  };

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');

      var targetId = tab.id;
      Object.keys(sections).forEach(function(id) {
        var elem = sections[id];
        if (elem) {
          elem.style.display = (id === targetId) ? 'block' : 'none';
        }
      });
    });
  });
}

function initAccordions() {
  var items = document.querySelectorAll('.accordion-item');
  items.forEach(function(item) {
    var header = item.querySelector('.accordion-header');
    if (header) {
      header.addEventListener('click', function() {
        item.classList.toggle('open');
      });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
