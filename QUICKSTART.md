# 🚀 Quick Start Guide

Get the Hospital Queue Management System up and running in 5 minutes!

## Step 1: Install Dependencies (1 minute)

```bash
cd hospital_queue_system
pip install -r requirements.txt
```

Expected output:
```
Successfully installed Flask-2.3.0 Flask-CORS-4.0.0
```

## Step 2: Start the Backend (30 seconds)

```bash
cd backend
python app.py
```

Expected output:
```
Database initialized!
Starting Hospital Queue Management API...
API running on http://localhost:5000
```

**Keep this terminal running!** The backend needs to stay active.

## Step 3: Open Patient Portal (30 seconds)

Open the patient interface in your browser:

**Option A: Click the file**
- Navigate to: `frontend/patient.html`
- Double-click to open in your default browser

**Option B: Manual URL**
- Copy the full path to `patient.html`
- Open your browser and paste: `file:///C:/Users/Dipannita/OneDrive/Desktop/python_project/hospital_queue_system/frontend/patient.html`

## Step 4: Open Admin Dashboard (30 seconds)

In another browser tab or window, open:
- Navigate to: `frontend/admin.html`
- Or use file URL: `file:///...hospital_queue_system/frontend/admin.html`

**Now you have both interfaces open!** 🎉

---

## 📝 Test Workflow

### Test Patient Portal:
1. **Register a Patient**
   - Name: John Doe
   - Phone: 1234567890
   - Department: Cardiology
   - Time: 14:30
   - Click "Register"
   - Save your Patient ID

2. **Track Your Queue**
   - Go to "Track Queue" tab
   - Enter your Patient ID
   - Click "Track"
   - See your position and status

3. **View Queue Display**
   - Go to "Queue Display" tab
   - See all patients in the queue
   - Refreshes automatically every 5 seconds

### Test Admin Dashboard:
1. **View Dashboard**
   - See statistics: Waiting, Called, Served patients
   - View next patient to call
   - Stats auto-refresh every 10 seconds

2. **Call Next Patient**
   - Click "Call Next Patient" button
   - Patient status changes to "Called" in patient portal
   - Next patient becomes the new first in queue

3. **Queue Control**
   - Go to "Queue Control" tab
   - See next 10 patients
   - Click "Served" to mark patient as complete
   - Click "Skip" to move patient to back of queue

4. **All Patients**
   - Go to "All Patients" tab
   - See complete patient database
   - All registration details visible

---

## 🎯 Key Features to Try

✅ **Real-time Updates**: Open both patient portal and admin dashboard side-by-side
- Register a patient in patient portal
- Watch it appear in admin dashboard instantly

✅ **Queue Tracking**: Track the same patient from different tabs
- See position update as admin calls next patient

✅ **Live Queue Display**: Leave queue display on a waiting room TV
- Patients can see who's being called
- Updates automatically every 5 seconds

✅ **Admin Control**: Manage the entire queue from one place
- Call patients, mark as served, skip patients
- See real-time statistics

---

## 📱 Mobile Testing

The system is mobile-responsive! Test on:
- Laptop/Desktop (optimal)
- Tablet (responsive layout)
- Mobile phone (simplified view)

---

## 🔧 Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| "Cannot connect to server" | Make sure backend is running: `python app.py` |
| "Port 5000 already in use" | Change port in app.py, update API_URL in JavaScript |
| "File not found" | Use full path: `file:///C:/Users/Dipannita/...` |
| "Database error" | Delete .db file, restart backend to recreate |
| "Blank page" | Check browser console (F12) for errors |

---

## 📊 API Testing (Optional)

Want to test the API directly? Use curl or Postman:

```bash
# Register a patient
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Jane Smith",
    "phone":"9876543210",
    "department":"Orthopedics",
    "appointment_time":"15:30"
  }'

# Get patient queue position
curl http://localhost:5000/api/queue/position/1

# Get queue display
curl http://localhost:5000/api/queue/display

# Get statistics
curl http://localhost:5000/api/admin/queue-stats

# Call next patient
curl -X POST http://localhost:5000/api/admin/call-next
```

---

## 🎓 What You're Learning

This full-stack project demonstrates:
- **Backend**: REST API with Flask, Database operations, CORS
- **Frontend**: HTML/CSS/JavaScript, Fetch API, Real-time updates
- **Database**: SQLite3, SQL queries, Relationships
- **Web Development**: Client-Server architecture, JSON, HTTP requests
- **UI/UX**: Responsive design, User experience, Admin interfaces

---

## 📚 Next Steps

After testing, you can:
1. **Deploy to GitHub** - Push this to your repository
2. **Add Features** - Implement authentication, notifications, etc.
3. **Host Online** - Deploy to Heroku, AWS, or other cloud services
4. **Mobile App** - Create a mobile app using Flutter/React Native
5. **Expand** - Add SMS notifications, email confirmations, etc.

---

## ✨ You're All Set!

Your Hospital Queue Management System is ready to use! 

**Questions?** Check the full README.md for detailed documentation.

**Happy coding!** 🚀🏥
