class CalendarView {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.allEvents = [];
        this.init();
    }

    async init() {
        // Initialize theme preference
        api.initializeTheme();
        
        // Setup event listeners
        this.setupEventListeners();

        // Load events
        await this.loadAllEvents();

        // Render calendar
        this.renderCalendar();

        // Update login status
        this.updateLoginStatus();
    }

    setupEventListeners() {
        document.getElementById('prevMonthBtn').addEventListener('click', () => this.previousMonth());
        document.getElementById('nextMonthBtn').addEventListener('click', () => this.nextMonth());
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    async loadAllEvents() {
        try {
            // Get ALL events (both past and upcoming) - no date filtering
            const response = await api.getEvents();
            this.allEvents = response;
            console.log(`✅ Loaded ${this.allEvents.length} total events (including past events)`);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Update month/year display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const dayElement = this.createDayElement(dayNum, true, null, null);
            calendarDays.appendChild(dayElement);
        }

        // Current month days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDateObj = new Date(year, month, day);
            const isToday = 
                currentDateObj.getDate() === today.getDate() &&
                currentDateObj.getMonth() === today.getMonth() &&
                currentDateObj.getFullYear() === today.getFullYear();

            const isSelected = 
                currentDateObj.getDate() === this.selectedDate.getDate() &&
                currentDateObj.getMonth() === this.selectedDate.getMonth() &&
                currentDateObj.getFullYear() === this.selectedDate.getFullYear();

            const eventsOnDay = this.getEventsForDate(currentDateObj);
            const dayElement = this.createDayElement(day, false, isToday, isSelected, currentDateObj, eventsOnDay);
            calendarDays.appendChild(dayElement);
        }

        // Next month days
        const totalCells = calendarDays.children.length;
        const remainingCells = 42 - totalCells; // 6 rows * 7 days = 42
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createDayElement(day, true, null, null);
            calendarDays.appendChild(dayElement);
        }

        // Display events for selected date
        this.displayEventsForSelectedDate();

        // Display upcoming events
        this.displayUpcomingEvents();
    }

    createDayElement(day, isOtherMonth, isToday, isSelected, dateObj, events) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';

        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }

        if (isToday) {
            dayElement.classList.add('today');
        }

        if (isSelected) {
            dayElement.classList.add('selected');
        }

        if (events && events.length > 0) {
            dayElement.classList.add('has-events');
        }

        if (!isOtherMonth && dateObj) {
            dayElement.addEventListener('click', () => this.selectDate(dateObj));
        }

        let html = `<span class="day-number">${day}</span>`;
        if (events && events.length > 0 && !isOtherMonth) {
            html += `<span class="day-events">${events.length} event${events.length !== 1 ? 's' : ''}</span>`;
        }

        dayElement.innerHTML = html;
        return dayElement;
    }

    selectDate(dateObj) {
        this.selectedDate = new Date(dateObj);
        this.renderCalendar();
    }

    getEventsForDate(dateObj) {
        return this.allEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === dateObj.getDate() &&
                   eventDate.getMonth() === dateObj.getMonth() &&
                   eventDate.getFullYear() === dateObj.getFullYear();
        });
    }

    displayEventsForSelectedDate() {
        const eventsList = document.getElementById('eventsList');
        const selectedDateTitle = document.getElementById('selectedDateTitle');

        const dateString = this.selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        selectedDateTitle.textContent = `Events for ${dateString}`;

        const eventsOnDay = this.getEventsForDate(this.selectedDate);

        if (eventsOnDay.length === 0) {
            eventsList.innerHTML = '<div class="empty-events">No events scheduled for this day</div>';
            return;
        }

        eventsList.innerHTML = '';
        eventsOnDay.forEach(event => {
            const eventCard = this.createEventCard(event);
            eventsList.appendChild(eventCard);
        });
    }

    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';

        const capacityPercentage = (event.registeredCount / event.capacity) * 100;

        let registerButton = '';
        if (api.isAuthenticated()) {
            registerButton = `<button class="btn-register" onclick="calendarView.registerEvent('${event._id}')">Register</button>`;
        }

        card.innerHTML = `
            <div class="event-time">${event.startTime} - ${event.endTime}</div>
            <div class="event-title">${this.escapeHtml(event.title)}</div>
            <span class="event-category">${event.category}</span>
            <div class="event-details">
                <div class="event-detail-item">📍 ${this.escapeHtml(event.location)}</div>
                <div class="event-detail-item">👥 ${event.registeredCount}/${event.capacity}</div>
                <div style="width: 100%; background: #ddd; height: 4px; border-radius: 2px; overflow: hidden;">
                    <div style="width: ${capacityPercentage}%; height: 100%; background: ${capacityPercentage > 80 ? '#dc3545' : '#28a745'};"></div>
                </div>
            </div>
            <div class="event-actions">
                <button class="btn-view" onclick="calendarView.viewEvent('${event._id}')">View Details</button>
                ${registerButton}
            </div>
        `;

        return card;
    }

    displayUpcomingEvents() {
        const upcomingList = document.getElementById('upcomingEventsList');
        upcomingList.innerHTML = '';

        // Get next 7 upcoming events
        const upcomingEvents = this.allEvents
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 7);

        if (upcomingEvents.length === 0) {
            upcomingList.innerHTML = '<div class="empty-events">No upcoming events</div>';
            return;
        }

        upcomingEvents.forEach(event => {
            const timelineEvent = this.createTimelineEvent(event);
            upcomingList.appendChild(timelineEvent);
        });
    }

    createTimelineEvent(event) {
        const container = document.createElement('div');
        container.className = 'timeline-event';

        const eventDate = new Date(event.date);
        const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'short' });
        const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
        const day = eventDate.getDate();

        let registerButton = '';
        if (api.isAuthenticated()) {
            registerButton = `<button class="btn-small" onclick="calendarView.registerEvent('${event._id}')">Register</button>`;
        }

        container.innerHTML = `
            <div class="timeline-date">
                <div class="timeline-date-day">${day}</div>
                <div class="timeline-date-month">${month}</div>
            </div>
            <div class="timeline-content">
                <div class="timeline-title">${this.escapeHtml(event.title)}</div>
                <div class="timeline-description">${this.escapeHtml(event.description.substring(0, 100))}...</div>
                <div class="timeline-meta">
                    <span>📅 ${event.startTime}</span>
                    <span>📍 ${this.escapeHtml(event.location)}</span>
                    <span>👥 ${event.registeredCount}/${event.capacity}</span>
                    <span class="timeline-category">${event.category}</span>
                </div>
                <div class="timeline-action">
                    <button class="btn-small" onclick="calendarView.viewEvent('${event._id}')">View Details</button>
                    ${registerButton}
                </div>
            </div>
            ${event.image ? `<div class="timeline-image" style="width: 130px; height: 130px; border-radius: 8px; overflow: hidden; flex-shrink: 0; margin-left: auto;">
                <img src="${this.escapeHtml(event.image)}" alt="${this.escapeHtml(event.title)}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>` : ''}
        `;

        return container;
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    async viewEvent(eventId) {
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
            await this.loadAllEvents();
            this.renderCalendar();
        } catch (error) {
            alert('Failed to register: ' + error.message);
        }
    }

    updateLoginStatus() {
        const user = api.getCurrentUser();
        if (user) {
            // Show logout button and user name button, hide login button
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
const calendarView = new CalendarView();
