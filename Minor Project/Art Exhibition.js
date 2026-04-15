// Art Exhibition Page - Backend Integration
// Helper to search for events by title
async function findEventByTitle(title) {
  try {
    const events = await api.getEvents();
    return events.find(e => e.title.toLowerCase().includes(title.toLowerCase()));
  } catch (error) {
    console.error('Error finding event:', error);
    return null;
  }
}

async function registerArt() {
  if (!api.isAuthenticated()) {
    alert('Please login first to register for Art Exhibition');
    window.location.href = 'Login Page.html';
    return;
  }

  try {
    // Find the Art Exhibition event from backend
    const event = await findEventByTitle('Art');
    
    if (!event) {
      alert('Art Exhibition event not found in system. Please contact administrator.');
      return;
    }

    // Register for the event
    await api.registerEvent(event._id);
    alert('🖼️ You have been successfully registered for Art Exhibition 2026!');
  } catch (error) {
    if (error.message.includes('Already registered')) {
      alert('You are already registered for Art Exhibition!');
    } else {
      alert('✗ Registration failed: ' + error.message);
    }
  }
}