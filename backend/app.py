"""
Hospital Queue Management System - Backend API
Flask-based REST API for managing patient queue
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from datetime import datetime
import sqlite3
import json
import os

# Set up paths for serving frontend files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)  # Enable Cross-Origin Requests for frontend

# Database configuration
DATABASE = 'hospital_queue.db'

def get_db():
    """Connect to database"""
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    """Initialize database with tables"""
    db = get_db()
    cursor = db.cursor()
    
    # Patients table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            department TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'Waiting'
        )
    ''')
    
    # Queue table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            queue_position INTEGER NOT NULL,
            entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            served_time TIMESTAMP,
            status TEXT DEFAULT 'Waiting',
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    ''')
    
    db.commit()
    db.close()

# ==================== PATIENT API ENDPOINTS ====================

@app.route('/api/register', methods=['POST'])
def register_patient():
    """Register a new patient"""
    try:
        data = request.get_json()
        
        # Validate input
        if not all(k in data for k in ['name', 'phone', 'department', 'appointment_time']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Insert patient
        cursor.execute('''
            INSERT INTO patients (name, phone, department, appointment_time, status)
            VALUES (?, ?, ?, ?, 'Waiting')
        ''', (data['name'], data['phone'], data['department'], data['appointment_time']))
        
        patient_id = cursor.lastrowid
        
        # Get current queue count
        cursor.execute('SELECT MAX(queue_position) FROM queue')
        max_position = cursor.fetchone()[0]
        queue_position = (max_position or 0) + 1
        
        # Add to queue
        cursor.execute('''
            INSERT INTO queue (patient_id, queue_position, status)
            VALUES (?, ?, 'Waiting')
        ''', (patient_id, queue_position))
        
        db.commit()
        db.close()
        
        return jsonify({
            'success': True,
            'message': 'Patient registered successfully',
            'patient_id': patient_id,
            'queue_position': queue_position
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/queue/position/<int:patient_id>', methods=['GET'])
def get_queue_position(patient_id):
    """Get patient's current queue position"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Get patient and queue info
        cursor.execute('''
            SELECT p.id, p.name, p.department, p.appointment_time, 
                   q.queue_position, q.status, q.entry_time
            FROM patients p
            JOIN queue q ON p.id = q.patient_id
            WHERE p.id = ?
        ''', (patient_id,))
        
        row = cursor.fetchone()
        db.close()
        
        if not row:
            return jsonify({'error': 'Patient not found'}), 404
        
        return jsonify({
            'patient_id': row[0],
            'name': row[1],
            'department': row[2],
            'appointment_time': row[3],
            'queue_position': row[4],
            'status': row[5],
            'entry_time': row[6]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/queue/display', methods=['GET'])
def get_queue_display():
    """Get current queue display (for waiting room display)"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Get all waiting patients sorted by queue position
        cursor.execute('''
            SELECT p.id, p.name, q.queue_position, q.status, p.department
            FROM patients p
            JOIN queue q ON p.id = q.patient_id
            WHERE q.status IN ('Waiting', 'Called')
            ORDER BY q.queue_position ASC
            LIMIT 20
        ''')
        
        rows = cursor.fetchall()
        db.close()
        
        queue_data = []
        for row in rows:
            queue_data.append({
                'patient_id': row[0],
                'name': row[1],
                'position': row[2],
                'status': row[3],
                'department': row[4]
            })
        
        return jsonify({
            'queue': queue_data,
            'total_waiting': len(queue_data)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ADMIN API ENDPOINTS ====================

@app.route('/api/admin/all-patients', methods=['GET'])
def get_all_patients():
    """Get all patients (Admin)"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('''
            SELECT p.id, p.name, p.phone, p.department, p.appointment_time,
                   q.queue_position, q.status, p.registration_time
            FROM patients p
            LEFT JOIN queue q ON p.id = q.patient_id
            ORDER BY q.queue_position ASC
        ''')
        
        rows = cursor.fetchall()
        db.close()
        
        patients_data = []
        for row in rows:
            patients_data.append({
                'patient_id': row[0],
                'name': row[1],
                'phone': row[2],
                'department': row[3],
                'appointment_time': row[4],
                'queue_position': row[5],
                'status': row[6],
                'registration_time': row[7]
            })
        
        return jsonify({'patients': patients_data}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/call-next', methods=['POST'])
def call_next_patient():
    """Call the next patient in queue (Admin)"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Get the first waiting patient
        cursor.execute('''
            SELECT patient_id, queue_position
            FROM queue
            WHERE status = 'Waiting'
            ORDER BY queue_position ASC
            LIMIT 1
        ''')
        
        row = cursor.fetchone()
        
        if not row:
            db.close()
            return jsonify({'message': 'No patients waiting'}), 200
        
        patient_id, position = row[0], row[1]
        
        # Update status to Called
        cursor.execute('''
            UPDATE queue
            SET status = 'Called'
            WHERE patient_id = ?
        ''', (patient_id,))
        
        # Get patient details
        cursor.execute('SELECT name, department FROM patients WHERE id = ?', (patient_id,))
        patient_row = cursor.fetchone()
        
        db.commit()
        db.close()
        
        return jsonify({
            'success': True,
            'patient_id': patient_id,
            'queue_position': position,
            'name': patient_row[0],
            'department': patient_row[1],
            'message': f'{patient_row[0]} called to {patient_row[1]}'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/complete-service/<int:patient_id>', methods=['PUT'])
def complete_service(patient_id):
    """Mark patient as served (Admin)"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('''
            UPDATE queue
            SET status = 'Served', served_time = CURRENT_TIMESTAMP
            WHERE patient_id = ?
        ''', (patient_id,))
        
        cursor.execute('''
            UPDATE patients
            SET status = 'Served'
            WHERE id = ?
        ''', (patient_id,))
        
        db.commit()
        db.close()
        
        return jsonify({'success': True, 'message': 'Patient marked as served'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/skip-patient/<int:patient_id>', methods=['PUT'])
def skip_patient(patient_id):
    """Skip a patient in queue (Admin)"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('''
            UPDATE queue
            SET status = 'Skipped'
            WHERE patient_id = ?
        ''', (patient_id,))
        
        db.commit()
        db.close()
        
        return jsonify({'success': True, 'message': 'Patient skipped'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/queue-stats', methods=['GET'])
def get_queue_stats():
    """Get queue statistics (Admin)"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM queue WHERE status = "Waiting"')
        waiting = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM queue WHERE status = "Called"')
        called = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM queue WHERE status = "Served"')
        served = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM patients')
        total_patients = cursor.fetchone()[0]
        
        db.close()
        
        return jsonify({
            'waiting': waiting,
            'called': called,
            'served': served,
            'total_patients': total_patients
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'API is running'}), 200

# ==================== FRONTEND ROUTES ====================

@app.route('/', methods=['GET'])
def index():
    """Serve the patient page as default"""
    return send_from_directory(FRONTEND_DIR, 'patient.html')

@app.route('/patient', methods=['GET'])
def patient_page():
    """Serve patient page"""
    return send_from_directory(FRONTEND_DIR, 'patient.html')

@app.route('/admin', methods=['GET'])
def admin_page():
    """Serve admin page"""
    return send_from_directory(FRONTEND_DIR, 'admin.html')

# Initialize database and run app
if __name__ == '__main__':
    init_db()
    print("Database initialized!")
    print("Starting Hospital Queue Management API...")
    print("API running on http://localhost:5000")
    app.run(debug=True, port=5000)
