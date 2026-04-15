# 🚀 Deployment Guide - College Events Portal

This guide will help you deploy your College Events Portal to the internet using Render and MongoDB Atlas.

---

## **Option 1: Render + MongoDB Atlas (RECOMMENDED)**

### **Step 1: Prepare Your Code for Deployment**

1. Ensure you have a GitHub account and your code is pushed there
2. Create `.env.example` file (already done ✅)
3. Create `.gitignore` file (already done ✅)
4. Test locally: `npm start` in backend folder works without errors

### **Step 2: Set Up MongoDB Atlas (Free Database)**

1. Go to [mongodb.com/cloud](https://mongodb.com/cloud)
2. Click "Sign Up" and create account
3. Create a new project
4. Click "Build a Database" → Choose **M0 Free** tier
5. Select AWS and your preferred region
6. Create cluster (takes ~2 minutes)
7. Go to "Security" → "Database Access"
   - Add database user (username/password)
8. Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow access from anywhere" (0.0.0.0/0)
9. Go to "Databases" → Your cluster
   - Click "Connect" → "Drivers"
   - Copy connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/college_events`)
10. Replace `<password>` with your database user password

### **Step 3: Deploy Backend on Render**

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Fill in these details:
   - **Name**: `college-events-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Click "Advanced" and add environment variables:
   - `MONGO_URI`: Paste your MongoDB connection string
   - `JWT_SECRET`: Create a random secret (e.g., `your-super-secret-key-12345`)
   - `NODE_ENV`: `production`
7. Click "Create Web Service"
8. Wait for deployment (~3-5 minutes)
9. Copy your backend URL (e.g., `https://college-events-backend.onrender.com`)

### **Step 4: Update Frontend API Configuration**

In your frontend JavaScript files, update the API base URL:

**In `api-client.js` or your API utility file, change:**

```javascript
// OLD
const API_BASE_URL = 'http://localhost:5000/api';

// NEW
const API_BASE_URL = 'https://college-events-backend.onrender.com/api';
```

### **Step 5: Deploy Frontend on Render (Static)**

1. Back on Render dashboard, click "New" → "Static Site"
2. Connect your GitHub repository
3. Fill in:
   - **Name**: `college-events-frontend`
   - **Build Command**: (leave empty - no build needed for vanilla JS)
   - **Publish Directory**: `Minor Project`
4. Click "Create Static Site"
5. Wait for deployment
6. Your site is live! 🎉

---

## **Option 2: Vercel (Easiest for Frontend)**

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select `Minor Project` as root directory
4. Deploy

---

## **Option 3: Netlify**

1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub
3. Deploy `Minor Project` folder

---

## **Testing After Deployment**

1. Open your deployed frontend URL
2. Try these actions:
   - ✅ Sign up with new user
   - ✅ Login
   - ✅ Create an event
   - ✅ View all events
   - ✅ Register for an event

---

## **Troubleshooting**

### **"Backend not responding" error**
- Check MongoDB Atlas connection string in Render environment variables
- Ensure MongoDB IP whitelist includes `0.0.0.0/0`
- Check Render backend logs

### **"CORS error"**
- Your backend has CORS configured, should work fine
- If issues persist, check backend/server.js CORS settings

### **Frontend can't find backend**
- Make sure you updated `api-client.js` with correct backend URL
- Check browser console (F12) for error messages

---

## **Cost Breakdown**

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Render Backend | 750 hours/month | $7/month |
| Render Frontend | Unlimited free | N/A |
| MongoDB Atlas | 512MB storage | Pay as you grow |
| **TOTAL** | **Free** | **~$7/month** |

---

## **Environment Variables Reference**

### **Backend (.env file)**
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/college_events
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=production
```

### **Frontend**
Update `API_BASE_URL` in your JS files to match your deployed backend URL.

---

## **Next Steps**

1. ✅ Deploy backend & database
2. ✅ Deploy frontend
3. ✅ Test all features
4. ✅ Monitor logs if issues arise
5. 🎉 Share your link with friends!

---

**Questions?** Check Render & MongoDB Atlas documentation or test locally first!
