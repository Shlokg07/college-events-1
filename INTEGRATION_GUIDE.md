# College Events Portal - Full Integration Guide

## Project Architecture

Your project needs:
1. **Backend**: Node.js/Express server with API endpoints
2. **Database**: MongoDB (events, users, registrations)
3. **Frontend**: Modified HTML/CSS/JS with fetch API calls
4. **Authentication**: User login/signup with sessions

---

## Step 1: Set Up Backend (Node.js/Express)

### 1.1 Install Dependencies
```bash
cd backend
npm init -y
npm install express cors dotenv mongoose bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

### 1.2 Create Backend Files

**File structure:**
```
backend/
├── server.js              # Main server file
├── .env                   # Environment variables
├── models/
│   ├── User.js           # User schema
│   └── Event.js          # Event schema
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── events.js         # Events management routes
│   └── registrations.js  # Event registrations routes
├── middleware/
│   └── auth.js           # JWT authentication middleware
└── package.json
```

---

## Step 2: Database Models

### User Model
- Stores user registration data
- Handles authentication
- Tracks attended events

### Event Model
- Event details (title, date, location, capacity)
- Organizer information
- Participant count

### Registration Model
- Links users to events
- Tracks registration status

---

## Step 3: API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Events Routes
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create event (organizer)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Registrations Routes
- `POST /api/register/:eventId` - Register for event
- `GET /api/my-registrations` - Get user's registered events
- `DELETE /api/registrations/:id` - Cancel registration

---

## Step 4: Frontend Modifications

Frontend pages will be converted to use:
- **Fetch API** for backend communication
- **Session Management** for login persistence
- **Dynamic Content** loading from database
- **Form Validation** with backend

---

## Step 5: Running the Project

```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Serve Frontend (using Live Server or Python)
# You can open the HTML files in browser or use a simple HTTP server
```

---

## Files to be Created

1. `backend/server.js` - Express server setup
2. `backend/models/User.js` - User schema
3. `backend/models/Event.js` - Event schema
4. `backend/routes/auth.js` - Auth endpoints
5. `backend/routes/events.js` - Events endpoints
6. `backend/middleware/auth.js` - JWT middleware
7. Modified JavaScript files with API calls

---

## Quick Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Server | Express.js | Handle API requests |
| Database | MongoDB | Store users, events, registrations |
| Authentication | JWT + bcryptjs | Secure user login |
| Frontend | Fetch API | Communicate with backend |
| Session | localStorage/JWT | Persist user login |

Ready to implement? I'll create all the backend files next.
