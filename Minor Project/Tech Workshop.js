// Tech Workshop Page - Backend Integration
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

async function registerWorkshop() {
  if (!api.isAuthenticated()) {
    alert('Please login first to register for the workshop');
    window.location.href = 'Login Page.html';
    return;
  }

  try {
    // Find the Tech Workshop event from backend
    const event = await findEventByTitle('Tech Workshop');
    
    if (!event) {
      alert('Workshop event not found in system. Please contact administrator.');
      return;
    }

    // Register for the event
    await api.registerEvent(event._id);
    alert('✓ You have been successfully registered for Tech Workshop 2026!');
  } catch (error) {
    // Check if error is "already registered"
    if (error.message.includes('Already registered')) {
      alert('You are already registered for this workshop!');
    } else {
      alert('✗ Registration failed: ' + error.message);
    }
  }
}
