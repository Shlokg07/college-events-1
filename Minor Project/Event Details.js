// Event Details Page JavaScript

async function loadEventDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  console.log('Loading event details...');
  console.log('Event ID:', eventId);

  if (!eventId) {
    console.error('No event ID provided in URL');
    showError('No event ID provided');
    return;
  }

  try {
    console.log('Fetching event from API...');
    const event = await api.getEvent(eventId);
    console.log('Event data received:', event);
    displayEventDetails(event);
  } catch (error) {
    console.error('Error loading event:', error);
    showError('Could not load event details. Event may not exist.');
  }
}

function displayEventDetails(event) {
  console.log('Displaying event details...');
  
  // Set header
  document.getElementById('eventTitle').textContent = event.title;
  const categoryEmoji = getCategoryEmoji(event.category);
  document.getElementById('eventCategory').textContent = `${categoryEmoji} ${event.category || 'Other'}`;
  
  // Apply theme based on event category
  applyEventTheme(event.category);
  
  // Set image
  const imagePanel = document.getElementById('imagePanel');
  if (event.image) {
    imagePanel.style.background = `url('${event.image}') center/cover no-repeat`;
    imagePanel.textContent = '';
  } else {
    imagePanel.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)';
    imagePanel.textContent = getCategoryEmoji(event.category);
  }

  // Set description
  document.getElementById('eventDescription').textContent = event.description;

  // Set date and time
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format date display based on event type
  let dateTimeDisplay = `<strong>${formattedDate}</strong><br>${event.startTime} - ${event.endTime}`;
  if (event.eventType === 'multi-day' && event.endDate) {
    const endDate = new Date(event.endDate);
    const formattedEndDate = endDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    dateTimeDisplay = `<strong>From:</strong> ${formattedDate}, ${event.startTime}<br><strong>To:</strong> ${formattedEndDate}, ${event.endTime}<br><strong>Event Type:</strong> Multi-Day Event`;
  }
  
  document.getElementById('eventDateTime').innerHTML = dateTimeDisplay;

  // Set location
  document.getElementById('eventLocation').textContent = event.location;

  // Set capacity and registration status
  document.getElementById('eventCapacity').innerHTML = 
    `<strong>${event.registeredCount || 0} / ${event.capacity}</strong><br><span style="font-size: 14px; color: ${(event.registeredCount || 0) >= event.capacity ? '#ff6b6b' : '#4ade80'};">${(event.registeredCount || 0) >= event.capacity ? 'Event FULL' : 'Spots Available'}</span>`;

  // Set organizer info
  const organizerInfo = event.organizer || {};
  const nameSpan = document.getElementById('organizerName');
  const emailSpan = document.getElementById('organizerEmail');
  
  if (nameSpan) {
    nameSpan.textContent = organizerInfo.fullName || 'N/A';
    nameSpan.innerHTML = organizerInfo.fullName || 'N/A'; 
    nameSpan.title = '';
    nameSpan.removeAttribute('aria-label');
    nameSpan.removeAttribute('aria-disabled');
    nameSpan.removeAttribute('readonly');
    nameSpan.removeAttribute('data-locked');
    nameSpan.className = nameSpan.className.replace(/locked|readonly/gi, '');
  }
  
  if (emailSpan) {
    emailSpan.textContent = organizerInfo.email || 'N/A';
    emailSpan.innerHTML = organizerInfo.email || 'N/A';
    emailSpan.title = '';
    emailSpan.removeAttribute('aria-label');
    emailSpan.removeAttribute('aria-disabled');
    emailSpan.removeAttribute('readonly');
    emailSpan.removeAttribute('data-locked');
    emailSpan.className = emailSpan.className.replace(/locked|readonly/gi, '');
  }
  
  // Hide any lock indicators in organizer section
  const lockIndicators = document.querySelectorAll('.organizer-section [class*="lock"], .organizer-section [data-locked]');
  lockIndicators.forEach(el => el.style.display = 'none');

  // Check if current user is the organizer and show delete button
  const currentUser = api.getCurrentUser();
  const currentUserId = currentUser?.id;
  
  // Get organizer ID safely
  let organizerId = null;
  try {
    organizerId = event.organizer?._id || event.organizer?.id;
  } catch (e) {
    console.warn('Could not get organizer ID:', e);
  }
  
  const isOrganizer = api.isAuthenticated() && currentUserId && organizerId && String(currentUserId) === String(organizerId);

  const organizeActionButtonsDiv = document.getElementById('organizeActionButtons');
  if (organizeActionButtonsDiv) {
    organizeActionButtonsDiv.innerHTML = '';
    
    if (isOrganizer) {
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️ Delete Event';
      deleteBtn.style.background = '#ff6b6b';
      deleteBtn.style.color = 'white';
      deleteBtn.style.padding = '10px 15px';
      deleteBtn.style.border = 'none';
      deleteBtn.style.borderRadius = '5px';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.style.fontSize = '14px';
      deleteBtn.style.fontWeight = 'bold';
      deleteBtn.onclick = () => deleteEvent(event._id, event.title);
      organizeActionButtonsDiv.appendChild(deleteBtn);
    }
  }

  // Set registration status and buttons
  const isRegistered = api.isAuthenticated() && currentUserId ? 
    event.registeredParticipants?.some(p => String(p._id) === String(currentUserId)) : false;

  const actionButtonsDiv = document.getElementById('actionButtons');
  actionButtonsDiv.innerHTML = '';

  if (api.isAuthenticated()) {
    if (isRegistered) {
      const btn = document.createElement('button');
      btn.textContent = 'Cancel Registration';
      // Use theme color for cancel button
      const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--gradient-start').trim();
      btn.style.background = themeColor;
      btn.onclick = () => cancelRegistration(event._id);
      actionButtonsDiv.appendChild(btn);
    } else {
      if ((event.registeredCount || 0) >= event.capacity) {
        const btn = document.createElement('button');
        btn.textContent = 'Event is FULL';
        btn.disabled = true;
        actionButtonsDiv.appendChild(btn);
      } else {
        const btn = document.createElement('button');
        btn.textContent = 'Register for Event';
        btn.style.background = '#4ade80';
        btn.onclick = () => registerForEvent(event._id);
        actionButtonsDiv.appendChild(btn);
      }
    }
  } else {
    const btn = document.createElement('button');
    btn.textContent = 'Login to Register';
    btn.onclick = () => window.location.href = 'Login Page.html';
    actionButtonsDiv.appendChild(btn);
  }

  document.getElementById('registrationStatus').innerHTML = 
    `<strong>${isRegistered ? '✓ You are registered' : 'Not registered'}</strong><br><span style="font-size: 14px;">Click button below to ${isRegistered ? 'cancel' : 'register'}</span>`;

  console.log('Event details displayed successfully!');
}

