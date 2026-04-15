// Music Festival Page - Backend Integration
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

async function registerMusicNight() {
  if (!api.isAuthenticated()) {
    alert('Please login first to register for Music Night');
    window.location.href = 'Login Page.html';
    return;
  }

  try {
    // Find the Music Night event from backend
    const event = await findEventByTitle('Music');
    
    if (!event) {
      alert('Music Night event not found in system. Please contact administrator.');
      return;
    }

    // Register for the event
    await api.registerEvent(event._id);
    alert('🎟️ You have been successfully registered for Music Night 2026!');
  } catch (error) {
    if (error.message.includes('Already registered')) {
      alert('You are already registered for Music Night!');
    } else {
      alert('✗ Registration failed: ' + error.message);
    }
  }
}