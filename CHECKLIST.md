# 🎯 College Events Portal - Step-by-Step Integration Checklist

## ✅ PHASE 1: BACKEND SETUP (30 minutes)

### Step 1: Install Node.js Packages
- [ ] Open terminal in `backend` folder
- [ ] Run: `npm install`
- [ ] Verify: package-lock.json created
- [ ] Check: All packages in node_modules

### Step 2: Configure Database
- [ ] Open `.env` file in backend folder
- [ ] Option A (Local): Keep MongoDB URI as is (requires MongoDB running)
- [ ] Option B (Cloud): Replace with MongoDB Atlas connection string
  - Get connection string from: https://www.mongodb.com/cloud/atlas
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/college_events`
- [ ] Save .env file

### Step 3: Start MongoDB (if using local)
- [ ] Open new terminal
- [ ] Run: `mongod` (MongoDB server)
- [ ] Verify: "waiting for connections on port 27017"
- [ ] Keep this terminal open

### Step 4: Start Backend Server
- [ ] In backend terminal, run: `npm start`
- [ ] Verify output:
  ```
  ✓ MongoDB Connected
  🚀 Server running on http://localhost:5000
  ```
- [ ] Keep this terminal open

### Step 5: Test Backend Health
- [ ] Open browser: http://localhost:5000/api/health
- [ ] Expected: `{ "status": "Backend is running!" }`
- [ ] ✅ Backend is working!

---

## ✅ PHASE 2: FRONTEND FILE COPYING (10 minutes)

### Step 1: Copy Backend Integration Utility
- [ ] File: [api-client.js](Minor%20Project/api-client.js)
- [ ] Location: `Minor Project/api-client.js`
- [ ] Action: Already created, no action needed

### Step 2: Copy Updated JavaScript Files
- [ ] [Login Page-UPDATED.js](Minor%20Project/Login%20Page-UPDATED.js) ✓ Ready
- [ ] [Sign Up-UPDATED.js](Minor%20Project/Sign%20Up-UPDATED.js) ✓ Ready
- [ ] [Home Page-UPDATED.js](Minor%20Project/Home%20Page-UPDATED.js) ✓ Ready
- [ ] [Event Page-UPDATED.js](Minor%20Project/Event%20Page-UPDATED.js) ✓ Ready

---

## ✅ PHASE 3: HTML FILE UPDATES (20 minutes)

### Step 1: Update Login Page.html
- [ ] Open: `Minor Project/Login Page.html`
- [ ] Reference: [LOGIN_PAGE_EXAMPLE.html](Minor%20Project/LOGIN_PAGE_EXAMPLE.html)
- [ ] Changes to make:
  - [ ] Add `id="email"` to email input
  - [ ] Add `id="password"` to password input
  - [ ] Change login button `onclick="login()"`
  - [ ] Add at end of `<body>`:
    ```html
    <script src="api-client.js"></script>
    <script src="Login Page-UPDATED.js"></script>
    ```
- [ ] Save file

### Step 2: Update Sign Up.html
- [ ] Open: `Minor Project/Sign Up.html`
- [ ] Reference: [SIGNUP_PAGE_EXAMPLE.html](Minor%20Project/SIGNUP_PAGE_EXAMPLE.html)
- [ ] Changes to make:
  - [ ] Add `id="fullName"` to full name input
  - [ ] Add `id="email"` to email input
  - [ ] Add `id="password"` to password input
  - [ ] Add `id="confirmPassword"` to confirm password input
  - [ ] Add `id="phone"` to phone input (optional)
  - [ ] Change signup button `onclick="signup()"`
  - [ ] Add at end of `<body>`:
    ```html
    <script src="api-client.js"></script>
    <script src="Sign Up-UPDATED.js"></script>
    ```
- [ ] Save file

### Step 3: Update Home Page.html
- [ ] Open: `Minor Project/Home Page.html`
- [ ] Reference: [HOME_PAGE_EXAMPLE.html](Minor%20Project/HOME_PAGE_EXAMPLE.html)
- [ ] Changes to make:
  - [ ] Find login button, add `class="login-btn"`
  - [ ] Add email subscription input: `id="email"`
  - [ ] Create/Update modal section with:
    - [ ] `id="organizeModal"`
    - [ ] Input: `id="eventTitle"`
    - [ ] Textarea: `id="eventDescription"`
    - [ ] Select: `id="eventCategory"`
    - [ ] Input: `id="eventDate"` (type="date")
    - [ ] Input: `id="eventStartTime"` (type="time")
    - [ ] Input: `id="eventEndTime"` (type="time")
    - [ ] Input: `id="eventLocation"`
    - [ ] Input: `id="eventCapacity"` (type="number")
  - [ ] Add at end of `<body>`:
    ```html
    <script src="api-client.js"></script>
    <script src="Home Page-UPDATED.js"></script>
    ```
- [ ] Save file

### Step 4: Update Event Page.html
- [ ] Open: `Minor Project/Event Page.html`
- [ ] Reference: [EVENT_PAGE_EXAMPLE.html](Minor%20Project/EVENT_PAGE_EXAMPLE.html)
- [ ] Changes to make:
  - [ ] Create events container: `<div id="eventsContainer" class="events-grid">`
  - [ ] Add filter buttons with `onclick="filterEvents('category')"`
  - [ ] Add CSS from example (optional but recommended)
  - [ ] Add at end of `<body>`:
    ```html
    <script src="api-client.js"></script>
    <script src="Event Page-UPDATED.js"></script>
    ```
- [ ] Save file

---

## ✅ PHASE 4: START FRONTEND SERVER (5 minutes)

### Option A: Using VS Code Live Server Extension
- [ ] Install: "Live Server" extension from VS Code marketplace
- [ ] Right-click: `Home Page.html`
- [ ] Select: "Open with Live Server"
- [ ] Browser opens automatically at http://localhost:5500

### Option B: Using Python HTTP Server
- [ ] Open terminal in `Minor Project` folder
- [ ] Run: `python -m http.server 3000`
- [ ] Open browser: http://localhost:3000
- [ ] Click: `Home Page.html`

### Option C: Using Node.js http-server
- [ ] Install globally: `npm install -g http-server`
- [ ] Navigate to: `Minor Project` folder
- [ ] Run: `http-server -p 3000`
- [ ] Open browser: http://localhost:3000

---

## ✅ PHASE 5: TESTING (15 minutes)

### Test 1: Navigation
- [ ] Open home page
- [ ] Click "Explore Events"
- [ ] Verify events page loads (shows "Loading events...")
- [ ] Click "Login" in navigation
- [ ] Verify login page appears

### Test 2: User Registration
- [ ] Click "Sign Up" link
- [ ] Fill form with:
  - Full Name: `Test User`
  - Email: `test@example.com`
  - Password: `password123`
  - Confirm: `password123`
  - Phone: `9876543210` (optional)
- [ ] Click "Sign Up"
- [ ] Verify success message alert
- [ ] Verify redirected to Home Page
- [ ] Check console (F12) for any errors

### Test 3: User Login
- [ ] Click "Login" (or your name if already logged in)
- [ ] If logged in, click name and "Logout"
- [ ] Fill login form:
  - Email: `test@example.com`
  - Password: `password123`
- [ ] Click "Login"
- [ ] Verify success alert
- [ ] Verify redirected to Home Page

### Test 4: Event Creation
- [ ] While logged in, click "Organize an Event"
- [ ] Fill event form:
  - Title: `Tech Workshop`
  - Description: `Learn web development`
  - Category: `Tech Workshop`
  - Date: `2026-05-15` (future date)
  - Start Time: `10:00`
  - End Time: `12:00`
  - Location: `Lab 101`
  - Capacity: `50`
- [ ] Click "Create Event"
- [ ] Verify success alert
- [ ] Verify modal closes

### Test 5: Event Viewing
- [ ] Go to Events page
- [ ] Verify events load from database
- [ ] Check if created event appears in list
- [ ] Click filter buttons to test filtering
- [ ] "Register" button should appear if logged in

### Test 6: Event Registration
- [ ] On Events page, find an event
- [ ] Click "Register" button
- [ ] Verify success alert
- [ ] Try registering again (should show error)

### Test 7: Logout
- [ ] Click your name in navigation
- [ ] Confirm logout
- [ ] Verify redirected to Home Page
- [ ] Verify "Login" button appears instead of name
- [ ] Try to organize event (should prompt login)

---

## ✅ PHASE 6: VERIFICATION CHECKLIST

### Backend
- [ ] Server running on port 5000
- [ ] MongoDB connected
- [ ] No console errors
- [ ] Health check endpoint works

### Frontend
- [ ] Home page displays correctly
- [ ] Sign Up page works
- [ ] Login page works
- [ ] Events page displays events
- [ ] Event creation modal works
- [ ] All navigation links work
- [ ] Console has no errors

### Database
- [ ] New user created in MongoDB
- [ ] Events stored in database
- [ ] User can register for events
- [ ] Participant count updates

### Integration
- [ ] Frontend communicates with backend
- [ ] JWT tokens stored in localStorage
- [ ] User session persists on page refresh
- [ ] Protected endpoints return 401 when not logged in

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot GET /api/health"
- **Cause:** Backend not running
- **Fix:** Run `npm start` in backend folder

### Issue: CORS Error in Browser
- **Cause:** Backend CORS not enabled
- **Fix:** Backend already has CORS configured, ensure it's running on port 5000

### Issue: "Unexpected token < in JSON"
- **Cause:** Frontend/Backend port mismatch
- **Fix:** Check API_URL in api-client.js is `http://localhost:5000/api`

