// Patient Portal JavaScript

const API_URL = 'http://localhost:5000/api';

// ==================== TAB SWITCHING ====================
function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Update button states
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Load data when switching to queue-display tab
    if (tabName === 'queue-display') {
        refreshQueueDisplay();
    }
}

// ==================== REGISTRATION ====================
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const department = document.getElementById('department').value;
    const appointment_time = document.getElementById('appointment_time').value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                phone: phone,
                department: department,
                appointment_time: appointment_time
            })
        });

        const data = await response.json();

        const messageBox = document.getElementById('registrationMessage');

        if (response.ok) {
            messageBox.className = 'message-box success';
            messageBox.innerHTML = `
                <strong>✅ Registration Successful!</strong><br>
                Your Patient ID: <strong>${data.patient_id}</strong><br>
                Queue Position: <strong>${data.queue_position}</strong><br>
                Please save your Patient ID for tracking your queue.
            `;

            // Clear form
            document.getElementById('registrationForm').reset();

            // Auto-switch to track tab after 2 seconds
            setTimeout(() => {
                document.querySelector('[onclick="showTab(\'track\')"]').click();
                document.getElementById('patientId').value = data.patient_id;
                trackQueue();
            }, 2000);
        } else {
            messageBox.className = 'message-box error';
            messageBox.innerHTML = `<strong>❌ Error:</strong> ${data.error}`;
        }
    } catch (error) {
        const messageBox = document.getElementById('registrationMessage');
        messageBox.className = 'message-box error';
        messageBox.innerHTML = `<strong>❌ Error:</strong> Failed to connect to server. Make sure the backend is running.`;
        console.error('Error:', error);
    }
});

// ==================== TRACK QUEUE ====================
async function trackQueue() {
    const patientId = document.getElementById('patientId').value;

    if (!patientId) {
        showMessage('trackMessage', 'Please enter your Patient ID', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/queue/position/${patientId}`);
        const data = await response.json();

        if (response.ok) {
            // Show queue info
            document.getElementById('queueInfo').classList.remove('hidden');

            // Update info
            document.getElementById('trackName').textContent = data.name;
            document.getElementById('trackDept').textContent = data.department;
            document.getElementById('trackTime').textContent = data.appointment_time;
            document.getElementById('trackPosition').textContent = data.queue_position;

            // Update status badge
            const statusBadge = document.getElementById('trackStatus');
            statusBadge.textContent = data.status;
            statusBadge.className = 'status-badge ' + data.status.toLowerCase();

            // Calculate estimated wait time (2-3 minutes per patient)
            const waitTime = data.queue_position * 3;
            document.getElementById('waitEstimate').textContent = `Approximately ${waitTime} minutes`;

            showMessage('trackMessage', '✅ Queue information updated', 'success');
        } else {
            document.getElementById('queueInfo').classList.add('hidden');
            showMessage('trackMessage', 'Patient not found. Please check your ID', 'error');
        }
    } catch (error) {
        showMessage('trackMessage', 'Error connecting to server', 'error');
        console.error('Error:', error);
    }
}

// ==================== QUEUE DISPLAY ====================
async function refreshQueueDisplay() {
    try {
        const response = await fetch(`${API_URL}/queue/display`);
        const data = await response.json();

        const queueList = document.getElementById('queueList');
        queueList.innerHTML = '';

        if (data.queue.length === 0) {
            queueList.innerHTML = '<p class="loading">No patients in queue</p>';
            return;
        }

        data.queue.forEach(patient => {
            const item = document.createElement('div');
            item.className = 'queue-item';

            const statusColor = patient.status === 'Called' ? 'called' : 'waiting';

            item.innerHTML = `
                <div style="display: flex; align-items: center; width: 100%; gap: 20px;">
                    <div class="queue-item-position" style="background-color: ${patient.status === 'Called' ? '#673AB7' : '#2196F3'};">
                        ${patient.position}
                    </div>
                    <div class="queue-item-details" style="flex: 1;">
                        <div class="queue-item-detail">
                            <strong>Name:</strong>
                            <span>${patient.name}</span>
                        </div>
                        <div class="queue-item-detail">
                            <strong>Department:</strong>
                            <span>${patient.department}</span>
                        </div>
                        <div class="queue-item-detail">
                            <strong>Status:</strong>
                            <span class="status-badge-sm ${statusColor}">${patient.status}</span>
                        </div>
                    </div>
                </div>
            `;

            queueList.appendChild(item);
        });

        // Auto-refresh every 5 seconds
        setTimeout(refreshQueueDisplay, 5000);

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('queueList').innerHTML = '<p class="loading" style="color: red;">Error loading queue</p>';
    }
}

// ==================== UTILITY FUNCTIONS ====================
function showMessage(elementId, message, type) {
    const messageBox = document.getElementById(elementId);
    messageBox.className = `message-box ${type}`;
    messageBox.textContent = message;
}

// Load data on page load
window.addEventListener('load', () => {
    console.log('Patient Portal loaded');
});
