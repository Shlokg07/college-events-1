// Updated Event Page JavaScript with Backend Integration

let allEvents = [];

// Update navigation based on auth status
function updateNavigation() {
  const loginBtn = document.querySelector('.login-btn');
  const navHome = document.getElementById('nav-home');
  const navEvents = document.getElementById('nav-events');
  const navAbout = document.getElementById('nav-about');
  const navContact = document.getElementById('nav-contact');
  
  if (api.isAuthenticated()) {
    // User is logged in - show all nav links
    if (navHome) navHome.style.display = 'block';
    if (navEvents) navEvents.style.display = 'block';
    if (navAbout) navAbout.style.display = 'block';
    if (navContact) navContact.style.display = 'block';
    
    const user = api.getCurrentUser();
    if (loginBtn) {
      loginBtn.textContent = `👤 ${user.fullName}`;
      loginBtn.onclick = null;
      loginBtn.style.cursor = 'pointer';
      loginBtn.onclick = () => {
        // Navigate to Profile Dashboard
        window.location.href = 'Profile Dashboard.html';
      };
    }
  } else {
    // User is NOT logged in - hide all nav links except login button
    if (navHome) navHome.style.display = 'none';
    if (navEvents) navEvents.style.display = 'none';
    if (navAbout) navAbout.style.display = 'none';
    if (navContact) navContact.style.display = 'none';
    
    if (loginBtn) {
      loginBtn.textContent = 'Login';
      loginBtn.onclick = handleLoginClick;
    }
  }
}

function handleLoginClick() {
  if (api.isAuthenticated()) {
    if (confirm('Logout?')) {
      api.logout();
      window.location.href = 'Home Page.html';
    }
  } else {
    window.location.href = 'Login Page.html';
  }
}

async function loadEvents() {
  try {
    const response = await api.getEvents();
    allEvents = response;
    displayEvents(allEvents);
  } catch (error) {
    console.error('Error loading events:', error);
    alert('Could not load events. Make sure backend is running.');
  }
}

function displayEvents(events) {
  const eventsContainer = document.getElementById('eventsContainer') || 
                          document.querySelector('.events-grid') ||
                          document.querySelector('main');
  
  if (!eventsContainer) return;

  eventsContainer.innerHTML = '';

  if (events.length === 0) {
    eventsContainer.innerHTML = '<p>No events found. Check back soon!</p>';
    return;
  }

  events.forEach(event => {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    
    // Create image HTML if image exists
    const imageHTML = event.image ? 
      `<div class="event-image" style="width: 100%; height: 350px; background: url('${event.image}') center/cover no-repeat; border-radius: 10px 10px 0 0;"></div>` 
      : `<div class="event-image" style="width: 100%; height: 350px; background: linear-gradient(135deg, #3556eb 0%, #2575fc 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 5em; border-radius: 10px 10px 0 0;">🎯</div>`;
    
    // Format date display based on event type
    let dateDisplay = `📅 ${new Date(event.date).toLocaleDateString()}`;
    if (event.eventType === 'multi-day' && event.endDate) {
      const endDate = new Date(event.endDate).toLocaleDateString();
      dateDisplay = `📅 ${new Date(event.date).toLocaleDateString()} - ${endDate}`;
    }
    
    eventCard.innerHTML = `
      ${imageHTML}
      <div class="event-content">
        <h3>${event.title}</h3>
        <div class="event-details">
          <span>${dateDisplay}</span>
          <span>⏰ ${event.startTime}</span>
          <span>📍 ${event.location}</span>
        </div>
        <div class="event-stats">
          <span>Registered: ${event.registeredCount}/${event.capacity}</span>
        </div>
        <button onclick="viewEventDetails('${event._id}')">View Details</button>
        ${api.isAuthenticated() ? 
          `<button onclick="registerForEvent('${event._id}')" class="register-btn">Register</button>` 
          : ''}
      </div>
    `;
    eventsContainer.appendChild(eventCard);
  });
}

function filterEvents(category) {
  if (category === 'all') {
    displayEvents(allEvents);
  } else {
    const filtered = allEvents.filter(event => event.category === category);
    displayEvents(filtered);
  }
}

function viewEventDetails(eventId) {
  window.location.href = `Event Details.html?id=${eventId}`;
}

async function registerForEvent(eventId) {
  if (!api.isAuthenticated()) {
    alert('Please login to register');
    window.location.href = 'Login Page.html';
    return;
  }

  try {
    await api.registerEvent(eventId);
    alert('✓ Successfully registered for event!');
    loadEvents();
  } catch (error) {
    alert('✗ Registration failed: ' + error.message);
  }
}

// Load events on page load
window.addEventListener('load', () => {
  // Initialize theme preference
  api.initializeTheme();
  
  updateNavigation();
  loadEvents();
});
