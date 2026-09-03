// Controlador Principal de la Aplicación Web NRC
function initApp() {
  AuthManager.ensureDefaultUser();
  initAuthUI();
  initFeedbackUI();
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

      if (targetId === 'tab-rayuela') {
        ModuloB.renderRayuela();
      } else if (targetId === 'tab-monitoreo') {
        ModuloC.renderMonitoreo();
      }
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

function initFeedbackUI() {
  var modalFeedback = document.getElementById('modal-feedback');
  var btnHeader = document.getElementById('btn-header-feedback');
  var btnFloating = document.getElementById('btn-floating-feedback');
  var btnClose = document.getElementById('btn-close-feedback-modal');
  var formEvaluador = document.getElementById('form-evaluador');
  var statusBadge = document.getElementById('feedback-status-msg');
  var starIcons = document.querySelectorAll('#star-rating .star-icon');
  var starsInput = document.getElementById('feedback-stars-val');

  if (btnHeader) {
    btnHeader.addEventListener('click', function() {
      if (modalFeedback) modalFeedback.style.display = 'flex';
    });
  }

  if (btnFloating) {
    btnFloating.addEventListener('click', function() {
      if (modalFeedback) modalFeedback.style.display = 'flex';
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', function() {
      if (modalFeedback) modalFeedback.style.display = 'none';
    });
  }

  if (starIcons.length > 0) {
    starIcons.forEach(function(star) {
      star.addEventListener('click', function() {
        var val = parseInt(this.getAttribute('data-value'), 10);
        if (starsInput) starsInput.value = val;
        starIcons.forEach(function(s, idx) {
          if (idx < val) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
      });
    });
  }

  if (formEvaluador) {
    formEvaluador.addEventListener('submit', function(e) {
      e.preventDefault();

      var evaluador = document.getElementById('feedback-evaluador') ? document.getElementById('feedback-evaluador').value.trim() : '';
      var entidad = document.getElementById('feedback-entidad') ? document.getElementById('feedback-entidad').value.trim() : 'No especificada';
      var modulo = document.getElementById('feedback-modulo') ? document.getElementById('feedback-modulo').value : 'General';
      var emailContact = document.getElementById('feedback-email') ? document.getElementById('feedback-email').value.trim() : 'No proporcionado';
      var estrellas = starsInput ? starsInput.value : '5';
      var comentarios = document.getElementById('feedback-comentarios') ? document.getElementById('feedback-comentarios').value.trim() : '';

      if (!evaluador || !comentarios) {
        if (statusBadge) {
          statusBadge.className = 'feedback-status-badge error';
          statusBadge.textContent = '⚠️ Por favor complete su nombre y las observaciones de mejora.';
        }
        return;
      }

      if (statusBadge) {
        statusBadge.className = 'feedback-status-badge loading';
        statusBadge.textContent = '⌛ Enviando retroalimentación a juanitospt@gmail.com...';
      }

      var payload = {
        _subject: "[Evaluación Web NRC] Nueva retroalimentación de evaluador: " + evaluador,
        "Evaluador / Rol": evaluador,
        "Entidad / Institución": entidad,
        "Módulo Evaluado": modulo,
        "Correo del Evaluador": emailContact,
        "Calificación": estrellas + " de 5 estrellas",
        "Comentarios y Sugerencias": comentarios,
        "_template": "table"
      };

      fetch('https://formsubmit.co/ajax/juanitospt@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (statusBadge) {
          statusBadge.className = 'feedback-status-badge success';
          statusBadge.innerHTML = '✅ <strong>¡Comentario enviado exitosamente!</strong> Gracias por su evaluación. Las observaciones han sido enviadas a juanitospt@gmail.com.';
        }
        formEvaluador.reset();
        if (starsInput) starsInput.value = '5';
        starIcons.forEach(function(s) { s.classList.add('active'); });
      })
      .catch(function(err) {
        if (statusBadge) {
          statusBadge.className = 'feedback-status-badge error';
          statusBadge.textContent = '❌ Hubo un error al enviar el formulario. Inténtelo nuevamente.';
        }
      });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
