/* ----------------------------------------------------
   1. DOM ELEMENTS SELECTION
   ---------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Elements
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  
  // Card and Form Switcher Elements
  const authCard = document.getElementById('authCard');
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');
  const tabSlider = document.getElementById('tabSlider');
  const signInWrapper = document.getElementById('signInWrapper');
  const signUpWrapper = document.getElementById('signUpWrapper');
  
  // Form Elements
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  
  // Password Fields Toggles
  const signInPasswordToggle = document.getElementById('signInPasswordToggle');
  const signInPassword = document.getElementById('signInPassword');
  const signUpPasswordToggle = document.getElementById('signUpPasswordToggle');
  const signUpPassword = document.getElementById('signUpPassword');
  const signUpConfirmPasswordToggle = document.getElementById('signUpConfirmPasswordToggle');
  const signUpConfirmPassword = document.getElementById('signUpConfirmPassword');

  // Forgot password elements
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  
  // Notification Container
  const toastContainer = document.getElementById('toastContainer');

  // Initialize Lucide icons
  lucide.createIcons();

  /* ----------------------------------------------------
     2. THEME CONFIGURATION (LIGHT & DARK MODES)
     ---------------------------------------------------- */
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');
  
  document.documentElement.setAttribute('data-theme', initialTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    showToast({
      title: `${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} Enabled`,
      desc: `Visual theme has been updated to ${newTheme} mode.`,
      type: 'info'
    });
  });

  /* ----------------------------------------------------
     3. TAB SWITCHING LOGIC (SIGN IN / SIGN UP)
     ---------------------------------------------------- */
  function switchTab(target) {
    if (target === 'signup') {
      tabSignIn.classList.remove('active');
      tabSignUp.classList.add('active');
      tabSlider.style.transform = 'translateX(100%)';
      
      // Animate form switch
      signInWrapper.classList.remove('active');
      setTimeout(() => {
        signInWrapper.style.display = 'none';
        signUpWrapper.style.display = 'block';
        setTimeout(() => {
          signUpWrapper.classList.add('active');
        }, 50);
      }, 300);
      
    } else {
      tabSignUp.classList.remove('active');
      tabSignIn.classList.add('active');
      tabSlider.style.transform = 'translateX(0)';
      
      // Animate form switch
      signUpWrapper.classList.remove('active');
      setTimeout(() => {
        signUpWrapper.style.display = 'none';
        signInWrapper.style.display = 'block';
        setTimeout(() => {
          signInWrapper.classList.add('active');
        }, 50);
      }, 300);
    }
    
    // Clear validation states on tab switch
    clearAllValidationErrors();
  }

  tabSignIn.addEventListener('click', () => switchTab('signin'));
  tabSignUp.addEventListener('click', () => switchTab('signup'));

  /* ----------------------------------------------------
     4. PASSWORD VISIBILITY TOGGLE BEHAVIORS
     ---------------------------------------------------- */
  function setupPasswordToggle(toggleBtn, inputField) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = inputField.getAttribute('type') === 'password';
      inputField.setAttribute('type', isPassword ? 'text' : 'password');
      
      const eyeIcon = toggleBtn.querySelector('.toggle-icon-eye');
      const eyeOffIcon = toggleBtn.querySelector('.toggle-icon-eyeoff');
      
      if (isPassword) {
        eyeIcon.classList.add('hidden');
        eyeOffIcon.classList.remove('hidden');
      } else {
        eyeIcon.classList.remove('hidden');
        eyeOffIcon.classList.add('hidden');
      }
    });
  }

  setupPasswordToggle(signInPasswordToggle, signInPassword);
  setupPasswordToggle(signUpPasswordToggle, signUpPassword);
  setupPasswordToggle(signUpConfirmPasswordToggle, signUpConfirmPassword);

  /* ----------------------------------------------------
     5. TOAST NOTIFICATION CREATION SYSTEM
     ---------------------------------------------------- */
  function showToast({ title, desc, type = 'info' }) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';
    
    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <div class="toast-content">
        <h4 class="toast-title">${title}</h4>
        <p class="toast-desc">${desc}</p>
      </div>
      <button class="toast-close" type="button" aria-label="Close notification">
        <i data-lucide="x"></i>
      </button>
    `;
    
    toastContainer.appendChild(toast);
    lucide.createIcons(); // Instantiates generated elements

    // Set close click handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      removeToast(toast);
    });

    // Automatically remove after duration
    const timeoutId = setTimeout(() => {
      removeToast(toast);
    }, 4500);

    toast.dataset.timeoutId = timeoutId;
  }

  function removeToast(toast) {
    if (toast.classList.contains('removing')) return;
    toast.classList.add('removing');
    
    // Clear dynamic automatic execution trigger
    if (toast.dataset.timeoutId) {
      clearTimeout(parseInt(toast.dataset.timeoutId, 10));
    }
    
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }

  // Trigger default welcome notification after delay
  setTimeout(() => {
    showToast({
      title: 'Portal Ready',
      desc: 'Sign in to access your administrative dashboard workspace.',
      type: 'info'
    });
  }, 1000);

  // Forgot Password trigger
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    showToast({
      title: 'Password Reset Sent',
      desc: 'Check your email for reset instructions. (Mocked feature)',
      type: 'success'
    });
  });

  /* ----------------------------------------------------
     6. FORM INPUT VALIDATION MECHANISMS
     ---------------------------------------------------- */
  function showError(inputElement, errorElement, message) {
    const group = inputElement.closest('.input-group');
    group.classList.add('invalid');
    errorElement.textContent = message;
  }

  function clearError(inputElement, errorElement) {
    const group = inputElement.closest('.input-group');
    group.classList.remove('invalid');
    errorElement.textContent = '';
  }

  function clearAllValidationErrors() {
    document.querySelectorAll('.input-group').forEach(group => {
      group.classList.remove('invalid');
    });
    document.querySelectorAll('.error-msg').forEach(msg => {
      msg.textContent = '';
    });
  }

  function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  // Add blur validation to elements for reactive fields
  const fields = [
    { input: document.getElementById('signInEmail'), error: document.getElementById('signInEmailError'), type: 'email' },
    { input: document.getElementById('signInPassword'), error: document.getElementById('signInPasswordError'), type: 'password' },
    { input: document.getElementById('signUpName'), error: document.getElementById('signUpNameError'), type: 'required', label: 'Full name' },
    { input: document.getElementById('signUpEmail'), error: document.getElementById('signUpEmailError'), type: 'email' },
    { input: document.getElementById('signUpPassword'), error: document.getElementById('signUpPasswordError'), type: 'password-strength' },
    { input: document.getElementById('signUpConfirmPassword'), error: document.getElementById('signUpConfirmPasswordError'), type: 'confirm-password' }
  ];

  fields.forEach(field => {
    if (!field.input) return;
    
    field.input.addEventListener('blur', () => {
      validateField(field);
    });
    
    // Live clearing error as user types to feel responsive
    field.input.addEventListener('input', () => {
      const group = field.input.closest('.input-group');
      if (group.classList.contains('invalid')) {
        validateField(field);
      }
    });
  });

  function validateField(field) {
    const val = field.input.value.trim();

    if (val === '' && field.type !== 'confirm-password') {
      showError(field.input, field.error, `${field.label || 'This field'} is required.`);
      return false;
    }

    if (field.type === 'email') {
      if (!validateEmail(val)) {
        showError(field.input, field.error, 'Please enter a valid email address.');
        return false;
      }
    }

    if (field.type === 'password' && val.length < 8) {
      showError(field.input, field.error, 'Password must be at least 8 characters.');
      return false;
    }

    if (field.type === 'password-strength') {
      if (val.length < 8) {
        showError(field.input, field.error, 'Password must be at least 8 characters.');
        return false;
      }
      // Strength logic mock
      const hasNumber = /\d/.test(val);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);
      if (!hasNumber || !hasSpecial) {
        showError(field.input, field.error, 'Must include at least 1 number and 1 special character.');
        return false;
      }
    }

    if (field.type === 'confirm-password') {
      const originalPassword = document.getElementById('signUpPassword').value;
      if (val === '') {
        showError(field.input, field.error, 'Please confirm your password.');
        return false;
      }
      if (val !== originalPassword) {
        showError(field.input, field.error, 'Passwords do not match.');
        return false;
      }
    }

    clearError(field.input, field.error);
    return true;
  }

  /* ----------------------------------------------------
     7. BUTTON RIPPLE DYNAMIC MOCK FEEDBACK
     ---------------------------------------------------- */
  function createRipple(event, button) {
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];

    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
    
    circle.addEventListener('animationend', () => {
      circle.remove();
    });
  }

  document.querySelectorAll('.submit-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      createRipple(e, this);
    });
  });

  /* ----------------------------------------------------
     8. SIGN IN FORM SUBMISSION STATE MANAGEMENT
     ---------------------------------------------------- */
  signInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const emailField = fields.find(f => f.input.id === 'signInEmail');
    const passField = fields.find(f => f.input.id === 'signInPassword');
    
    const isEmailValid = validateField(emailField);
    const isPassValid = validateField(passField);
    
    if (!isEmailValid || !isPassValid) {
      triggerCardShakeAnimation();
      showToast({
        title: 'Authentication Failed',
        desc: 'Please correct highlighted errors and try again.',
        type: 'error'
      });
      return;
    }

    // Execute mock valid submission spinner state
    const submitBtn = document.getElementById('signInSubmitBtn');
    executeMockSubmission(submitBtn, () => {
      showToast({
        title: 'Welcome Back!',
        desc: `Access granted for ${document.getElementById('signInEmail').value}.`,
        type: 'success'
      });
      // Optionally reset form
      signInForm.reset();
      clearAllValidationErrors();
    });
  });

  /* ----------------------------------------------------
     9. SIGN UP FORM SUBMISSION STATE MANAGEMENT
     ---------------------------------------------------- */
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameField = fields.find(f => f.input.id === 'signUpName');
    const emailField = fields.find(f => f.input.id === 'signUpEmail');
    const passField = fields.find(f => f.input.id === 'signUpPassword');
    const confField = fields.find(f => f.input.id === 'signUpConfirmPassword');
    const termsCheckbox = document.getElementById('signUpTerms');
    const termsError = document.getElementById('signUpTermsError');
    
    const isNameValid = validateField(nameField);
    const isEmailValid = validateField(emailField);
    const isPassValid = validateField(passField);
    const isConfValid = validateField(confField);
    
    let isTermsValid = true;
    if (!termsCheckbox.checked) {
      termsError.textContent = 'You must accept the terms of service to proceed.';
      termsError.style.opacity = '1';
      termsError.style.transform = 'translateY(0)';
      isTermsValid = false;
    } else {
      termsError.textContent = '';
      termsError.style.opacity = '0';
      termsError.style.transform = 'translateY(-5px)';
    }

    if (!isNameValid || !isEmailValid || !isPassValid || !isConfValid || !isTermsValid) {
      triggerCardShakeAnimation();
      showToast({
        title: 'Registration Blocked',
        desc: 'Please fill in all mandatory field requirements.',
        type: 'error'
      });
      return;
    }

    // Execute mock registration
    const submitBtn = document.getElementById('signUpSubmitBtn');
    executeMockSubmission(submitBtn, () => {
      showToast({
        title: 'Account Created',
        desc: 'Your profile has been created successfully. Welcome aboard!',
        type: 'success'
      });
      // Switch view back to sign in automatically
      setTimeout(() => {
        signUpForm.reset();
        switchTab('signin');
      }, 1000);
    });
  });

  /* ----------------------------------------------------
     10. COMMON UTILITIES & TIMEOUT EFFECTS
     ---------------------------------------------------- */
  function triggerCardShakeAnimation() {
    authCard.classList.remove('shake');
    void authCard.offsetWidth; // Triggers reflow to re-fire layout calculations
    authCard.classList.add('shake');
    
    authCard.addEventListener('animationend', function handler() {
      authCard.classList.remove('shake');
      authCard.removeEventListener('animationend', handler);
    });
  }

  function executeMockSubmission(button, successCallback) {
    // Show loader
    button.classList.add('loading');
    
    // Select loader subelements
    const textSpan = button.querySelector('.btn-text');
    const arrowIcon = button.querySelector('.btn-arrow');
    const spinner = button.querySelector('.btn-spinner');
    const checkIcon = button.querySelector('.btn-check-icon');

    spinner.classList.remove('hidden');
    
    // Mock network request delays
    setTimeout(() => {
      // Hide loader
      spinner.classList.add('hidden');
      button.classList.remove('loading');
      
      // Success check animations
      button.classList.add('success');
      checkIcon.classList.remove('hidden');
      
      successCallback();
      
      // Reset button state
      setTimeout(() => {
        button.classList.remove('success');
        checkIcon.classList.add('hidden');
        textSpan.style.display = '';
        if (arrowIcon) arrowIcon.style.display = '';
      }, 2000);
      
    }, 2000);
  }
});
