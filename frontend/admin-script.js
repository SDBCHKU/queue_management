// Admin Dashboard JavaScript

const API_URL = 'http://localhost:5000/api';

// ==================== TAB SWITCHING ====================
function showAdminTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Update button states
    const buttons = document.querySelectorAll('.nav-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Load appropriate data
    if (tabName === 'dashboard') {
        loadDashboard();
    } else if (tabName === 'queue-control') {
        loadQueueControl();
    } else if (tabName === 'all-patients') {
        loadAllPatients();
    }
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
    try {
        // Load statistics
        const statsResponse = await fetch(`${API_URL}/admin/queue-stats`);
        const stats = await statsResponse.json();

        document.getElementById('waitingCount').textContent = stats.waiting;
        document.getElementById('calledCount').textContent = stats.called;
        document.getElementById('servedCount').textContent = stats.served;
        document.getElementById('totalCount').textContent = stats.total_patients;

        // Load next patient
        loadNextPatient();

        // Load current queue status
        loadCurrentQueueStatus();

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadNextPatient() {
    try {
        const response = await fetch(`${API_URL}/queue/display`);
        const data = await response.json();

        const nextPatientCard = document.getElementById('nextPatientCard');

        if (data.queue.length === 0) {
            nextPatientCard.innerHTML = '<p class="placeholder">No patients waiting...</p>';
            return;
        }

        const firstPatient = data.queue[0];

        if (firstPatient.status === 'Waiting') {
            nextPatientCard.innerHTML = `
                <div class="next-patient-name">${firstPatient.name}</div>
                <div class="next-patient-details">
                    <strong>Department:</strong> ${firstPatient.department}<br>
                    <strong>Position:</strong> ${firstPatient.position}
                </div>
            `;
        } else {
            nextPatientCard.innerHTML = '<p class="placeholder">No patients waiting...</p>';
        }

    } catch (error) {
        console.error('Error loading next patient:', error);
    }
}

async function loadCurrentQueueStatus() {
    try {
        const response = await fetch(`${API_URL}/queue/display`);
        const data = await response.json();

        const statusDiv = document.getElementById('currentQueueStatus');
        
        if (data.queue.length === 0) {
            statusDiv.innerHTML = '<p class="placeholder">No patients in queue</p>';
            return;
        }

        let html = '<table style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="background-color: #f5f5f5;">';
        html += '<th style="padding: 10px; text-align: left; border-bottom: 2px solid #2196F3;">Position</th>';
        html += '<th style="padding: 10px; text-align: left; border-bottom: 2px solid #2196F3;">Patient</th>';
        html += '<th style="padding: 10px; text-align: left; border-bottom: 2px solid #2196F3;">Department</th>';
        html += '<th style="padding: 10px; text-align: left; border-bottom: 2px solid #2196F3;">Status</th>';
        html += '</tr>';

        data.queue.slice(0, 5).forEach(patient => {
            const statusClass = patient.status === 'Called' ? 'called' : 'waiting';
            html += `<tr style="border-bottom: 1px solid #ddd;">`;
            html += `<td style="padding: 10px; font-weight: bold; color: #2196F3;">${patient.position}</td>`;
            html += `<td style="padding: 10px;">${patient.name}</td>`;
            html += `<td style="padding: 10px;">${patient.department}</td>`;
            html += `<td style="padding: 10px;"><span class="status-badge-sm ${statusClass}">${patient.status}</span></td>`;
            html += `</tr>`;
        });

        html += '</table>';
        statusDiv.innerHTML = html;

    } catch (error) {
        console.error('Error loading queue status:', error);
    }
}

async function callNextPatient() {
    try {
        const response = await fetch(`${API_URL}/admin/call-next`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Show notification
            alert(`📢 ${data.name} from ${data.department} has been called!`);
            
            // Reload dashboard
            loadDashboard();
        } else {
            alert(data.message || 'Error calling next patient');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error calling next patient');
    }
}

// ==================== QUEUE CONTROL ====================
async function loadQueueControl() {
    try {
        const response = await fetch(`${API_URL}/queue/display`);
        const data = await response.json();

        const tableBody = document.getElementById('queueControlTable');
        tableBody.innerHTML = '';

        if (data.queue.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="placeholder">No patients in queue</td></tr>';
            return;
        }

        data.queue.slice(0, 10).forEach(patient => {
            const row = document.createElement('tr');
            const statusClass = patient.status === 'Called' ? 'called' : 
                              patient.status === 'Served' ? 'served' : 'waiting';

            row.innerHTML = `
                <td style="font-weight: bold; color: #2196F3;">${patient.position}</td>
                <td>${patient.name}</td>
                <td>${patient.department}</td>
                <td>
                    <span class="status-badge-sm ${statusClass}">${patient.status}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" onclick="markAsServed(${patient.patient_id})" style="padding: 6px 12px; font-size: 0.8em;">Served</button>
                        <button class="btn btn-danger" onclick="skipPatient(${patient.patient_id})" style="padding: 6px 12px; font-size: 0.8em;">Skip</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading queue control:', error);
    }
}

async function markAsServed(patientId) {
    if (!confirm('Mark this patient as served?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/complete-service/${patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Patient marked as served');
            loadQueueControl();
            loadDashboard();
        } else {
            alert('Error marking patient as served');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error marking patient as served');
    }
}

async function skipPatient(patientId) {
    if (!confirm('Skip this patient?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/skip-patient/${patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('⏭️ Patient skipped');
            loadQueueControl();
            loadDashboard();
        } else {
            alert('Error skipping patient');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error skipping patient');
    }
}

// ==================== ALL PATIENTS ====================
async function loadAllPatients() {
    try {
        const response = await fetch(`${API_URL}/admin/all-patients`);
        const data = await response.json();

        const tableBody = document.getElementById('allPatientsTable');
        tableBody.innerHTML = '';

        if (data.patients.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="placeholder">No patients registered</td></tr>';
            return;
        }

        data.patients.forEach(patient => {
            const row = document.createElement('tr');
            const statusClass = patient.status === 'Called' ? 'called' : 
                              patient.status === 'Served' ? 'served' : 'waiting';

            row.innerHTML = `
                <td>${patient.patient_id}</td>
                <td>${patient.name}</td>
                <td>${patient.phone}</td>
                <td>${patient.department}</td>
                <td style="color: #2196F3; font-weight: bold;">${patient.queue_position || '-'}</td>
                <td>
                    <span class="status-badge-sm ${statusClass}">${patient.status || 'Unknown'}</span>
                </td>
                <td>${patient.appointment_time}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

// ==================== AUTO-REFRESH ====================
// Auto-refresh dashboard every 10 seconds
setInterval(() => {
    const activeTab = document.querySelector('.admin-tab.active');
    if (activeTab && activeTab.id === 'dashboard') {
        loadDashboard();
    }
}, 10000);

// ==================== INITIALIZATION ====================
window.addEventListener('load', () => {
    console.log('Admin Dashboard loaded');
    loadDashboard();
});
