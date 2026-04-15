# College Events Portal - Setup & Running Instructions

## 🚀 QUICK START

### Prerequisites
- Node.js and npm installed
- MongoDB running locally (or cloud connection in .env)

### Installation Steps

#### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

#### Step 2: Configure MongoDB
Edit `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/college_events
JWT_SECRET=your_secret_key_here
PORT=5000
```

For **MongoDB Atlas (Cloud)**, use:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/college_events
```

#### Step 3: Start Backend Server
```bash
cd backend
npm start
# OR for development with auto-reload:
npm run dev
```

Expected output:
```
✓ MongoDB Connected
🚀 Server running on http://localhost:5000
📝 API Health Check: http://localhost:5000/api/health
```

#### Step 4: Serve Frontend
Option A: Using VS Code Live Server
- Install "Live Server" extension
- Right-click Home Page.html → "Open with Live Server"

Option B: Using Python
```bash
# In Minor Project folder
python -m http.server 3000
```

Option C: Using Node.js http-server
```bash
npm install -g http-server
cd "Minor Project"
http-server -p 3000
```

#### Step 5: Update Frontend Files

The updated JavaScript files are provided with `-UPDATED` suffix:
- `Login Page-UPDATED.js` → Replace `Login Page.js`
- `Sign Up-UPDATED.js` → Replace `Sign Up.js`  
- `Home Page-UPDATED.js` → Replace `Home Page.js`
- `Event Page-UPDATED.js` → Replace `Event Page.js`

**Add to HTML head of each file:**
```html
<script src="api-client.js"></script>
```

---

## 📝 Updated HTML Files

### Login Page.html
```html
<input type="email" placeholder="Email Address" id="email">
<input type="password" placeholder="Password" id="password">
<button onclick="login()">Login</button>
```

Update script reference:
```html
<script src="api-client.js"></script>
<script src="Login Page-UPDATED.js"></script>
```

### Sign Up.html
Add IDs to form fields:
```html
<input type="text" placeholder="Full Name" id="fullName">
<input type="email" placeholder="Email" id="email">
<input type="password" placeholder="Password" id="password">
<input type="password" placeholder="Confirm Password" id="confirmPassword">
<input type="tel" placeholder="Phone (optional)" id="phone">
<button onclick="signup()">Sign Up</button>
```

Update script reference:
```html
<script src="api-client.js"></script>
<script src="Sign Up-UPDATED.js"></script>
```

### Home Page.html
For event creation modal, add these IDs:
```html
<input type="text" id="eventTitle" placeholder="Event Title">
<textarea id="eventDescription" placeholder="Description"></textarea>
<select id="eventCategory">
  <option>Tech Workshop</option>
  <option>Sports</option>
  <option>Music</option>
  <option>Art</option>
  <!-- ... -->
</select>
<input type="date" id="eventDate">
<input type="time" id="eventStartTime">
<input type="time" id="eventEndTime">
<input type="text" id="eventLocation" placeholder="Location">
<input type="number" id="eventCapacity" placeholder="Capacity">
<button onclick="createEvent()">Create Event</button>
```

Update script reference:
```html
<script src="api-client.js"></script>
<script src="Home Page-UPDATED.js"></script>
```

### Event Page.html
```html
<div id="eventsContainer" class="events-grid">
  <!-- Events will be loaded here -->
</div>

<script src="api-client.js"></script>
<script src="Event Page-UPDATED.js"></script>
```

---

## 🧪 Testing the Setup

### 1. Test Backend Health
```
GET http://localhost:5000/api/health
```

Expected response:
```json
{ "status": "Backend is running!" }
```

### 2. Create User (Sign Up)
```
POST http://localhost:5000/api/auth/signup
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "9876543210"
}
```

### 3. Login
```
POST http://localhost:5000/api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response will include JWT token to store in localStorage.

### 4. Get All Events
```
GET http://localhost:5000/api/events
```

### 5. Create Event (Authenticated)
```
POST http://localhost:5000/api/events
Authorization: Bearer {token}
{
  "title": "Tech Workshop",
  "description": "Learn Web Development",
  "category": "Tech Workshop",
  "date": "2026-05-15",
  "startTime": "10:00",
  "endTime": "12:00",
  "location": "Room 101",
  "capacity": 50
}
```

---

## 🌐 API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | User login |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | No | Logout |
| GET | `/api/events` | No | Get all events |
| GET | `/api/events/:id` | No | Get specific event |
| POST | `/api/events` | Yes | Create event |
| PUT | `/api/events/:id` | Yes | Update event |
| DELETE | `/api/events/:id` | Yes | Delete event |
| POST | `/api/registrations/:eventId` | Yes | Register for event |
| GET | `/api/registrations/user/my-events` | Yes | Get user's events |
| DELETE | `/api/registrations/:eventId` | Yes | Cancel registration |

---

## 🛠️ Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### MongoDB Connection Error
- Check MongoDB is running: `mongod`
- Or use MongoDB Atlas cloud connection

### CORS Error
- Backend is running on `localhost:5000`
- Frontend should call `http://localhost:5000/api`
- Check api-client.js `API_URL` setting

### "Invalid token" error
- Clear localStorage: `localStorage.clear()`
- Login again

---

## 📦 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (student/organizer/admin),
  eventsRegistered: [EventId],
  eventsOrganized: [EventId],
  createdAt: Date
}
```

### Events Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  date: Date,
  startTime: String,
  endTime: String,
  location: String,
  capacity: Number,
  registeredCount: Number,
  organizer: UserId,
  image: String,
  registeredParticipants: [UserId],
  status: String (upcoming/ongoing/completed/cancelled),
  createdAt: Date
}
```

---

## 🎯 Next Steps

1. ✅ Set up backend
2. ✅ Configure MongoDB
3. ✅ Update frontend files
4. ✅ Test API endpoints
5. 📝 Add more features:
   - Event search and filtering
   - User profile page
   - Notification system
   - Payment integration
   - Event reviews and ratings

---

**Questions or Issues?** Check the error logs in terminal and verify all URLs match your setup.
