class AdminDashboard {
    constructor() {
        this.currentUserPage = 1;
        this.currentEventPage = 1;
        this.userPageSize = 20;
        this.eventPageSize = 20;
        this.selectedUserId = null;
        this.selectedEventId = null;
        this.init();
    }

    async init() {
        try {
            // Initialize theme preference
            api.initializeTheme();
            
            // Check if user is admin
            if (!api.isAuthenticated() || !this.isAdmin()) {
                alert('Admin access required');
                window.location.href = 'Home Page.html';
                return;
            }

            // Update user name in navbar
            this.updateLoginStatus();

            // Setup event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadStats();
            await this.loadRequests();
            await this.loadUsers();
            await this.loadEvents();

        } catch (error) {
            console.error('Error initializing admin dashboard:', error);
        }
    }

    updateLoginStatus() {
        const user = api.getCurrentUser();
        if (user) {
            // Show logout button and user name button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
            }
            
            const userNameBtn = document.getElementById('userNameBtn');
            if (userNameBtn) {
                userNameBtn.textContent = `👤 ${user.fullName}`;
                userNameBtn.style.display = 'inline-block';
            }
        }
    }

    isAdmin() {
        const user = api.getCurrentUser();
        return user && user.role === 'admin';
    }

    setupEventListeners() {
        // Tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Requests
        const refreshRequestsBtn = document.getElementById('refreshRequestsBtn');
        if (refreshRequestsBtn) {
            refreshRequestsBtn.addEventListener('click', () => this.loadRequests());
        }

        const requestStatusFilter = document.getElementById('requestStatusFilter');
        if (requestStatusFilter) {
            requestStatusFilter.addEventListener('change', () => this.displayRequests());
        }

        // User search
        document.getElementById('searchUsersBtn').addEventListener('click', () => this.searchUsers());
        document.getElementById('userSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchUsers();
        });

        // Event search
        document.getElementById('searchEventsBtn').addEventListener('click', () => this.searchEvents());
        document.getElementById('eventSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchEvents();
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    async loadStats() {
        try {
            const stats = await api.getAdminStats();

            document.getElementById('totalUsers').textContent = stats.totals.users;
            document.getElementById('totalEvents').textContent = stats.totals.events;
            document.getElementById('totalRegistrations').textContent = stats.totals.registrations;

            // Display users by role
            this.displayChart('usersByRole', stats.usersByRole, 'role');

            // Display events by category
            this.displayChart('eventsByCategory', stats.eventsByCategory, 'category');

            // Display events by status
            this.displayChart('eventsByStatus', stats.eventsByStatus, 'status');

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    displayChart(elementId, data, type) {
        const container = document.getElementById(elementId);
        container.innerHTML = '';

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No data available</p>';
            return;
        }

        const total = data.reduce((sum, item) => sum + item.count, 0);

        data.forEach(item => {
            const percentage = (item.count / total) * 100;
            const label = item._id || 'Unknown';

            const itemHtml = `
                <div class="chart-data-item">
                    <div>
                        <span class="chart-data-label">${this.escapeHtml(label)}</span>
                        <div class="chart-data-bar">
                            <div class="chart-data-bar-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    <span class="chart-data-value">${item.count}</span>
                </div>
            `;

            container.innerHTML += itemHtml;
        });
    }

    async loadUsers(page = 1) {
        try {
            this.currentUserPage = page;
            const response = await api.getAllUsers({
                page: page,
                limit: this.userPageSize
            });

            this.displayUsers(response.users);
            this.displayUsersPagination(response.pagination);

        } catch (error) {
            console.error('Error loading users:', error);
            alert('Failed to load users');
        }
    }

    async searchUsers() {
        try {
            const search = document.getElementById('userSearch').value;
            const role = document.getElementById('roleFilter').value;

            this.currentUserPage = 1;
            const response = await api.getAllUsers({
                search,
                role,
                page: 1,
                limit: this.userPageSize
            });

            this.displayUsers(response.users);
            this.displayUsersPagination(response.pagination);

        } catch (error) {
            console.error('Error searching users:', error);
            alert('Failed to search users');
        }
    }

    displayUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No users found</td></tr>';
            return;
        }

        users.forEach(user => {
            const joinDate = new Date(user.createdAt).toLocaleDateString();
            const row = `
                <tr>
                    <td>${this.escapeHtml(user.fullName)}</td>
                    <td>${this.escapeHtml(user.email)}</td>
                    <td><span class="role-badge ${user.role}">${user.role}</span></td>
                    <td>${joinDate}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="adminDashboard.openEditUserModal('${user._id}', '${this.escapeHtml(user.fullName)}', '${user.role}')">Edit Role</button>
                            <button class="btn-danger" onclick="adminDashboard.deleteUser('${user._id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    displayUsersPagination(pagination) {
        const container = document.getElementById('usersPagination');
        container.innerHTML = '';

        if (pagination.pages <= 1) return;

        let html = `<span class="pagination-info">Page ${pagination.page} of ${pagination.pages}</span>`;

        if (pagination.page > 1) {
            html += `<button onclick="adminDashboard.loadUsers(${pagination.page - 1})">← Previous</button>`;
        }

        if (pagination.page < pagination.pages) {
            html += `<button onclick="adminDashboard.loadUsers(${pagination.page + 1})">Next →</button>`;
        }

        container.innerHTML = html;
    }

    async loadEvents(page = 1) {
        try {
            this.currentEventPage = page;
            const response = await api.getAllEvents({
                page: page,
                limit: this.eventPageSize
            });

            this.displayEvents(response.events);
            this.displayEventsPagination(response.pagination);

        } catch (error) {
            console.error('Error loading events:', error);
            alert('Failed to load events');
        }
    }

    async searchEvents() {
        try {
            const search = document.getElementById('eventSearch').value;
            const category = document.getElementById('categoryFilter').value;
            const status = document.getElementById('eventStatusFilter').value;

            this.currentEventPage = 1;
            const response = await api.getAllEvents({
                search,
                category,
                status,
                page: 1,
                limit: this.eventPageSize
            });

            this.displayEvents(response.events);
            this.displayEventsPagination(response.pagination);

        } catch (error) {
            console.error('Error searching events:', error);
            alert('Failed to search events');
        }
    }

    displayEvents(events) {
        const tbody = document.getElementById('eventsTableBody');
        tbody.innerHTML = '';

        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No events found</td></tr>';
            return;
        }

        events.forEach(event => {
            const eventDate = new Date(event.date).toLocaleDateString();
            const organizerName = event.organizer?.fullName || 'Unknown';
            
            const row = `
                <tr>
                    <td>${this.escapeHtml(event.title)}</td>
                    <td>${event.category}</td>
                    <td>${eventDate}</td>
                    <td>${event.registeredCount}/${event.capacity}</td>
                    <td><span class="status-badge ${event.status}">${event.status}</span></td>
                    <td>${this.escapeHtml(organizerName)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="adminDashboard.openEditEventModal('${event._id}', '${this.escapeHtml(event.title)}', '${event.status}')">Edit Status</button>
                            <button class="btn-danger" onclick="adminDashboard.deleteEvent('${event._id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    displayEventsPagination(pagination) {
        const container = document.getElementById('eventsPagination');
        container.innerHTML = '';

        if (pagination.pages <= 1) return;

        let html = `<span class="pagination-info">Page ${pagination.page} of ${pagination.pages}</span>`;

        if (pagination.page > 1) {
            html += `<button onclick="adminDashboard.loadEvents(${pagination.page - 1})">← Previous</button>`;
        }

        if (pagination.page < pagination.pages) {
            html += `<button onclick="adminDashboard.loadEvents(${pagination.page + 1})">Next →</button>`;
        }

        container.innerHTML = html;
    }

    openEditUserModal(userId, userName, currentRole) {
        this.selectedUserId = userId;
        document.getElementById('userNameDisplay').textContent = userName;
        document.getElementById('newUserRole').value = currentRole;
        document.getElementById('editUserModal').style.display = 'flex';
    }

    async saveUserRoleChange() {
        try {
            const newRole = document.getElementById('newUserRole').value;
            await api.updateUserRole(this.selectedUserId, newRole);
            alert('User role updated successfully');
            this.closeModal();
            await this.loadUsers(this.currentUserPage);
        } catch (error) {
            alert('Failed to update user role: ' + error.message);
        }
    }

    async deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.deleteUser(userId);
                alert('User deleted successfully');
                await this.loadUsers(this.currentUserPage);
            } catch (error) {
                alert('Failed to delete user: ' + error.message);
            }
        }
    }

    openEditEventModal(eventId, eventTitle, currentStatus) {
        this.selectedEventId = eventId;
        document.getElementById('eventTitleDisplay').textContent = eventTitle;
        document.getElementById('newEventStatus').value = currentStatus;
        document.getElementById('editEventModal').style.display = 'flex';
    }

    async saveEventStatusChange() {
        try {
            const newStatus = document.getElementById('newEventStatus').value;
            await api.updateEventStatus(this.selectedEventId, newStatus);
            alert('Event status updated successfully');
            this.closeModal();
            await this.loadEvents(this.currentEventPage);
        } catch (error) {
            alert('Failed to update event status: ' + error.message);
        }
    }

    async deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await api.deleteEventAsAdmin(eventId);
                alert('Event deleted successfully');
                await this.loadEvents(this.currentEventPage);
            } catch (error) {
                alert('Failed to delete event: ' + error.message);
            }
        }
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

    closeModal() {
        document.getElementById('editUserModal').style.display = 'none';
        document.getElementById('editEventModal').style.display = 'none';
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

    // =====================
    // ORGANIZER REQUESTS METHODS
    // =====================

    async loadRequests() {
        try {
            const requests = api.getOrganizerRequests();
            this.displayRequests(requests);
        } catch (error) {
            console.error('Error loading requests:', error);
            alert('Failed to load requests');
        }
    }

    displayRequests(requests = null) {
        if (!requests) {
            requests = api.getOrganizerRequests();
        }

        const container = document.getElementById('requestsContainer');
        const statusFilter = document.getElementById('requestStatusFilter').value;

        // Filter requests by status
        let filteredRequests = requests;
        if (statusFilter) {
            filteredRequests = requests.filter(req => req.status === statusFilter);
        }

        container.innerHTML = '';

        if (filteredRequests.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #999;">
                    <p>📭 No ${statusFilter ? statusFilter : 'organizer'} requests found</p>
                </div>
            `;
            return;
        }

        filteredRequests.forEach(request => {
            const requestedDate = new Date(request.requestedAt).toLocaleDateString();
            const statusColor = request.status === 'pending' ? '#f39c12' : request.status === 'approved' ? '#27ae60' : '#e74c3c';
            const statusText = request.status.toUpperCase();

            let actionButtons = '';
            if (request.status === 'pending') {
                actionButtons = `
                    <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
                        <button class="btn-success" onclick="adminDashboard.approveRequest('${request.id}')">✅ Approve</button>
                        <button class="btn-danger" onclick="adminDashboard.rejectRequest('${request.id}')">❌ Reject</button>
                    </div>
                `;
            }

            const card = document.createElement('div');
            card.style.cssText = `
                background: white;
                border-left: 5px solid ${statusColor};
                padding: 1.5rem;
                margin-bottom: 1rem;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                overflow: hidden;
            `;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 0.5rem 0; color: #333; font-size: 1.1rem;">${this.escapeHtml(request.userName)}</h3>
                        <p style="margin: 0.3rem 0; color: #666; font-size: 0.95rem;">📧 ${this.escapeHtml(request.userEmail)}</p>
                        <p style="margin: 0.3rem 0; color: #666; font-size: 0.95rem;">📅 Requested: ${requestedDate}</p>
                    </div>
                    <span style="background: ${statusColor}; color: white; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: bold; font-size: 0.85rem; white-space: nowrap; margin-left: 1rem;">
                        ${statusText}
                    </span>
                </div>
                ${request.reviewedAt ? `
                    <p style="margin: 0.5rem 0 1rem 0; font-size: 0.9rem; color: #999;">
                        💬 Reviewed on ${new Date(request.reviewedAt).toLocaleDateString()}
                    </p>
                ` : ''}
                ${actionButtons}
            `;

            container.appendChild(card);
        });
    }

    approveRequest(requestId) {
        if (confirm('Approve this request to make the student an organizer?')) {
            const success = api.approveOrganizerRequest(requestId, api.getCurrentUser()._id);
            if (success) {
                alert('✅ Request approved! The student will be promoted to organizer.');
                this.loadRequests();
            } else {
                alert('❌ Failed to approve request.');
            }
        }
    }

    rejectRequest(requestId) {
        if (confirm('Reject this request?')) {
            const success = api.rejectOrganizerRequest(requestId, api.getCurrentUser()._id);
            if (success) {
                alert('✅ Request rejected!');
                this.loadRequests();
            } else {
                alert('❌ Failed to reject request.');
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize on page load
const adminDashboard = new AdminDashboard();
