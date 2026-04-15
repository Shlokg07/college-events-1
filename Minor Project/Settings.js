// Settings Page JavaScript

// Load user data on page load
window.addEventListener('load', () => {
  // Initialize theme preference
  api.initializeTheme();
  
  if (!api.isAuthenticated()) {
    alert('Please login first');
    window.location.href = 'Login Page.html';
    return;
  }

  updateNavigation();
  loadUserData();
  loadGlobalDarkMode();
  
  // Update checkbox to reflect current state
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.checked = document.body.classList.contains('dark-mode');
  }
});

// Update navigation with user info
function updateNavigation() {
  const loginBtn = document.querySelector('.login-btn');
  if (api.isAuthenticated()) {
    const user = api.getCurrentUser();
    if (loginBtn) {
      loginBtn.textContent = `👤 ${user.fullName}`;
      loginBtn.onclick = null;
      loginBtn.style.cursor = 'pointer';
      loginBtn.onclick = () => {
        if (confirm('Logout?')) {
          api.logout();
          window.location.href = 'Home Page.html';
        }
      };
    }
  }
}

// Load user data
function loadUserData() {
  console.log('📥 Loading user data...');
  
  const user = api.getCurrentUser();
  
  if (!user) {
    console.error('❌ No user data found');
    return;
  }

  // Load personal information
  document.getElementById('displayFullName').textContent = user.fullName || 'N/A';
  document.getElementById('displayEmail').textContent = user.email || 'N/A';
  document.getElementById('displayPhone').textContent = user.phone || 'Not provided';

  // Populate edit form
  document.getElementById('editFullName').value = user.fullName || '';
  document.getElementById('editEmail').value = user.email || '';
  document.getElementById('editPhone').value = user.phone || '';

  // Load additional details
  const additionalDetails = user.additionalDetails || {};
  document.getElementById('displayBio').textContent = additionalDetails.bio || 'No bio added yet';
  document.getElementById('displayDepartment').textContent = additionalDetails.department || 'No department added yet';
  document.getElementById('displayYear').textContent = additionalDetails.year || 'No year specified';

  // Populate additional details form
  document.getElementById('editBio').value = additionalDetails.bio || '';
  document.getElementById('editDepartment').value = additionalDetails.department || '';
  document.getElementById('editYear').value = additionalDetails.year || '';

  console.log('✓ User data loaded:', user);
}

// Dark Mode Functions
function toggleDarkMode() {
  toggleGlobalDarkMode();
}

// Modal Functions
function openEditModal() {
  document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

function openAddDetailsModal() {
  document.getElementById('addDetailsModal').classList.add('active');
}

function closeAddDetailsModal() {
  document.getElementById('addDetailsModal').classList.remove('active');
}

// Save personal information
async function savePersonalInfo() {
  const phone = document.getElementById('editPhone').value.trim();

  try {
    console.log('💾 Saving personal information to backend...');
    
    // Get current user info - only phone can be edited
    const user = api.getCurrentUser();
    const additionalDetails = user.additionalDetails || {};
    
    // Call API to update profile (only phone, fullName and email are locked)
    const response = await api.updateUserProfile({
      fullName: user.fullName,  // Keep current (locked)
      email: user.email,         // Keep current (locked)
      phone,
      additionalDetails
    });
    
    console.log('✓ Phone number saved:', response.user);
    alert('✓ Phone number updated successfully!\n\n📌 Note: Your Full Name and Email are locked and cannot be changed.');
    
    closeEditModal();
    loadUserData();
  } catch (error) {
    console.error('❌ Error saving personal information:', error);
    alert('❌ Failed to save personal information: ' + error.message);
  }
}

// Save additional details
async function saveAdditionalDetails() {
  const bio = document.getElementById('editBio').value.trim();
  const department = document.getElementById('editDepartment').value.trim();
  const year = document.getElementById('editYear').value.trim();

  try {
    console.log('💾 Saving additional details to backend...');
    
    // Get current user info
    const user = api.getCurrentUser();
    
    // Call API to update profile
    const response = await api.updateUserProfile({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      additionalDetails: {
        bio,
        department,
        year
      }
    });
    
    console.log('✓ Additional details saved:', response.user.additionalDetails);
    alert('✓ Additional details updated successfully!');
    
    closeAddDetailsModal();
    loadUserData();
  } catch (error) {
    console.error('❌ Error saving additional details:', error);
    alert('❌ Failed to save additional details: ' + error.message);
  }
}

// Logout handler
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    api.logout();
    window.location.href = 'Home Page.html';
  }
}

// Close modals when clicking outside
window.addEventListener('click', (event) => {
  const editModal = document.getElementById('editModal');
  const addDetailsModal = document.getElementById('addDetailsModal');
  
  if (event.target === editModal) {
    closeEditModal();
  }
  
  if (event.target === addDetailsModal) {
    closeAddDetailsModal();
  }
});
