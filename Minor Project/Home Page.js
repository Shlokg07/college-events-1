// Updated Home Page JavaScript with Backend Integration

// Handle My Registrations navigation
function openMyRegistrations() {
  if (!api.isAuthenticated()) {
    alert('Please login first to view your registrations');
    window.location.href = 'Login Page.html';
    return;
  }
  // Navigate to My Registrations page
  window.location.href = 'My Registrations.html';
}

// Convert image file to base64 with compression
function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }

    // Check file size (max 10MB initially)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Image size must be less than 10MB'));
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please upload a valid image file'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // Create canvas to compress image
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          
          // Resize to max width of 800px to reduce file size
          let width = img.width;
          let height = img.height;
          const maxWidth = 800;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression (0.7 = 70% quality)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          console.log('✅ Image compressed:', {
            original: (file.size / 1024).toFixed(2) + 'KB',
            compressed: (compressedBase64.length / 1024).toFixed(2) + 'KB'
          });
          resolve(compressedBase64);
        } catch (error) {
          reject(new Error('Failed to compress image: ' + error.message));
        }
      };
      img.onerror = () => {
        reject(new Error('Failed to process image'));
      };
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

function subscribe() {
  const email = document.getElementById("email")?.value;
  if (email) {
    alert(`✓ Thank you for subscribing, ${email}!`);
    document.getElementById("email").value = "";
  } else {
    alert("Please enter a valid email address.");
  }
}

function openModal() {
  if (!api.isAuthenticated()) {
    alert('Please login first to organize an event');
    window.location.href = 'Login Page.html';
    return;
  }
  
  const user = api.getCurrentUser();
  if (user.role !== 'organizer' && user.role !== 'admin') {
    alert('Only organizers and admins can create events. Please contact the administrator to upgrade your account.');
    return;
  }
  
  document.getElementById("organizeModal").style.display = "flex";
  document.getElementById("mainContent").classList.add("blur");
}

function closeModal() {
  document.getElementById("organizeModal").style.display = "none";
  document.getElementById("mainContent").classList.remove("blur");
}

function handleEventTypeChange() {
  const eventType = document.getElementById('eventType').value;
  const endDateInput = document.getElementById('eventEndDate');
  const endDateLabel = document.querySelector('label[for="eventEndDate"]');
  
  // Add null check for endDateInput
  if (!endDateInput) {
    console.warn('⚠️ End date input element not found');
    return;
  }
  
  if (eventType === 'multi-day') {
    // Show end date for multi-day events
    endDateInput.style.display = 'block';
    if (endDateLabel) endDateLabel.style.display = 'block';
    endDateInput.required = true;
  } else {
    // Hide end date for single-day events
    endDateInput.style.display = 'none';
    if (endDateLabel) endDateLabel.style.display = 'none';
    endDateInput.required = false;
    endDateInput.value = ''; // Clear the value
  }
}

