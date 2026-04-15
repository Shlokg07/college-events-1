// API utility for all backend calls
const API_URL = 'http://localhost:3000/api';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    try {
      console.log(`📤 API Request: ${options.method || 'GET'} ${url}`, options.body ? JSON.parse(options.body) : '');
      
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      console.log(`📥 API Response (${response.status}):`, data);

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'An error occurred';
        console.error(`❌ API Error: ${response.status} - ${errorMsg}`);
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('❌ Cannot reach backend! Make sure server is running on http://localhost:3000');
        throw new Error('Cannot connect to backend. Is the server running on port 3000?');
      }
      console.error('❌ API Error:', error.message);
      throw error;
    }
  }

  // Auth methods
  async signup(fullName, email, password, confirmPassword, phone = '') {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, confirmPassword, phone })
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token = null;
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Password Reset methods
  async sendPasswordResetCode(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async verifyPasswordResetCode(email, code) {
    return this.request('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
  }

  async resetPassword(email, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword })
    });
  }

  async updateUserProfile(profileData) {
    const response = await this.request('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    
    // Update localStorage with new user data
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  // Events methods
  async getEvents() {
    return this.request('/events');
  }

  async getEvent(id) {
    return this.request(`/events/${id}`);
  }

  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  async updateEvent(id, eventData) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  }

  async deleteEvent(id) {
    return this.request(`/events/${id}`, {
      method: 'DELETE'
    });
  }

  // Registrations methods
  async registerEvent(eventId) {
    return this.request(`/registrations/${eventId}`, {
      method: 'POST',
      body: JSON.stringify({})
    });
  }

  async getMyEvents() {
    return this.request('/registrations/user/my-events');
  }

  async cancelRegistration(eventId) {
    return this.request(`/registrations/${eventId}`, {
      method: 'DELETE'
    });
  }

  // =====================
  // SEARCH & FILTER METHODS
  // =====================

  async searchEvents(filters = {}) {
    const { query, category, location, date, dateFrom, dateTo, status, sortBy, order, page, limit } = filters;
    
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    if (location) params.append('location', location);
    if (date) params.append('date', date);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (status) params.append('status', status);
    if (sortBy) params.append('sortBy', sortBy);
    if (order) params.append('order', order);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    return this.request(`/search/events?${params.toString()}`);
  }

  async getEventsByCategory(category) {
    return this.request(`/search/events/category/${category}`);
  }

  async getUpcomingEvents(days = 30) {
    return this.request(`/search/events/upcoming?days=${days}`);
  }

  async getEventsByLocation(location) {
    return this.request(`/search/events/location/${location}`);
  }

  async getEventsByOrganizer(organizerId) {
    return this.request(`/search/organizer/${organizerId}`);
  }

  async searchUsers(filters = {}) {
    const { query, role, department } = filters;
    
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (role) params.append('role', role);
    if (department) params.append('department', department);

    return this.request(`/search/users?${params.toString()}`);
  }

  // =====================
  // PROFILE METHODS
  // =====================

  async getMyProfile() {
    return this.request('/profile/me');
  }

  async getUserProfile(userId) {
    return this.request(`/profile/${userId}`);
  }

  async updateProfile(profileData) {
    return this.request('/profile/me/update', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async getMyStats() {
    return this.request('/profile/me/stats');
  }

  async getMyRegisteredEvents() {
    return this.request('/profile/me/registered-events');
  }

  async getMyOrganizedEvents() {
    return this.request('/profile/me/organized-events');
  }

  // =====================
  // ADMIN METHODS
  // =====================

  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAllUsers(filters = {}) {
    const { role, search, page = 1, limit = 20 } = filters;
    
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('limit', limit);

    return this.request(`/admin/users?${params.toString()}`);
  }

  async getUserDetails(userId) {
    return this.request(`/admin/users/${userId}`);
  }

  async updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  async deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }

  async getAllEvents(filters = {}) {
    const { status, category, search, page = 1, limit = 20 } = filters;
    
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('limit', limit);

    return this.request(`/admin/events?${params.toString()}`);
  }

  async updateEventStatus(eventId, status) {
    return this.request(`/admin/events/${eventId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async deleteEventAsAdmin(eventId) {
    return this.request(`/admin/events/${eventId}`, {
      method: 'DELETE'
    });
  }

  async getSystemHealth() {
    return this.request('/admin/health');
  }

  // =====================
  // ORGANIZER REQUEST METHODS
  // =====================

  createOrganizerRequest(userId, fullName, email) {
    try {
      // Validate inputs
      if (!userId || !fullName || !email) {
        console.error('❌ Missing required fields for organizer request:', { userId, fullName, email });
        alert('❌ Error: Missing user information. Please refresh and try again.');
        return false;
      }

      const requests = this.getOrganizerRequests();
      
      // Check if user already has a pending request
      const existingRequest = requests.find(req => req.userId === userId);
      if (existingRequest && existingRequest.status === 'pending') {
        alert('⏳ You already have a pending request. Please wait for admin review.');
        return false;
      }

      // Create new request
      const newRequest = {
        id: `req_${Date.now()}`,
        userId: userId,
        userName: fullName,
        userEmail: email,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null,
        reason: 'Requested through profile page'
      };

      requests.push(newRequest);
      localStorage.setItem('organizerRequests', JSON.stringify(requests));
      console.log('✅ Organizer request created:', newRequest);
      return true;
    } catch (error) {
      console.error('❌ Error creating organizer request:', error);
      alert('❌ Error: ' + error.message);
      return false;
    }
  }

  getOrganizerRequests() {
    try {
      const requests = localStorage.getItem('organizerRequests');
      return requests ? JSON.parse(requests) : [];
    } catch (error) {
      console.error('Error getting organizer requests:', error);
      return [];
    }
  }

  approveOrganizerRequest(requestId, adminId) {
    try {
      const requests = this.getOrganizerRequests();
      const request = requests.find(req => req.id === requestId);

      if (!request) {
        alert('Request not found');
        return false;
      }

      // Update request status
      request.status = 'approved';
      request.reviewedAt = new Date().toISOString();
      request.reviewedBy = adminId;

      // Update user role to organizer
      // Note: In a real app, this would happen via API
      // For now, we'll just update the request
      
      localStorage.setItem('organizerRequests', JSON.stringify(requests));
      console.log('✅ Request approved:', request);
      return true;
    } catch (error) {
      console.error('❌ Error approving request:', error);
      return false;
    }
  }

  rejectOrganizerRequest(requestId, adminId) {
    try {
      const requests = this.getOrganizerRequests();
      const request = requests.find(req => req.id === requestId);

      if (!request) {
        alert('Request not found');
        return false;
      }

      // Update request status
      request.status = 'rejected';
      request.reviewedAt = new Date().toISOString();
      request.reviewedBy = adminId;

      localStorage.setItem('organizerRequests', JSON.stringify(requests));
      console.log('✅ Request rejected:', request);
      return true;
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
      return false;
    }
  }

  // Test connection to backend
  async testConnection() {
    try {
      console.log('🧪 Testing backend connection to:', API_URL);
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      console.log('✅ Backend is reachable:', data);
      return true;
    } catch (error) {
      console.error('❌ Cannot reach backend:', error.message);
      return false;
    }
  }

  // Theme Management Methods
  toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('themeToggleBtn');
    
    if (body.classList.contains('dark-mode')) {
      // Switch to light mode
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      if (themeBtn) {
        themeBtn.textContent = '🌙 Dark Mode';
      }
    } else {
      // Switch to dark mode
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      if (themeBtn) {
        themeBtn.textContent = '☀️ Light Mode';
      }
    }
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const body = document.body;
    const themeBtn = document.getElementById('themeToggleBtn');
    
    if (savedTheme === 'dark') {
      body.classList.add('dark-mode');
      if (themeBtn) {
        themeBtn.textContent = '☀️ Light Mode';
      }
    } else {
      body.classList.remove('dark-mode');
      if (themeBtn) {
        themeBtn.textContent = '🌙 Dark Mode';
      }
    }
  }
}

// Create global instance
const api = new APIClient();

// Auto-test connection on page load
window.addEventListener('load', async () => {
  console.log('📱 Page loaded. Testing backend connection...');
  const isConnected = await api.testConnection();
  if (!isConnected) {
    console.warn('⚠️ Warning: Backend is not reachable. Some features may not work.');
  }
});
