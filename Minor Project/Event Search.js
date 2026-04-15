class EventSearch {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalPages = 1;
        this.init();
    }

    init() {
        // Initialize theme preference
        api.initializeTheme();
        
        // Get elements
        this.searchBtn = document.getElementById('searchBtn');
        this.applyFiltersBtn = document.getElementById('applyFiltersBtn');
        this.clearFiltersBtn = document.getElementById('clearFiltersBtn');
        this.eventsList = document.getElementById('eventsList');
        this.resultCount = document.getElementById('resultCount');
        this.paginationContainer = document.getElementById('paginationContainer');

        // Filters
        this.searchInput = document.getElementById('searchInput');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.locationFilter = document.getElementById('locationFilter');
        this.dateFromFilter = document.getElementById('dateFromFilter');
        this.dateToFilter = document.getElementById('dateToFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.sortBy = document.getElementById('sortBy');

        // Pagination
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.pageInfo = document.getElementById('pageInfo');

        // Logout button
        this.logoutBtn = document.getElementById('logoutBtn');

        // Event listeners
        this.searchBtn.addEventListener('click', () => {
            this.currentPage = 1;
            this.searchEvents();
        });

        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.currentPage = 1;
                this.searchEvents();
            }
        });

        this.applyFiltersBtn.addEventListener('click', () => {
            this.currentPage = 1;
            this.searchEvents();
        });

        this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        this.prevBtn.addEventListener('click', () => this.previousPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        
        // Logout button with null check
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Check login status
        this.updateLoginStatus();

        // Load initial events
        this.searchEvents();
    }

    async searchEvents() {
        try {
            this.showLoading();

            const filters = this.getFilters();

            const response = await api.searchEvents({
                ...filters,
                page: this.currentPage,
                limit: this.pageSize
            });

            this.displayEvents(response.events);
            this.updatePagination(response.pagination);
        } catch (error) {
            console.error('Error searching events:', error);
            this.showError('Failed to search events. Please try again.');
        }
    }

    getFilters() {
        return {
            query: this.searchInput.value.trim(),
            category: this.categoryFilter.value,
            location: this.locationFilter.value.trim(),
            dateFrom: this.dateFromFilter.value,
            dateTo: this.dateToFilter.value,
            status: this.statusFilter.value,
            sortBy: this.sortBy.value
        };
    }

    displayEvents(events) {
        this.eventsList.innerHTML = '';

        if (events.length === 0) {
            this.eventsList.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">🔍</div>
                    <div class="empty-state-text">No events found. Try adjusting your filters.</div>
                </div>
            `;
            return;
        }

        events.forEach(event => {
            const card = this.createEventCard(event);
            this.eventsList.appendChild(card);
        });
    }

    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';

        const date = new Date(event.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const capacityPercentage = (event.registeredCount / event.capacity) * 100;

        // Use image if available, otherwise fallback to gradient with emoji
        const thumbnailContent = event.image 
            ? `<img src="${this.escapeHtml(event.image)}" alt="${this.escapeHtml(event.title)}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">${this.getCategoryEmoji(event.category)}</div>`;

        card.innerHTML = `
            <div style="width: 100%; height: 200px; overflow: hidden;">
                ${thumbnailContent}
            </div>
            <div class="event-body">
                <span class="event-category">${event.category}</span>
                <h3 class="event-title">${this.escapeHtml(event.title)}</h3>
                <p class="event-description">${this.escapeHtml(event.description.substring(0, 100))}...</p>
                <div class="event-meta">
                    <div class="event-meta-item event-date">📅 ${formattedDate} | ${event.startTime}</div>
                    <div class="event-meta-item event-location">📍 ${this.escapeHtml(event.location)}</div>
                    <div class="event-meta-item event-capacity">👥 ${event.registeredCount}/${event.capacity}</div>
                    <div class="event-meta-item" style="margin-top: 0.5rem;">
                        <div style="width: 100%; background: #ddd; height: 4px; border-radius: 2px; overflow: hidden;">
                            <div style="width: ${capacityPercentage}%; height: 100%; background: ${capacityPercentage > 80 ? '#dc3545' : '#28a745'};"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="event-footer">
                <button class="btn-view" onclick="eventSearch.viewEvent('${event._id}')">View Details</button>
                ${api.isAuthenticated() ? `<button class="btn-register" onclick="eventSearch.registerEvent('${event._id}')">Register</button>` : ''}
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

    async viewEvent(eventId) {
        // Redirect to event details page
        window.location.href = `Event Details.html?id=${eventId}`;
    }

    async registerEvent(eventId) {
        if (!api.isAuthenticated()) {
            alert('Please login to register for events');
            window.location.href = 'Login Page.html';
            return;
        }

        try {
            await api.registerEvent(eventId);
            alert('Successfully registered for the event!');
            this.searchEvents(); // Refresh to show updated registration count
        } catch (error) {
            alert('Failed to register: ' + error.message);
        }
    }

    clearFilters() {
        this.searchInput.value = '';
        this.categoryFilter.value = '';
        this.locationFilter.value = '';
        this.dateFromFilter.value = '';
        this.dateToFilter.value = '';
        this.statusFilter.value = '';
        this.sortBy.value = 'date';
        this.currentPage = 1;
        this.searchEvents();
    }

    updatePagination(pagination) {
        this.resultCount.textContent = `(${pagination.total})`;
        this.totalPages = pagination.pages;
        this.pageInfo.textContent = `Page ${pagination.page} of ${pagination.pages}`;

        this.prevBtn.disabled = pagination.page === 1;
        this.nextBtn.disabled = pagination.page === pagination.pages;

        if (pagination.pages === 1) {
            this.paginationContainer.style.display = 'none';
        } else {
            this.paginationContainer.style.display = 'flex';
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.searchEvents();
            window.scrollTo(0, 0);
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.searchEvents();
            window.scrollTo(0, 0);
        }
    }

    showLoading() {
        this.eventsList.innerHTML = `
            <div class="loading" style="grid-column: 1/-1;">
                <div class="spinner"></div>
                <p>Searching events...</p>
            </div>
        `;
    }

    showError(message) {
        this.eventsList.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; color: #dc3545;">
                <div class="empty-state-icon">❌</div>
                <div class="empty-state-text">${message}</div>
            </div>
        `;
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
}

// Initialize on page load
const eventSearch = new EventSearch();
