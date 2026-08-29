# 🏥 Hospital Queue Management System

A complete full-stack web application for managing patient queues in a hospital. The system allows patients to register and track their queue position in real-time, while administrators can manage and monitor the queue from a dedicated dashboard.

## 📋 Features

### Patient Portal
- **Patient Registration**: Register new patients with name, phone, department, and appointment time
- **Queue Tracking**: Real-time tracking of queue position with estimated wait time
- **Live Queue Display**: View all current patients in the queue with their status
- **Queue Position Updates**: Automatic status updates (Waiting → Called → Served)

### Admin Dashboard
- **Queue Statistics**: Real-time stats showing waiting, called, and served patients
- **Queue Control**: Call next patient, mark as served, or skip patient
- **Patient Management**: View all registered patients and their details
- **Auto-Refresh**: Dashboard updates automatically every 10 seconds

### Backend API
- **RESTful API**: Complete REST API for all operations
- **Patient Management**: Register, track, and manage patients
- **Queue Operations**: Call next, mark served, skip, and display queue
- **Admin Statistics**: Get real-time queue statistics
- **SQLite Database**: Persistent data storage

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Python 3.x, Flask, Flask-CORS |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Database** | SQLite3 |
| **Architecture** | RESTful API |

---

## 📁 Project Structure

```
hospital_queue_system/
├── backend/
│   ├── app.py                      # Main Flask application
│   └── hospital_queue.db           # SQLite database (auto-created)
│
├── frontend/
│   ├── patient.html                # Patient portal interface
│   ├── admin.html                  # Admin dashboard interface
│   ├── styles.css                  # Styling for both interfaces
│   ├── patient-script.js           # Patient portal logic
│   └── admin-script.js             # Admin dashboard logic
│
└── requirements.txt                # Python dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.6 or higher
- pip (Python package manager)
- A web browser (Chrome, Firefox, Safari, Edge, etc.)
- No database installation needed (SQLite is built-in)

### Installation

#### 1. Install Python Dependencies
```bash
cd hospital_queue_system
pip install -r requirements.txt
```

#### 2. Start the Backend Server
```bash
cd backend
python app.py
```

You should see:
```
Database initialized!
Starting Hospital Queue Management API...
API running on http://localhost:5000
```

#### 3. Open the Frontend

**For Patient Portal:**
- Open `frontend/patient.html` in your web browser
- Or navigate to: `file:///path/to/hospital_queue_system/frontend/patient.html`

**For Admin Dashboard:**
- Open `frontend/admin.html` in your web browser
- Or navigate to: `file:///path/to/hospital_queue_system/frontend/admin.html`

---

## 💻 Usage Guide

### Patient Portal

#### Step 1: Register
1. Click on the **"Register"** tab
2. Fill in your details:
   - Full Name
   - Phone Number
   - Department (select from dropdown)
   - Appointment Time
3. Click **"Register & Get Queue Number"**
4. Your Patient ID and Queue Position will be displayed

#### Step 2: Track Your Queue
1. Click on the **"Track Queue"** tab
2. Enter your **Patient ID** (from registration)
3. Click **"Track"** to see:
   - Your current queue position
   - Status (Waiting/Called/Served)
   - Estimated wait time
   - Your appointment details

#### Step 3: View Current Queue
1. Click on the **"Queue Display"** tab
2. View all patients currently in the queue
3. The queue refreshes automatically every 5 seconds

---

### Admin Dashboard

#### Dashboard Tab
- View real-time statistics:
  - **Waiting**: Number of patients waiting
  - **Called**: Number of patients being served
  - **Served**: Total patients served
  - **Total Patients**: All registered patients
- See the next patient to call
- **Call Next Patient** button to call the next waiting patient

#### Queue Control Tab
- View the next 10 patients in queue
- **Actions**:
  - **Served**: Mark patient as served
  - **Skip**: Skip patient to back of queue
- Real-time status display (Waiting/Called/Served)

#### All Patients Tab
- View complete list of all registered patients
- See details:
  - Patient ID
  - Name
  - Phone
  - Department
  - Queue Position
  - Status
  - Appointment Time

---

## 🔌 API Endpoints

### Patient Endpoints

#### Register Patient
```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "1234567890",
  "department": "Cardiology",
  "appointment_time": "14:30"
}

Response:
{
  "success": true,
  "patient_id": 1,
  "queue_position": 1
}
```

