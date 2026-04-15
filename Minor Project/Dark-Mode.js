// Global Dark Mode Manager
// This script should be included on all pages to enable global dark mode support
// Consolidated with API theme system

// Check if page should stay in light mode
function isLightModeOnlyPage() {
  // Get the current page URL/path
  const currentPath = window.location.pathname.toLowerCase() + window.location.href.toLowerCase();
  
  // List of pages that should stay in light mode
  const lightModePages = [
    'login page',
    'sign up',
    'forgot password'
  ];
  
  // Check if current page matches any light-mode-only page
  return lightModePages.some(page => currentPath.includes(page));
}

// Load dark mode preference on page load
function loadGlobalDarkMode() {
  // Don't apply dark mode to Login, Sign Up, and Forgot Password pages
  if (isLightModeOnlyPage()) {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    console.log('☀️ Light mode forced on this page');
    return;
  }
  
  // Check for saved theme preference (use 'theme' key from API system)
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    console.log('🌙 Dark mode enabled globally');
  } else {
    document.body.classList.remove('dark-mode');
    console.log('☀️ Light mode enabled globally');
  }
}

// Toggle dark mode globally
function toggleGlobalDarkMode() {
  // Prevent dark mode toggle on Login, Sign Up, and Forgot Password pages
  if (isLightModeOnlyPage()) {
    alert('❌ Dark mode is not available on this page for security reasons.');
    console.warn('🚫 Dark mode toggle blocked on light-mode-only page');
    
    // Ensure dark-mode class is removed and never added
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    return false;
  }
  
  const isDarkMode = document.body.classList.toggle('dark-mode');
  // Use consistent 'theme' key for localStorage
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  console.log(`🌙 Global dark mode ${isDarkMode ? 'enabled' : 'disabled'}`);
  
  // Update checkbox if it exists on the page
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.checked = isDarkMode;
  }
  
  return true;
}

// Apply on page load
document.addEventListener('DOMContentLoaded', () => {
  loadGlobalDarkMode();
});

// Also apply immediately for faster effect
loadGlobalDarkMode();
