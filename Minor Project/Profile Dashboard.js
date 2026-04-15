class ProfileDashboard {
    constructor() {
        this.user = null;
        this.init();
    }

    async init() {
        try {
            // Check if user is logged in
            if (!api.isAuthenticated()) {
                alert('Please login to view your profile');
                window.location.href = 'Login Page.html';
                return;
            }

            // Initialize theme
            api.initializeTheme();

            // Show logout and user buttons
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
            }
            const userNameBtn = document.getElementById('userNameBtn');
            if (userNameBtn) {
                userNameBtn.style.display = 'inline-block';
            }

            // Load user data
            await this.loadUserProfile();
            await this.loadStats();

            // Setup event listeners
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing profile dashboard:', error);
            this.showError('Failed to load profile');
        }
    }

    setupEventListeners() {
        // Tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Edit profile button
        document.getElementById('editProfileBtn').addEventListener('click', () => this.openEditModal());

        // Theme toggle button
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => api.toggleTheme());
        }

        // Logout button (navbar)
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Logout button (footer)
        const footerLogoutBtn = document.getElementById('footerLogoutBtn');
        if (footerLogoutBtn) {
            footerLogoutBtn.addEventListener('click', () => this.logout());
        }
    }

    async loadUserProfile() {
        try {
            const response = await api.getMyProfile();
            this.user = response;
            this.displayProfile();
        } catch (error) {
            console.error('Error loading profile:', error);
            throw error;
        }
    }

    displayProfile() {
        const user = this.user;

        // Update header
        document.getElementById('userName').textContent = user.fullName;
        document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('avatarInitial').textContent = user.fullName.charAt(0).toUpperCase();

        // Update profile details
        document.getElementById('displayEmail').textContent = user.email;
        document.getElementById('displayPhone').textContent = user.phone || '-';
        document.getElementById('displayDepartment').textContent = user.additionalDetails?.department || '-';
        document.getElementById('displayYear').textContent = user.additionalDetails?.year || '-';
        document.getElementById('displayBio').textContent = user.additionalDetails?.bio || '-';
        document.getElementById('displayJoined').textContent = new Date(user.createdAt).toLocaleDateString();

        // Load events
        this.loadRegisteredEvents();
        
        // Show organized events tab for organizers and admins
        if (user.role === 'organizer' || user.role === 'admin') {
            this.loadOrganizedEvents();
            const organizedTab = document.querySelector('[data-tab="organized"]');
            if (organizedTab) {
                organizedTab.style.display = 'block';
            }
        } else {
            // Hide organized events section for students
            const organizedTab = document.querySelector('[data-tab="organized"]');
            if (organizedTab) {
                organizedTab.style.display = 'none';
            }
            const organizedContent = document.getElementById('organized');
            if (organizedContent) {
                organizedContent.style.display = 'none';
            }
        }

        // Check if student should see organizer request section
        this.checkOrganizerRequest();
    }

    async loadStats() {
        try {
            const response = await api.getMyStats();
            const stats = response.stats;

            document.getElementById('registeredCount').textContent = stats.totalRegistered;
            document.getElementById('upcomingCount').textContent = stats.upcomingRegistered;
            document.getElementById('organizedCount').textContent = stats.totalOrganized;
            document.getElementById('completedCount').textContent = stats.totalOrganized - stats.upcomingOrganized;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadRegisteredEvents() {
        try {
            const events = await api.getMyRegisteredEvents();
            this.displayRegisteredEvents(events);
        } catch (error) {
            console.error('Error loading registered events:', error);
        }
    }

    displayRegisteredEvents(events) {
        const container = document.getElementById('registeredEventsList');
        container.innerHTML = '';

        if (events.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No registered events yet</p>';
            return;
        }

        events.forEach(event => {
            const eventCard = this.createEventCard(event, 'registered');
            container.appendChild(eventCard);
        });
    }

    async loadOrganizedEvents() {
        try {
            const events = await api.getMyOrganizedEvents();
            this.displayOrganizedEvents(events);
        } catch (error) {
            console.error('Error loading organized events:', error);
        }
    }

    displayOrganizedEvents(events) {
        const container = document.getElementById('organizedEventsList');
        container.innerHTML = '';

        if (events.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">You haven\'t organized any events yet</p>';
            return;
        }

        events.forEach(event => {
            const eventCard = this.createEventCard(event, 'organized');
            container.appendChild(eventCard);
        });
    }

    createEventCard(event, type) {
        const card = document.createElement('div');
        card.className = 'event-item';

        const date = new Date(event.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const capacityPercentage = (event.registeredCount / event.capacity) * 100;

        let actionButtons = '';
        if (type === 'registered') {
            actionButtons = `
                <button class="btn-secondary" onclick="profileDashboard.viewEventDetails('${event._id}')">View Details</button>
                <button class="btn-danger" onclick="profileDashboard.cancelRegistration('${event._id}')">Unregister</button>
            `;
        } else {
            actionButtons = `
                <button class="btn-secondary" onclick="profileDashboard.editEvent('${event._id}')">Edit</button>
                <button class="btn-danger" onclick="profileDashboard.deleteEvent('${event._id}')">Delete</button>
            `;
        }

        card.innerHTML = `
            <div class="event-header">
                <div style="flex: 1;">
                    <h3 class="event-title">${this.escapeHtml(event.title)}</h3>
                    <span class="event-category-badge">${event.category}</span>
                </div>
            </div>
            <div class="event-body">
                <div class="event-details">
                    <div class="event-details-item">📅 ${formattedDate} at ${event.startTime}</div>
                    <div class="event-details-item">📍 ${this.escapeHtml(event.location)}</div>
                    <div class="event-details-item">👥 ${event.registeredCount}/${event.capacity} registered</div>
                    <div style="margin-top: 0.5rem;">
                        <div style="width: 100%; background: #ddd; height: 4px; border-radius: 2px; overflow: hidden;">
                            <div style="width: ${capacityPercentage}%; height: 100%; background: ${capacityPercentage > 80 ? '#dc3545' : '#28a745'};"></div>
                        </div>
                    </div>
                </div>
                <div class="event-actions">
                    ${actionButtons}
                </div>
            </div>
        `;

        return card;
    }

    getCategoryEmoji(category) {
        const emojis = {
            'Tech': '💻',
            'Sports': '⚽',
            'Music': '🎵',
            'Art': '🎨',
            'Cultural': '🌍',
            'Business': '💼',
            'Other': '🎉'
        };
        return emojis[category] || '🎉';
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName).classList.add('active');

        // Add active class to clicked button
        event.target.classList.add('active');
    }

    openEditModal() {
        const modal = document.getElementById('editProfileModal');
        const user = this.user;

        // Populate modal with current data
        document.getElementById('editFullName').value = user.fullName;
        document.getElementById('editPhone').value = user.phone || '';
        document.getElementById('editDepartment').value = user.additionalDetails?.department || '';
        document.getElementById('editYear').value = user.additionalDetails?.year || '';
        document.getElementById('editBio').value = user.additionalDetails?.bio || '';

        modal.style.display = 'flex';
    }

    async saveProfileChanges() {
        try {
            const profileData = {
                fullName: document.getElementById('editFullName').value,
                phone: document.getElementById('editPhone').value,
                additionalDetails: {
                    department: document.getElementById('editDepartment').value,
                    year: document.getElementById('editYear').value,
                    bio: document.getElementById('editBio').value
                }
            };

            if (!profileData.fullName.trim()) {
                alert('Full name is required');
                return;
            }

            await api.updateProfile(profileData);
            alert('Profile updated successfully!');
            this.closeModal();
            await this.loadUserProfile();
        } catch (error) {
            alert('Failed to update profile: ' + error.message);
        }
    }

    closeModal() {
        document.getElementById('editProfileModal').style.display = 'none';
    }

    async viewEventDetails(eventId) {
        window.location.href = `Event Details.html?id=${eventId}`;
    }

    async cancelRegistration(eventId) {
        if (confirm('Are you sure you want to unregister from this event?')) {
            try {
                await api.cancelRegistration(eventId);
                alert('Unregistered successfully');
                await this.loadRegisteredEvents();
                await this.loadStats();
            } catch (error) {
                alert('Failed to unregister: ' + error.message);
            }
        }
    }

    editEvent(eventId) {
        window.location.href = `Organise Event.html?id=${eventId}`;
    }

    async deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await api.deleteEvent(eventId);
                alert('Event deleted successfully');
                await this.loadOrganizedEvents();
                await this.loadStats();
            } catch (error) {
                alert('Failed to delete event: ' + error.message);
            }
        }
    }

    showCreateEventForm() {
        // Check if user is an organizer or admin
        if (this.user.role !== 'organizer' && this.user.role !== 'admin') {
            alert('Only organizers and admins can create events. Please contact the administrator to upgrade your account.');
            return;
        }
        window.location.href = 'Organise Event.html';
    }

    checkOrganizerRequest() {
        // Show organizer request section only for students
        const requestSection = document.getElementById('organizerRequestSection');
        const requestBtn = document.getElementById('requestOrganizerBtn');
        const requestStatus = document.getElementById('requestStatus');

        if (this.user.role === 'student') {
            requestSection.classList.add('show');
            
            // Get user ID (handle both _id and id)
            const userId = this.user._id || this.user.id;
            if (!userId) {
                console.error('User ID not found');
                return;
            }
            
            // Check if user already has a pending request
            const requests = api.getOrganizerRequests();
            const userRequest = requests.find(req => req.userId === userId);
            
            if (userRequest) {
                requestBtn.disabled = true;
                requestBtn.style.opacity = '0.5';
                requestBtn.style.cursor = 'not-allowed';
                
                if (userRequest.status === 'pending') {
                    requestStatus.innerHTML = '<p style="color: #f39c12; font-weight: bold;">⏳ Your request is pending review...</p>';
                    requestBtn.textContent = '⏳ Request Pending';
                } else if (userRequest.status === 'approved') {
                    requestStatus.innerHTML = '<p style="color: #27ae60; font-weight: bold;">✅ Your request has been approved! Refresh the page to see your new privileges.</p>';
                    requestBtn.textContent = '✅ Approved';
                } else if (userRequest.status === 'rejected') {
                    requestStatus.innerHTML = '<p style="color: #e74c3c; font-weight: bold;">❌ Your request was rejected. You can try again later.</p>';
                    requestBtn.disabled = false;
                    requestBtn.style.opacity = '1';
                    requestBtn.style.cursor = 'pointer';
                    requestBtn.textContent = '📝 Request Again';
                }
            } else {
                requestBtn.disabled = false;
                requestBtn.style.opacity = '1';
                requestBtn.style.cursor = 'pointer';
                requestStatus.innerHTML = '';
            }
        } else {
            requestSection.classList.remove('show');
        }
    }

    async requestOrganizerRole() {
        try {
            if (confirm('Are you sure you want to request becoming an organizer? An admin will review your request.')) {
                // Get user ID (handle both _id and id)
                const userId = this.user._id || this.user.id;
                if (!userId) {
                    alert('❌ Error: User ID not found. Please refresh and try again.');
                    return;
                }
                
                const success = api.createOrganizerRequest(userId, this.user.fullName, this.user.email);
                
                if (success) {
                    alert('✅ Your request has been submitted successfully! An admin will review it soon.');
                    this.checkOrganizerRequest();
                } else {
                    alert('❌ Failed to submit request. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error requesting organizer role:', error);
            alert('❌ Error submitting request. Please try again.');
        }
    }

    logout() {
        try {
            if (confirm('Are you sure you want to logout?')) {
                api.logout();
                window.location.href = 'Login Page.html';
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error logging out');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        alert(message);
    }
}

// Initialize on page load
const profileDashboard = new ProfileDashboard();