function createEvent() {
  console.log('='.repeat(60));
  console.log('✓ CREATE EVENT FUNCTION CALLED');
  console.log('='.repeat(60));
  
  // Check authentication
  if (!api.isAuthenticated()) {
    alert('❌ Please login first to create an event');
    console.warn('User not authenticated');
    window.location.href = 'Login Page.html';
    return;
  }

  const user = api.getCurrentUser();
  console.log('👤 Current user:', user);

  // Get all form values
  const titleEl = document.getElementById('eventTitle');
  const descEl = document.getElementById('eventDescription');
  const catEl = document.getElementById('eventCategory');
  const dateEl = document.getElementById('eventDate');
  const startEl = document.getElementById('eventStartTime');
  const endEl = document.getElementById('eventEndTime');
  const typeEl = document.getElementById('eventType');
  const endDateEl = document.getElementById('eventEndDate');
  const locEl = document.getElementById('eventLocation');
  const capEl = document.getElementById('eventCapacity');
  const imageEl = document.getElementById('eventImage');

  if (!titleEl) {
    console.error('❌ Form elements not found!');
    alert('Error: Form elements not found');
    return;
  }

  const eventData = {
    title: titleEl.value?.trim(),
    description: descEl?.value?.trim(),
    category: catEl?.value?.trim(),
    date: dateEl?.value,
    startTime: startEl?.value,
    endTime: endEl?.value,
    eventType: typeEl?.value || 'single-day',
    endDate: endDateEl?.value || null,
    location: locEl?.value?.trim(),
    capacity: parseInt(capEl?.value) || 0,
    image: '' // Will be set after image conversion
  };

  console.log('📋 Form data collected:', eventData);

  // Validate required fields
  if (!eventData.title) {
    alert('❌ Please enter an Event Title');
    titleEl.focus();
    console.warn('Validation failed: No title');
    return;
  }
  if (!eventData.description) {
    alert('❌ Please enter a Description');
    descEl.focus();
    console.warn('Validation failed: No description');
    return;
  }
  if (!eventData.category || eventData.category === '') {
    alert('❌ Please select a Category');
    catEl.focus();
    console.warn('Validation failed: No category');
    return;
  }
  if (!eventData.date) {
    alert('❌ Please select an Event Date');
    dateEl.focus();
    console.warn('Validation failed: No date');
    return;
  }
  if (!eventData.startTime) {
    alert('❌ Please select a Start Time');
    startEl.focus();
    console.warn('Validation failed: No startTime');
    return;
  }
  if (!eventData.endTime) {
    alert('❌ Please select an End Time');
    endEl.focus();
    console.warn('Validation failed: No endTime');
    return;
  }
  if (eventData.eventType === 'multi-day' && !eventData.endDate) {
    alert('❌ Please select an End Date for multi-day events');
    endDateEl.focus();
    console.warn('Validation failed: No endDate for multi-day event');
    return;
  }
  if (!eventData.location) {
    alert('❌ Please enter a Venue/Location');
    locEl.focus();
    console.warn('Validation failed: No location');
    return;
  }
  if (!eventData.capacity || eventData.capacity < 1) {
    alert('❌ Please enter a valid Capacity (must be at least 1)');
    capEl.focus();
    console.warn('Validation failed: No capacity');
    return;
  }

  console.log('✅ All text validations passed. Processing image...');

  // Handle image - NOW REQUIRED
  const imageFile = imageEl?.files?.[0];
  if (!imageFile) {
    alert('❌ Please upload an Event Image');
    imageEl.focus();
    console.warn('Validation failed: No image file selected');
    return;
  }

  if (imageFile) {
    console.log('📸 Image file selected:', imageFile.name, `(${(imageFile.size / 1024).toFixed(2)}KB)`);
    
    convertImageToBase64(imageFile)
      .then(base64Image => {
        eventData.image = base64Image;
        console.log('✅ Image converted to base64');
        submitEventToBackend(eventData);
      })
      .catch(error => {
        console.error('❌ Image conversion failed:', error);
        alert('❌ Image upload failed: ' + error.message);
      });
  }
}

function submitEventToBackend(eventData) {
  console.log('✅ All validations passed. Sending to backend...');

  api.createEvent(eventData)
    .then(response => {
      console.log('✅ Event created successfully:', response);
      alert('✓ Event created successfully! Redirecting to Event Page...');
      closeModal();
      
      // Clear form
      document.getElementById('eventTitle').value = '';
      document.getElementById('eventDescription').value = '';
      document.getElementById('eventCategory').value = '';
      document.getElementById('eventDate').value = '';
      document.getElementById('eventStartTime').value = '';
      document.getElementById('eventEndTime').value = '';
      document.getElementById('eventType').value = 'single-day';
      document.getElementById('eventEndDate').value = '';
      document.getElementById('eventLocation').value = '';
      document.getElementById('eventCapacity').value = '';
      document.getElementById('eventImage').value = '';
      
      // Reset end date visibility for single-day default
      handleEventTypeChange();
      
      console.log('🚀 Redirecting to Events page...');
      setTimeout(() => {
        window.location.href = 'Event Search.html';
      }, 1000);
    })
    .catch(error => {
      console.error('❌ Event creation failed:', error);
      alert('❌ Event creation failed!\n\n' + error.message + '\n\nMake sure:\n1. You are logged in\n2. All required fields are filled correctly');
    });
}

