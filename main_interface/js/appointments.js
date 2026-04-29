// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let allAppointments = [];

// =========================
// INIT
// =========================
window.addEventListener('DOMContentLoaded', function () {
    loadAppointments();
    setupModal();
});

// =========================
// LOAD appointments from Supabase
// =========================
async function loadAppointments() {
    const { data, error } = await supabase
        .from('AppointmentsTbl')
        .select('*')
        .order('AppointmentDate', { ascending: false });

    if (error) { console.error('Failed to load appointments:', error); return; }

    allAppointments = data || [];
    renderTable(allAppointments);
    updateCards(allAppointments);
}

// =========================
// RENDER table rows
// =========================
function renderTable(appointments) {
    const tbody = document.getElementById('appointmentTableBody');
    tbody.innerHTML = '';

    if (!appointments.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#888;">No appointments found.</td></tr>';
        return;
    }

    appointments.forEach(appt => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appt.Notes || 'N/A'}</td>
            <td>${appt.AppointmentDate || '—'}</td>
            <td>${formatTime(appt.AppointmentTime)}</td>
            <td>${appt.AppointmentType || '—'}</td>
            <td>${appt.Purpose || '—'}</td>
            <td><span class="${getStatusClass(appt.Status)}">${appt.Status || 'Pending'}</span></td>
            <td>
                <button class="btn" onclick="updateStatus(${appt.Appointment_ID}, 'Approved', this)">Approve</button>
                <button class="btn" onclick="updateStatus(${appt.Appointment_ID}, 'Cancelled', this)">Reject</button>
                <button class="btn" onclick="updateStatus(${appt.Appointment_ID}, 'Completed', this)">Complete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// =========================
// UPDATE STATUS — saves to DB and updates row instantly
// =========================
async function updateStatus(id, newStatus, btn) {
    const row = btn.closest('tr');
    const buttons = row.querySelectorAll('.btn');
    buttons.forEach(b => b.disabled = true);

    const { error } = await supabase
        .from('AppointmentsTbl')
        .update({ Status: newStatus })
        .eq('Appointment_ID', id);

    if (error) {
        alert('Failed to update status. Please try again.');
        buttons.forEach(b => b.disabled = false);
        return;
    }

    // Update status cell instantly
    row.cells[5].innerHTML = `<span class="${getStatusClass(newStatus)}">${newStatus}</span>`;

    // Update in memory + refresh cards
    const appt = allAppointments.find(a => a.Appointment_ID === id);
    if (appt) appt.Status = newStatus;
    updateCards(allAppointments);

    buttons.forEach(b => b.disabled = false);
}

// =========================
// SAVE new appointment to Supabase
// =========================
async function saveAppointment(form) {
    const saveBtn = form.querySelector('.modal-save');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const { error } = await supabase.from('AppointmentsTbl').insert([{
        AppointmentDate: document.getElementById('appointmentDate').value,
        AppointmentTime: document.getElementById('appointmentTime').value,
        AppointmentType: document.getElementById('appointmentType').value,
        Purpose: document.getElementById('appointmentPurpose').value.trim(),
        Status: 'Pending',
        Notes: document.getElementById('appointmentPatient').value.trim()
    }]);

    if (error) {
        alert('Failed to save: ' + error.message);
        saveBtn.disabled = false;
        saveBtn.textContent = '✔ Save Appointment';
        return;
    }

    document.getElementById('addAppointmentModal').classList.remove('active');
    form.reset();
    saveBtn.disabled = false;
    saveBtn.textContent = '✔ Save Appointment';
    await loadAppointments();
}

// =========================
// SEARCH + FILTER
// =========================
function applyFilters() {
    const query  = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('filterStatus').value.toLowerCase();

    const filtered = allAppointments.filter(appt => {
        const matchSearch = !query ||
            (appt.Notes || '').toLowerCase().includes(query) ||
            (appt.Purpose || '').toLowerCase().includes(query);
        const matchStatus = status === 'all' || (appt.Status || 'pending').toLowerCase() === status;
        return matchSearch && matchStatus;
    });

    renderTable(filtered);
}

function searchAppointments() { applyFilters(); }

// =========================
// UPDATE SUMMARY CARDS
// =========================
function updateCards(appointments) {
    const today = new Date().toISOString().split('T')[0];

    // FIXED: Only count today's appointments that are still pending or approved
    // Completed and cancelled are excluded from Today count
    document.getElementById('countToday').textContent = appointments.filter(a =>
        a.AppointmentDate === today &&
        (a.Status || '').toLowerCase() !== 'completed' &&
        (a.Status || '').toLowerCase() !== 'cancelled'
    ).length;

    document.getElementById('countPending').textContent   = appointments.filter(a => (a.Status || '').toLowerCase() === 'pending').length;
    document.getElementById('countCompleted').textContent = appointments.filter(a => (a.Status || '').toLowerCase() === 'completed').length;
    document.getElementById('countCancelled').textContent = appointments.filter(a => (a.Status || '').toLowerCase() === 'cancelled').length;
}

// =========================
// MODAL SETUP
// =========================
function setupModal() {
    const modal    = document.getElementById('addAppointmentModal');
    const closeBtn = document.getElementById('closeAddAppointmentModal');
    const form     = document.getElementById('addAppointmentForm');

    // Block past dates — only today and future allowed
    document.getElementById('appointmentDate').min = new Date().toISOString().split('T')[0];

    closeBtn.addEventListener('click', () => { modal.classList.remove('active'); form.reset(); });
    modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.remove('active'); form.reset(); } });
    form.addEventListener('submit', (e) => { e.preventDefault(); saveAppointment(form); });
}

// Called from HTML onclick
function openAppointmentModal() {
    document.getElementById('addAppointmentModal').classList.add('active');
    // Re-apply min date every time modal opens
    document.getElementById('appointmentDate').min = new Date().toISOString().split('T')[0];
}

// =========================
// HELPERS
// =========================
function getStatusClass(status) {
    switch ((status || '').toLowerCase()) {
        case 'approved':  return 'status-approved';
        case 'completed': return 'status-completed';
        case 'cancelled': return 'status-cancelled';
        default:          return 'status-pending';
    }
}

function formatTime(timeStr) {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
}