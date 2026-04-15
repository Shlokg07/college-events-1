// Updated Login Page JavaScript with Backend Integration
function login() {
  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }

  api.login(email, password)
    .then(response => {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      alert('✓ Login successful!');
      window.location.href = 'Home Page.html';
    })
    .catch(error => {
      alert('✗ Login failed: ' + error.message);
    });
}

function redirectToSignup() {
  window.location.href = 'Sign Up.html';
}

// Check if already logged in
window.addEventListener('load', () => {
  if (api.isAuthenticated()) {
    window.location.href = 'Home Page.html';
  }
});
