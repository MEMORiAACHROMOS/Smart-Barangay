// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const blockedDates = ["2026-05-20", "2026-05-25"];

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    document.querySelector('#greetingCard h2').textContent =
        `Good day, ${currentUser.firstname} ${currentUser.lastname} 👋`;

    setupAppointmentForm(currentUser);
    loadMyAppointments(currentUser);
    renderEvents();
});

// =========================
// LOAD MY APPOINTMENTS
// CHANGED: Completed appointments are now excluded from active list
// and moved to history instead
// =========================
async function loadMyAppointments(currentUser) {
    const container = document.getElementById('appointmentContent');
    container.innerHTML = '<p>Loading...</p>';

    const fullName = `${currentUser.firstname} ${currentUser.lastname}`;

    const { data, error } = await supabase
        .from('AppointmentsTbl')
        .select('*')
        .eq('Notes', fullName)
        .order('AppointmentDate', { ascending: false });

    if (error) {
        container.innerHTML = '<p>Failed to load appointments.</p>';
        console.error(error);
        return;
    }

    if (!data || !data.length) {
        container.innerHTML = '<p>No appointments yet.</p>';
        return;
    }

    container.innerHTML = '';

    // CHANGED: active = not cancelled AND not completed
    const active = data.filter(a => {
        const status = (a.Status || '').toLowerCase();
        return status !== 'cancelled' && status !== 'completed';
    });

    // CHANGED: history = cancelled OR completed
    const history = data.filter(a => {
        const status = (a.Status || '').toLowerCase();
        return status === 'cancelled' || status === 'completed';
    });

    if (!active.length) {
        container.innerHTML = '<p>No active appointments.</p>';
    }

    active.forEach(appt => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p><strong>${appt.Purpose || '—'}</strong></p>
            <p>${appt.AppointmentDate} — ${formatTime(appt.AppointmentTime)}</p>
            <p>Type: ${appt.AppointmentType || '—'}</p>
            <span class="status ${(appt.Status || 'pending').toLowerCase()}">${appt.Status || 'Pending'}</span>
            <div style="margin-top:10px;">
                <button onclick="cancelAppointment(${appt.Appointment_ID})">Cancel</button>
            </div>
        `;
        container.appendChild(div);
    });

    renderHistory(history);
}

// =========================
// BOOK NEW APPOINTMENT
// =========================
function setupAppointmentForm(currentUser) {
    const form = document.getElementById('appointmentForm');
    const timeInput = document.getElementById('time');
    const dateInput = document.getElementById('date');

    dateInput.min = new Date().toISOString().split('T')[0];

    if (timeInput) {
        timeInput.addEventListener('change', () => {
            const hour = parseInt(timeInput.value.split(':')[0]);
            if (hour < 7 || hour >= 15) {
                alert('Clinic hours are only 7:00 AM to 3:00 PM.');
                timeInput.value = '';
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const service  = document.getElementById('service').value;
        const apptType = document.getElementById('apptType').value;
        const date     = document.getElementById('date').value;
        const time     = document.getElementById('time').value;

        if (!service || !date || !time) {
            alert('Please complete all fields.');
            return;
        }

        const hour = parseInt(time.split(':')[0]);
        if (hour < 7 || hour >= 15) {
            alert('Appointments allowed only 7AM - 3PM.');
            return;
        }

        if (blockedDates.includes(date)) {
            alert('No doctor available on this date.');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const { error } = await supabase.from('AppointmentsTbl').insert([{
            CreatedBy_User_ID: null,
            AppointmentDate:   date,
            AppointmentTime:   time,
            AppointmentType:   apptType,
            Purpose:           service,
            Status:            'Pending',
            Notes:             `${currentUser.firstname} ${currentUser.lastname}`
        }]);

        if (error) {
            alert('Failed to book appointment: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Appointment';
            return;
        }

        alert('Appointment successfully booked!');
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Appointment';
        await loadMyAppointments(currentUser);
    });
}

// =========================
// CANCEL APPOINTMENT
// =========================
async function cancelAppointment(id) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    const { error } = await supabase
        .from('AppointmentsTbl')
        .update({ Status: 'Cancelled' })
        .eq('Appointment_ID', id);

    if (error) {
        alert('Failed to cancel. Please try again.');
        return;
    }

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    await loadMyAppointments(currentUser);
}

// =========================
// RENDER HISTORY
// CHANGED: now shows both Cancelled and Completed appointments
// =========================
function renderHistory(historyData) {
    const container = document.getElementById('historyContent');
    container.innerHTML = '';

    if (!historyData || !historyData.length) {
        container.innerHTML = '<p>No records yet</p>';
        return;
    }

    historyData.forEach(h => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p><strong>${h.Purpose || '—'}</strong></p>
            <p>${h.AppointmentDate} — ${formatTime(h.AppointmentTime)}</p>
            <span class="status ${(h.Status || '').toLowerCase()}">${h.Status || '—'}</span>
        `;
        container.appendChild(div);
    });
}

// =========================
// RENDER EVENTS (static)
// =========================
function renderEvents() {
    const container = document.getElementById('eventsContent');
    container.innerHTML = '';

    const events = [
        'Free Vaccination Drive - Registered',
        'Health Seminar for Mothers - Registered'
    ];

    events.forEach(e => {
        const p = document.createElement('p');
        p.innerHTML = `<i class="fa-solid fa-check"></i> ${e}`;
        container.appendChild(p);
    });
}

// =========================
// HELPER
// =========================
function formatTime(timeStr) {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
}