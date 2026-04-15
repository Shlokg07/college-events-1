// Forgot Password JavaScript - Password Recovery Flow

// Track the current step
let currentStep = 1;
let recoveryEmail = '';
let verificationCodeSent = false;
let codeVerified = false;

// Step 1: Send Reset Code to Email
function sendResetCode() {
  recoveryEmail = document.getElementById('recoveryEmail').value.trim();
  
  // Validate email
  if (!recoveryEmail) {
    alert('Please enter your email address');
    return;
  }
  
  if (!isValidEmail(recoveryEmail)) {
    alert('Please enter a valid email address');
    return;
  }
  
  // Show loading state
  const button = document.querySelector('#step1 button');
  const originalText = button.textContent;
  button.textContent = 'Sending...';
  button.disabled = true;
  
  // Call API to send reset code
  api.sendPasswordResetCode(recoveryEmail)
    .then(response => {
      console.log('✓ Reset code sent to:', recoveryEmail);
      alert('✓ A verification code has been sent to ' + recoveryEmail);
      verificationCodeSent = true;
      
      // Move to step 2
      moveToStep(2);
      
      button.textContent = originalText;
      button.disabled = false;
    })
    .catch(error => {
      console.error('✗ Failed to send reset code:', error);
      alert('✗ Error: ' + (error.message || 'Could not send reset code. Please try again.'));
      
      button.textContent = originalText;
      button.disabled = false;
    });
}

// Step 2: Verify the code received
function verifyCode() {
  const code = document.getElementById('verificationCode').value.trim();
  
  // Validate code format
  if (!code) {
    alert('Please enter the verification code');
    return;
  }
  
  if (code.length !== 6) {
    alert('Verification code must be 6 digits');
    return;
  }
  
  if (!/^\d+$/.test(code)) {
    alert('Verification code must contain only numbers');
    return;
  }
  
  // Show loading state
  const button = document.querySelector('#step2 button');
  const originalText = button.textContent;
  button.textContent = 'Verifying...';
  button.disabled = true;
  
  // Call API to verify code
  api.verifyPasswordResetCode(recoveryEmail, code)
    .then(response => {
      console.log('✓ Code verified successfully');
      alert('✓ Verification code accepted');
      codeVerified = true;
      
      // Move to step 3
      moveToStep(3);
      
      button.textContent = originalText;
      button.disabled = false;
    })
    .catch(error => {
      console.error('✗ Code verification failed:', error);
      alert('✗ Invalid code: ' + (error.message || 'Please check and try again.'));
      
      button.textContent = originalText;
      button.disabled = false;
    });
}

// Step 3: Reset Password
function resetPassword() {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmNewPassword').value;
  
  // Validate passwords
  if (!newPassword || !confirmPassword) {
    alert('Please enter both password fields');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  if (!validatePassword(newPassword)) {
    alert('Password does not meet the security requirements');
    return;
  }
  
  // Show loading state
  const button = document.querySelector('#step3 button');
  const originalText = button.textContent;
  button.textContent = 'Resetting...';
  button.disabled = true;
  
  // Call API to reset password
  api.resetPassword(recoveryEmail, newPassword)
    .then(response => {
      console.log('✓ Password reset successfully');
      
      // Show success message
      showSuccessMessage();
      
      button.textContent = originalText;
      button.disabled = false;
    })
    .catch(error => {
      console.error('✗ Password reset failed:', error);
      alert('✗ Password reset failed: ' + (error.message || 'Please try again.'));
      
      button.textContent = originalText;
      button.disabled = false;
    });
}

// Move to next step
function moveToStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll('.step').forEach(step => {
    step.classList.remove('active');
  });
  
  // Show the target step
  const targetStep = document.getElementById('step' + stepNumber);
  if (targetStep) {
    targetStep.classList.add('active');
  }
  
  // Update step indicators
  document.querySelectorAll('.step-number').forEach((num, index) => {
    if (index + 1 < stepNumber) {
      num.classList.add('active');
    }
  });
  
  currentStep = stepNumber;
  
  // Scroll to top of form
  document.querySelector('.recovery-panel').scrollTop = 0;
}

// Resend verification code
function resendCode(event) {
  event.preventDefault();
  
  const resendLink = document.querySelector('.resend-link');
  const originalText = resendLink.textContent;
  resendLink.textContent = 'Sending...';
  
  api.sendPasswordResetCode(recoveryEmail)
    .then(response => {
      alert('✓ Verification code resent to ' + recoveryEmail);
      setTimeout(() => {
        resendLink.innerHTML = originalText;
      }, 2000);
    })
    .catch(error => {
      alert('✗ Failed to resend code: ' + error.message);
      resendLink.innerHTML = originalText;
    });
}

// Show success message
function showSuccessMessage() {
  // Hide step 3
  document.getElementById('step3').style.display = 'none';
  
  // Show success message
  document.getElementById('successMessage').style.display = 'flex';
}

// Go back to login
function goToLogin() {
  window.location.href = 'Login Page.html';
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*]/.test(password)
  };
  
  return requirements.length && requirements.uppercase && requirements.number && requirements.special;
}

// Check password requirements in real-time
document.addEventListener('DOMContentLoaded', () => {
  const newPasswordInput = document.getElementById('newPassword');
  
  if (newPasswordInput) {
    newPasswordInput.addEventListener('input', function() {
      const password = this.value;
      
      // Check length
      const lengthReq = document.getElementById('req-length');
      if (password.length >= 8) {
        lengthReq.classList.add('met');
      } else {
        lengthReq.classList.remove('met');
      }
      
      // Check uppercase
      const uppercaseReq = document.getElementById('req-uppercase');
      if (/[A-Z]/.test(password)) {
        uppercaseReq.classList.add('met');
      } else {
        uppercaseReq.classList.remove('met');
      }
      
      // Check number
      const numberReq = document.getElementById('req-number');
      if (/\d/.test(password)) {
        numberReq.classList.add('met');
      } else {
        numberReq.classList.remove('met');
      }
      
      // Check special character
      const specialReq = document.getElementById('req-special');
      if (/[!@#$%^&*]/.test(password)) {
        specialReq.classList.add('met');
      } else {
        specialReq.classList.remove('met');
      }
    });
  }
  
  // Check if already logged in
  if (api.isAuthenticated()) {
    // Allow but show message
    console.log('User is already logged in');
  }
});

// Allow Enter key to submit forms
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    if (currentStep === 1 && e.target.id === 'recoveryEmail') {
      sendResetCode();
    } else if (currentStep === 2 && e.target.id === 'verificationCode') {
      verifyCode();
    } else if (currentStep === 3 && (e.target.id === 'newPassword' || e.target.id === 'confirmNewPassword')) {
      resetPassword();
    }
  }
});
