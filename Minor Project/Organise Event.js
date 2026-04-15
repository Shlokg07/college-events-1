function openModal() {
  document.getElementById("organizeModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("organizeModal").style.display = "none";
}

function handleEventTypeChange() {
  const eventType = document.getElementById('eventType').value;
  const endDateContainer = document.getElementById('endDateContainer');
  const eventEndDate = document.getElementById('eventEndDate');
  
  if (eventType === 'multi-day') {
    endDateContainer.style.display = 'block';
    eventEndDate.required = true;
  } else {
    endDateContainer.style.display = 'none';
    eventEndDate.required = false;
    eventEndDate.value = '';
  }
}

function submitEvent(event) {
  event.preventDefault();
  
  // Check if user is authenticated and is an organizer
  if (!api.isAuthenticated()) {
    alert('❌ Please login to create an event');
    window.location.href = 'Login Page.html';
    return;
  }
  
  const user = api.getCurrentUser();
  if (user.role !== 'organizer' && user.role !== 'admin') {
    alert('❌ Only organizers and admins can create events. Please contact the administrator to upgrade your account.');
    return;
  }
  
  // Get form data
  const eventName = document.getElementById('eventName').value;
  const eventDescription = document.getElementById('eventDescription').value;
  const eventCategory = document.getElementById('eventCategory').value;
  const eventDate = document.getElementById('eventDate').value;
  const eventStartTime = document.getElementById('eventStartTime').value;
  const eventEndTime = document.getElementById('eventEndTime').value;
  const eventType = document.getElementById('eventType').value;
  const eventEndDate = document.getElementById('eventEndDate').value;
  const eventVenue = document.getElementById('eventVenue').value;
  const eventCapacity = document.getElementById('eventCapacity').value;
  const eventImageFile = document.getElementById('eventImage').files[0];
  
  // Validate form
  if (!eventName || !eventDescription || !eventCategory || !eventDate || !eventStartTime || !eventEndTime || !eventVenue || !eventCapacity) {
    alert('❌ Please fill in all required fields');
    return;
  }
  
  // Validate times
  if (eventStartTime >= eventEndTime) {
    alert('❌ End time must be after start time');
    return;
  }
  
  // Validate multi-day event end date
  if (eventType === 'multi-day' && !eventEndDate) {
    alert('❌ Please provide end date for multi-day event');
    return;
  }
  
  // Validate capacity
  if (isNaN(eventCapacity) || eventCapacity < 1) {
    alert('❌ Capacity must be a positive number');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Creating Event...';
  submitBtn.disabled = true;
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('title', eventName);
  formData.append('description', eventDescription);
  formData.append('category', eventCategory);
  formData.append('date', eventDate);
  formData.append('startTime', eventStartTime);
  formData.append('endTime', eventEndTime);
  formData.append('eventType', eventType);
  if (eventEndDate) {
    formData.append('endDate', eventEndDate);
  }
  formData.append('location', eventVenue);
  formData.append('capacity', eventCapacity);
  if (eventImageFile) {
    formData.append('image', eventImageFile);
  }
  
  // Submit to API
  fetch('http://localhost:3000/api/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      alert('❌ Error: ' + data.error);
    } else {
      alert('✅ Event created successfully!');
      closeModal();
      // Reset form
      document.getElementById('organizeEventForm').reset();
      // Reload events if on event page
      if (typeof loadEvents === 'function') {
        loadEvents();
      }
    }
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  })
  .catch(error => {
    alert('❌ Error creating event: ' + error.message);
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}