// Controlador Principal de la Aplicación Web NRC
function initApp() {
  try {
    AuthManager.ensureDefaultUser();
    initAuthUI();
    initFeedbackUI();
    initNavigation();
    initAccordions();

    // Iniciar Módulos
    ModuloA.init({
      onDiagnosticSaved: function(d) {
        if (typeof ModuloB !== 'undefined' && ModuloB.renderRayuela) ModuloB.renderRayuela();
        if (typeof ModuloC !== 'undefined' && ModuloC.renderMonitoreo) ModuloC.renderMonitoreo();
      },
      onDiagnosticChanged: function(d) {
        if (typeof ModuloB !== 'undefined' && ModuloB.renderRayuela) ModuloB.renderRayuela();
        if (typeof ModuloC !== 'undefined' && ModuloC.renderMonitoreo) ModuloC.renderMonitoreo();
      }
    });
    if (typeof ModuloB !== 'undefined' && ModuloB.init) ModuloB.init();
    if (typeof ModuloC !== 'undefined' && ModuloC.init) ModuloC.init();
  } catch (e) {
    console.error('Error during initApp:', e);
  }
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

window.switchTab = function(tabId) {
  try {
    var tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(function(t) {
      if (t.id === tabId) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    var secDiag = document.getElementById('section-diagnostico');
    var secRay = document.getElementById('section-rayuela');
    var secMon = document.getElementById('section-monitoreo');

    if (secDiag) secDiag.style.display = (tabId === 'tab-diagnostico') ? 'block' : 'none';
    if (secRay) secRay.style.display = (tabId === 'tab-rayuela') ? 'block' : 'none';
    if (secMon) secMon.style.display = (tabId === 'tab-monitoreo') ? 'block' : 'none';

    if (tabId === 'tab-rayuela') {
      if (typeof ModuloB !== 'undefined' && ModuloB.renderRayuela) {
        ModuloB.renderRayuela();
      }
    } else if (tabId === 'tab-monitoreo') {
      if (typeof ModuloC !== 'undefined' && ModuloC.renderMonitoreo) {
        ModuloC.renderMonitoreo();
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    console.error('Error switching tab:', e);
  }
};

function initNavigation() {
  var tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      window.switchTab(tab.id);
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
      var emailContact = document.getElementById('feedback-email') ? document.getElementById('feedback-email').value.trim() : 'No proporcionado';
      var estrellas = starsInput ? starsInput.value : '5';

      var obsModuloA = document.getElementById('feedback-modulo-a') ? document.getElementById('feedback-modulo-a').value.trim() : '';
      var obsModuloB = document.getElementById('feedback-modulo-b') ? document.getElementById('feedback-modulo-b').value.trim() : '';
      var obsModuloC = document.getElementById('feedback-modulo-c') ? document.getElementById('feedback-modulo-c').value.trim() : '';

      if (!evaluador) {
        if (statusBadge) {
          statusBadge.className = 'feedback-status-badge error';
          statusBadge.textContent = '⚠️ Por favor ingrese su Nombre o Rol de evaluador.';
        }
        return;
      }

      if (!obsModuloA && !obsModuloB && !obsModuloC) {
        if (statusBadge) {
          statusBadge.className = 'feedback-status-badge error';
          statusBadge.textContent = '⚠️ Por favor diligencie las observaciones en al menos uno de los 3 módulos (A, B o C).';
        }
        return;
      }

      if (statusBadge) {
        statusBadge.className = 'feedback-status-badge loading';
        statusBadge.textContent = '⌛ Enviando retroalimentación multimódulo y evidencias a juanitospt@gmail.com...';
      }

      var formData = new FormData();
      formData.append('_subject', '[Evaluación Web NRC] Nueva retroalimentación multimódulo de: ' + evaluador);
      formData.append('Evaluador / Rol', evaluador);
      formData.append('Entidad / Institución', entidad);
      formData.append('Correo del Evaluador', emailContact);
      formData.append('Calificación General', estrellas + ' de 5 estrellas');
      formData.append('1. Observaciones Módulo A (Diagnóstico)', obsModuloA || 'Sin observaciones');
      formData.append('2. Observaciones Módulo B (Rayuela Curricular)', obsModuloB || 'Sin observaciones');
      formData.append('3. Observaciones Módulo C (Monitoreo Semanal)', obsModuloC || 'Sin observaciones');
      formData.append('_template', 'table');

      var fileInput = document.getElementById('feedback-adjuntos');
      if (fileInput && fileInput.files.length > 0) {
        for (var i = 0; i < fileInput.files.length; i++) {
          formData.append('pantallazo_' + (i + 1), fileInput.files[i]);
        }
      }

      fetch('https://formsubmit.co/ajax/juanitospt@gmail.com', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (statusBadge) {
          statusBadge.className = 'feedback-status-badge success';
          statusBadge.innerHTML = '✅ <strong>¡Evaluación y pantallazos enviados exitosamente!</strong> Gracias por su realimentación. Los informes han sido enviados a juanitospt@gmail.com.';
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
