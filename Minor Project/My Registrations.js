// My Registrations Page JavaScript

async function loadMyRegistrations() {
  console.log('='.repeat(60));
  console.log('📋 LOADING MY REGISTRATIONS');
  console.log('='.repeat(60));

  // Check authentication
  if (!api.isAuthenticated()) {
    console.warn('❌ User not authenticated');
    alert('Please login to view your registrations');
    window.location.href = 'Login Page.html';
    return;
  }

  const currentUser = api.getCurrentUser();
  console.log('👤 Current user:', currentUser);

  try {
    // Fetch all events
    console.log('📥 Fetching all events...');
    const allEvents = await api.getEvents();
    console.log('✓ Total events fetched:', allEvents.length);

    // Filter events where current user is registered
    const registeredEvents = allEvents.filter(event => {
      return event.registeredParticipants && 
             event.registeredParticipants.some(p => String(p._id || p) === String(currentUser.id));
    });

    console.log('✓ Registered events count:', registeredEvents.length);
    console.log('📌 Registered events:', registeredEvents);

    if (registeredEvents.length === 0) {
      displayNoRegistrations();
    } else {
      displayRegisteredEvents(registeredEvents);
    }
  } catch (error) {
    console.error('❌ Error loading registrations:', error);
    const grid = document.getElementById('registrationsGrid');
    grid.innerHTML = '<p style="text-align: center; width: 100%; color: var(--danger-color, #ff6b6b); padding: 40px;">❌ Error loading registrations. Please try again.</p>';
  }
}

function displayNoRegistrations() {
  console.log('📭 Showing no registrations message');
  const grid = document.getElementById('registrationsGrid');
  const noReg = document.getElementById('noRegistrations');
  
  grid.style.display = 'none';
  noReg.style.display = 'block';
}

function displayRegisteredEvents(events) {
  console.log('🎯 Displaying', events.length, 'registered events');
  
  const grid = document.getElementById('registrationsGrid');
  const noReg = document.getElementById('noRegistrations');
  
  noReg.style.display = 'none';
  grid.style.display = 'grid';
  grid.innerHTML = '';

  events.forEach(event => {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';

    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Build image HTML
    let imageHtml = '';
    if (event.image) {
      imageHtml = `<img src="${event.image}" alt="${event.title}" class="event-image" style="object-fit: cover; width: 100%; height: 200px;">`;
    } else {
      imageHtml = `<div style="width: 100%; height: 200px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; justify-content: center; font-size: 3em;">📅</div>`;
    }

    eventCard.innerHTML = `
      ${imageHtml}
      <div class="event-info">
        <div>
          <h3>${event.title}</h3>
          <p><strong>📅 Date:</strong> ${formattedDate}</p>
          <p><strong>⏰ Time:</strong> ${event.startTime} - ${event.endTime}</p>
          <p><strong>📍 Location:</strong> ${event.location}</p>
        </div>
        <div class="button-container">
          <button class="learn-more-btn" onclick="window.location.href='Event Details.html?id=${event._id}'">View Details</button>
          <button class="cancel-registration-btn" onclick="cancelRegistration('${event._id}')">Cancel</button>
        </div>
      </div>
    `;

    grid.appendChild(eventCard);
  });
}

async function cancelRegistration(eventId) {
  console.log('❌ Cancelling registration for event:', eventId);
  
  if (!confirm('Are you sure you want to cancel this registration?')) {
    console.log('Registration cancellation cancelled by user');
    return;
  }

  try {
    const response = await api.cancelRegistration(eventId);
    console.log('✓ Registration cancelled:', response);
    alert('✓ Registration cancelled successfully!');
    
    // Reload registrations
    loadMyRegistrations();
  } catch (error) {
    console.error('❌ Error cancelling registration:', error);
    alert('❌ Failed to cancel registration: ' + error.message);
  }
}

// Update navigation based on auth status
function updateNavigation() {
  if (api.isAuthenticated()) {
    const user = api.getCurrentUser();
    const userNameBtn = document.getElementById('userNameBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.querySelector('.login-btn:not(#userNameBtn):not(#logoutBtn)');
    
    // Hide login button and show logout/username buttons
    if (loginBtn) loginBtn.style.display = 'none';
    if (userNameBtn) {
      userNameBtn.textContent = `👤 ${user.fullName}`;
      userNameBtn.style.display = 'inline-block';
    }
    if (logoutBtn) {
      logoutBtn.style.display = 'inline-block';
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
          api.logout();
          window.location.href = 'Login Page.html';
        }
      });
    }
  }
}

// Logout handler function
function handleLogoutClick() {
  if (confirm('Are you sure you want to logout?')) {
    api.logout();
    window.location.href = 'Login Page.html';
  }
}

// Load on page load
window.addEventListener('load', () => {
  // Initialize theme preference
  api.initializeTheme();
  
  updateNavigation();
  loadMyRegistrations();
});