// Display top 3 upcoming events in featured section
function displayFeaturedEvents(events) {
  console.log('📌 Displaying featured events. Total events:', events.length);
  
  // Sort events by date (ascending - upcoming first)
  const sortedEvents = events.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  // Get top 3 upcoming events
  const topEvents = sortedEvents.slice(0, 3);
  console.log('✓ Top 3 upcoming events:', topEvents);

  const grid = document.getElementById('featuredEventsGrid');
  
  if (topEvents.length === 0) {
    grid.innerHTML = '<p style="text-align: center; width: 100%; color: #999;">No upcoming events at the moment.</p>';
    return;
  }

  grid.innerHTML = ''; // Clear loading message

  topEvents.forEach(event => {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const card = document.createElement('div');
    card.className = 'event-card';
    
    // Create card content
    const imageHtml = event.image 
      ? `<img src="${event.image}" alt="${event.title}" width="550" height="300" class="event-icon" style="object-fit: cover;">`
      : `<div style="width: 100%; height: 300px; background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); display: flex; align-items: center; justify-content: center; font-size: 4em;">📅</div>`;

    card.innerHTML = `
      ${imageHtml}
      <h3>${event.title}</h3>
      <p>📅 ${formattedDate}</p>
      <p>📍 ${event.location}</p>
      <button class="learn-more-btn" onclick="window.location.href='Event Details.html?id=${event._id}'">Learn More</button>
    `;

    grid.appendChild(card);
  });
}

// Logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    api.logout();
    alert('Logged out successfully!');
    location.reload();
  }
}

// Update navigation based on auth status
function updateNavigation() {
  const loginBtn = document.getElementById('loginBtn');
  const userNameBtn = document.getElementById('userNameBtn');
  const adminLink = document.getElementById('adminLink');
  const adminCardContainer = document.getElementById('adminCardContainer');
  const organizeCardElement = document.getElementById('organizeEventCard');
  
  if (api.isAuthenticated()) {
    const user = api.getCurrentUser();
    
    // Show username button, hide login
    if (loginBtn) loginBtn.style.display = 'none';
    if (userNameBtn) {
      userNameBtn.style.display = 'block';
      userNameBtn.querySelector('a').textContent = user.fullName || 'Profile';
    }
    
    // Show organize card for organizers and admins
    if (organizeCardElement) {
      if (user.role === 'organizer' || user.role === 'admin') {
        organizeCardElement.style.display = 'block';
      } else {
        organizeCardElement.style.display = 'none';
      }
    }
    
    // Show admin features if user is admin
    if (user.role === 'admin') {
      if (adminLink) adminLink.style.display = 'block';
      if (adminCardContainer) adminCardContainer.style.display = 'block';
    }
  } else {
    // Show login, hide username
    if (loginBtn) loginBtn.style.display = 'block';
    if (userNameBtn) userNameBtn.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
    if (adminCardContainer) adminCardContainer.style.display = 'none';
    
    // Hide organize card for non-authenticated users
    if (organizeCardElement) {
      organizeCardElement.style.display = 'none';
    }
  }
}

// Load initial data
window.addEventListener('load', () => {
  // Initialize saved theme preference
  api.initializeTheme();
  
  updateNavigation();
  
  // Load events preview
  api.getEvents()
    .then(events => {
      console.log('✓ Events loaded:', events);
      displayFeaturedEvents(events);
    })
    .catch(error => {
      console.log('Note: Backend not running. Using mock data.');
      const grid = document.getElementById('featuredEventsGrid');
      if (grid) {
        grid.innerHTML = '<p style="text-align: center; width: 100%; color: #999;">Backend not available. Please make sure the server is running.</p>';
      }
    });
});
