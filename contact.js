/* ═══════════════════════════════════════════════
   CONTACT.JS — Form validation + Web3Forms submit
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});

function initContactForm() {
  const form      = document.getElementById('contactForm');
  const success   = document.getElementById('contactSuccess');
  const submitBtn = form ? form.querySelector('.form-submit') : null;
  const submitErr = form ? form.querySelector('.form-submit-error') : null;

  if (!form) return;

  const fields = {
    name:     { el: form.querySelector('#name'),     msg: 'Please enter your name.' },
    business: { el: form.querySelector('#business'), msg: 'Please enter your business name.' },
    email:    { el: form.querySelector('#email'),    msg: 'Please enter a valid email address.' },
    message:  { el: form.querySelector('#message'),  msg: 'Please tell us about your project.' },
  };

  /* ── Helpers ── */

  function setError(id, message) {
    const input = fields[id].el;
    const err   = document.getElementById(id + '-error');
    if (!input || !err) return;
    input.classList.add('is-error');
    input.setAttribute('aria-invalid', 'true');
    err.textContent = message;
  }

  function clearError(id) {
    const input = fields[id].el;
    const err   = document.getElementById(id + '-error');
    if (!input || !err) return;
    input.classList.remove('is-error');
    input.removeAttribute('aria-invalid');
    err.textContent = '';
  }

  function validateField(id) {
    const { el, msg } = fields[id];
    if (!el) return true;
    if (!el.validity.valid) {
      setError(id, msg);
      return false;
    }
    clearError(id);
    return true;
  }

  function resetSubmitBtn() {
    if (!submitBtn) return;
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Send it →';
  }

  /* ── Live feedback: clear error once field is valid ── */

  Object.keys(fields).forEach(id => {
    const el = fields[id].el;
    if (!el) return;
    el.addEventListener('blur',  () => validateField(id));
    el.addEventListener('input', () => {
      if (el.classList.contains('is-error')) validateField(id);
    });
  });

  /* ── Submit ── */

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitErr) submitErr.textContent = '';

    /* Validate all required fields */
    let allValid = true;
    Object.keys(fields).forEach(id => {
      if (!validateField(id)) allValid = false;
    });

    if (!allValid) {
      const firstErrorId = Object.keys(fields).find(id => {
        const el = fields[id].el;
        return el && el.classList.contains('is-error');
      });
      if (firstErrorId) fields[firstErrorId].el.focus();
      return;
    }

    /* Lock button while sending */
    if (submitBtn) {
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Sending…';
    }

    /* POST to Web3Forms */
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: new FormData(form),
    })
      .then(res => res.json())
      .then(json => {
        if (!json.success) throw new Error(json.message || 'Submission failed.');
        /* Show success state */
        form.style.display = 'none';
        if (success) success.hidden = false;
      })
      .catch(() => {
        resetSubmitBtn();
        if (submitErr) {
          submitErr.textContent =
            'Something went wrong — please try again or reach us on Instagram.';
        }
      });
  });
}
