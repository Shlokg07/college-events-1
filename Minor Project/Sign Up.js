// Sign Up Page JavaScript with Backend Integration
function signup() {
  const fullName = document.getElementById('fullName')?.value || 
                   document.querySelector('input[placeholder*="Full Name"]')?.value;
  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;
  const confirmPassword = document.getElementById('confirmPassword')?.value ||
                          document.querySelector('input[placeholder*="Confirm"]')?.value;
  const phone = document.getElementById('phone')?.value || '';

  if (!fullName || !email || !password || !confirmPassword) {
    alert('Please fill all required fields');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  api.signup(fullName, email, password, confirmPassword, phone)
    .then(response => {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      alert('✓ Account created successfully!');
      window.location.href = 'Home Page.html';
    })
    .catch(error => {
      alert('✗ Signup failed: ' + error.message);
    });
}

function redirectToLogin() {
  window.location.href = 'Login Page.html';
}

// Check if already logged in
window.addEventListener('load', () => {
  if (api.isAuthenticated()) {
    window.location.href = 'Home Page.html';
  }
});