### Issue: "Email already registered"
- **Cause:** User already exists
- **Fix:** Use different email or use that account to login

### Issue: "Invalid token"
- **Cause:** Token expired or corrupted
- **Fix:** Clear localStorage: `localStorage.clear()` in console, then login again

### Issue: Events not loading
- **Cause:** Backend not running or no events in database
- **Fix:** Create event first, then refresh events page

### Issue: Form fields not recognized
- **Cause:** Missing IDs on form inputs
- **Fix:** Verify all input IDs match what's used in JavaScript files

---

## 📊 SUCCESS INDICATORS

All of these should be ✅ before marking as complete:

- [ ] Backend server starts without errors
- [ ] MongoDB connection established
- [ ] Frontend loads without console errors
- [ ] Sign up creates new user
- [ ] Login returns JWT token
- [ ] Events display from database
- [ ] Can create new events
- [ ] Can register for events
- [ ] Token persists after refresh
- [ ] Logout clears token
- [ ] API endpoints tested with Postman or browser

---

## 📱 NEXT STEPS AFTER COMPLETION

1. **Mobile Responsive**
   - Test on mobile devices
   - Adjust CSS if needed

2. **Add More Pages**
   - My Registrations page
   - User Profile page
   - Event Details page

3. **Enhanced Features**
   - Search events
   - Rating/reviews
   - Event categories
   - User roles (organizer/student/admin)

4. **Deployment**
   - Deploy backend to Heroku/Railway
   - Deploy frontend to Netlify/Vercel
   - Use production database

5. **Security**
   - Change JWT_SECRET in production
   - Use HTTPS
   - Add rate limiting
   - Add input validation

---

## 📞 QUICK REFERENCE

| Folder | File | Purpose |
|--------|------|---------|
| backend/ | server.js | Main backend entry |
| backend/ | package.json | Dependencies |
| backend/ | .env | Configuration |
| backend/models/ | User.js | User schema |
| backend/models/ | Event.js | Event schema |
| backend/routes/ | auth.js | Auth endpoints |
| backend/routes/ | events.js | Events endpoints |
| backend/routes/ | registrations.js | Registration endpoints |
| Minor Project/ | api-client.js | API utility |
| Minor Project/ | *-UPDATED.js | Updated scripts |

---

**Status Check:**
- Start time: ___________
- Phase completion time: ___________
- Testing complete: ___________
- ✅ Ready to deploy: ___________

**Good luck! 🚀**
