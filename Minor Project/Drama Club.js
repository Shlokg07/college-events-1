// Drama Club Page - Backend Integration
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

async function registerDrama() {
  if (!api.isAuthenticated()) {
    alert('Please login first to register for Drama Club Showcase');
    window.location.href = 'Login Page.html';
    return;
  }

  try {
    // Find the Drama Club event from backend
    const event = await findEventByTitle('Drama');
    
    if (!event) {
      alert('Drama Club event not found in system. Please contact administrator.');
      return;
    }

    // Register for the event
    await api.registerEvent(event._id);
    alert('🎟️ You have successfully reserved your seat for the Drama Club Showcase!');
  } catch (error) {
    if (error.message.includes('Already registered')) {
      alert('You are already registered for Drama Club Showcase!');
    } else {
      alert('✗ Registration failed: ' + error.message);
    }
  }
}