function getCategoryEmoji(category) {
  const emojis = {
    'Tech': '💻',
    'Sports': '🏆',
    'Music': '🎶',
    'Art': '🎨',
    'Cultural': '🎭',
    'Business': '💼',
    'Other': '🎯'
  };
  return emojis[category] || '🎯';
}

function applyEventTheme(category) {
  // Remove all existing theme classes
  document.body.classList.remove(
    'theme-tech-workshop',
    'theme-sports',
    'theme-music',
    'theme-art',
    'theme-cultural',
    'theme-business',
    'theme-other'
  );

  // Convert category to theme class name
  const categoryMap = {
    'Tech': 'theme-tech-workshop',
    'Sports': 'theme-sports',
    'Music': 'theme-music',
    'Art': 'theme-art',
    'Cultural': 'theme-cultural',
    'Business': 'theme-business',
    'Other': 'theme-other'
  };

  const themeClass = categoryMap[category] || 'theme-other';
  document.body.classList.add(themeClass);
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
    loadEventDetails();
  } catch (error) {
    alert('✗ Registration failed: ' + error.message);
  }
}

async function cancelRegistration(eventId) {
  if (confirm('Are you sure you want to cancel your registration?')) {
    try {
      await api.cancelRegistration(eventId);
      alert('✓ Registration cancelled');
      loadEventDetails();
    } catch (error) {
      alert('✗ Cancellation failed: ' + error.message);
    }
  }
}

function showError(message) {
  const header = document.querySelector('header');
  header.innerHTML = `<a href="Event Search.html" class="back-arrow">← Back</a><h1>Error</h1><p>${message}</p>`;
}

async function deleteEvent(eventId, eventTitle) {
  const confirmDelete = confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`);
  
  if (!confirmDelete) {
    return;
  }

  try {
    console.log('🗑️ Deleting event:', eventId);
    await api.deleteEvent(eventId);
    alert('✓ Event deleted successfully!');
    
    // Redirect to Events page after deletion
    console.log('🚀 Redirecting to Events page...');
    window.location.href = 'Event Search.html';
  } catch (error) {
    console.error('❌ Delete failed:', error);
    alert('✗ Failed to delete event: ' + error.message);
  }
}

// Load event details on page load
window.addEventListener('load', () => {
  loadEventDetails();
});
