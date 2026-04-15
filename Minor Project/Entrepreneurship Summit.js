// Entrepreneurship Summit Page - Backend Integration
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

async function registerSummit() {
  if (!api.isAuthenticated()) {
    alert('Please login first to register for Entrepreneurship Summit');
    window.location.href = 'Login Page.html';
    return;
  }

  try {
    // Find the Entrepreneurship event from backend
    const event = await findEventByTitle('Entrepreneurship');
    
    if (!event) {
      alert('Entrepreneurship Summit event not found in system. Please contact administrator.');
      return;
    }

    // Register for the event
    await api.registerEvent(event._id);
    alert('🚀 You have been successfully registered for Entrepreneurship Summit 2026!');
  } catch (error) {
    if (error.message.includes('Already registered')) {
      alert('You are already registered for Entrepreneurship Summit!');
    } else {
      alert('✗ Registration failed: ' + error.message);
    }
  }
}