#### Get Queue Position
```http
GET /api/queue/position/{patient_id}

Response:
{
  "patient_id": 1,
  "name": "John Doe",
  "department": "Cardiology",
  "appointment_time": "14:30",
  "queue_position": 1,
  "status": "Waiting"
}
```

#### Get Queue Display
```http
GET /api/queue/display

Response:
{
  "queue": [
    {
      "patient_id": 1,
      "name": "John Doe",
      "position": 1,
      "status": "Waiting",
      "department": "Cardiology"
    }
  ],
  "total_waiting": 5
}
```

### Admin Endpoints

#### Get All Patients
```http
GET /api/admin/all-patients

Response:
{
  "patients": [
    {
      "patient_id": 1,
      "name": "John Doe",
      "phone": "1234567890",
      "department": "Cardiology",
      "queue_position": 1,
      "status": "Waiting"
    }
  ]
}
```

#### Call Next Patient
```http
POST /api/admin/call-next

Response:
{
  "success": true,
  "patient_id": 1,
  "queue_position": 1,
  "name": "John Doe",
  "department": "Cardiology"
}
```

#### Complete Service
```http
PUT /api/admin/complete-service/{patient_id}

Response:
{
  "success": true,
  "message": "Patient marked as served"
}
```

#### Skip Patient
```http
PUT /api/admin/skip-patient/{patient_id}

Response:
{
  "success": true,
  "message": "Patient skipped"
}
```

#### Queue Statistics
```http
GET /api/admin/queue-stats

Response:
{
  "waiting": 5,
  "called": 1,
  "served": 10,
  "total_patients": 16
}
```

---

## 📊 Database Schema

### Patients Table
```sql
CREATE TABLE patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    department TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Waiting'
)
```

### Queue Table
```sql
CREATE TABLE queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    queue_position INTEGER NOT NULL,
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    served_time TIMESTAMP,
    status TEXT DEFAULT 'Waiting',
    FOREIGN KEY (patient_id) REFERENCES patients(id)
)
```

---

## 🎨 Features Showcase

### Patient Experience
- ✅ Simple registration form
- ✅ Real-time queue position tracking
- ✅ Estimated wait time calculation
- ✅ Live queue display board
- ✅ Mobile-responsive design

### Admin Experience
- ✅ Dashboard with key metrics
- ✅ Queue management controls
- ✅ Patient information management
- ✅ Real-time updates
- ✅ Easy-to-use interface

### System
- ✅ No database installation required (SQLite)
- ✅ REST API architecture
- ✅ CORS enabled for easy deployment
- ✅ Error handling and validation
- ✅ Automatic database initialization

---

## 🔒 Security Notes

This is a demonstration project. For production use, implement:
- Authentication and authorization
- Input validation and sanitization
- HTTPS/SSL encryption
- Database encryption
- Rate limiting
- Admin password protection
- Audit logging

---

## 🐛 Troubleshooting

### "Cannot connect to server" error in browser
- Ensure backend is running: `python app.py` in the backend folder
- Check that port 5000 is not blocked
- Verify CORS is enabled (it should be in app.py)

### Database file not found
- The database (`hospital_queue.db`) is created automatically on first run
- If missing, delete any existing database and restart the backend

### API errors with 404
- Check patient ID exists in the database
- Verify API endpoint URLs in JavaScript files

### Port 5000 already in use
- Change the port in `app.py`: `app.run(debug=True, port=5001)`
- Update API_URL in JavaScript files to match

---

## 📈 Future Enhancements

- [ ] User authentication and login
- [ ] Appointment scheduling
- [ ] SMS/Email notifications
- [ ] Multiple queue management (different departments)
- [ ] Patient history and records
- [ ] Performance analytics and reports
- [ ] Doctor/staff management
- [ ] Payment integration
- [ ] Mobile app version
- [ ] Voice announcements in waiting room

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

Hospital Queue Management System
Created for healthcare management demonstration

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review API endpoints documentation
3. Check browser console for JavaScript errors (F12)
4. Check terminal output for backend errors

---

## 🎉 Quick Start Checklist

- [ ] Install Python dependencies: `pip install -r requirements.txt`
- [ ] Start backend: `python app.py`
- [ ] Open patient portal: `patient.html`
- [ ] Open admin dashboard: `admin.html`
- [ ] Register a test patient
- [ ] Track queue position
- [ ] Call next patient from admin panel
- [ ] Test all features

**Enjoy managing your hospital queue!** 🏥✨
