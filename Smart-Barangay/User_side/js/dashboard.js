// =========================
// SUPABASE SETUP
// =========================
const supabase = window.supabase.createClient(
    'https://fdywrbdjrtrpnyyhrpoj.supabase.co',
    'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH'
);

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
});

async function loadDashboard() {
    try {
        // Get logged-in user from sessionStorage
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

        // Redirect to login if no session
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        const fullName = `${currentUser.firstname} ${currentUser.lastname}`;

        // Update greeting with real user name
        document.querySelector('#greetingCard h2').textContent = `Good day, ${fullName} 👋`;

        // Load both in parallel
        loadNextAppointment(fullName);
        loadUpcomingEvents();

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

// =========================
// NEXT APPOINTMENT
// Fetches the user's next upcoming appointment from AppointmentsTbl
// =========================
async function loadNextAppointment(fullName) {
    const container = document.getElementById('appointmentContent');
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
    .from('AppointmentsTbl')
    .select('*')
    .eq('Notes', fullName)
    .gte('AppointmentDate', today)
    .not('Status', 'eq', 'Completed')   // CHANGED: only hide Completed
    .order('AppointmentDate', { ascending: true })
    .limit(1);                       // get only the next one

    if (error) {
        container.innerHTML = '<p>Failed to load appointment.</p>';
        console.error(error);
        return;
    }

    if (!data || !data.length) {
        container.innerHTML = '<p>No upcoming appointments.</p>';
        return;
    }

    const appt = data[0];

    // Status color
    let statusColor = "#333";
    const status = (appt.Status || '').toLowerCase();
    if (status === 'approved')  statusColor = '#00c267';
    if (status === 'pending')   statusColor = '#f59e0b';
    if (status === 'cancelled') statusColor = '#ef4444';
    if (status === 'completed') statusColor = '#2563eb';

    container.innerHTML = `
        <p>
            <i class="fa-solid fa-stethoscope"></i>
            <strong>Service:</strong> ${appt.Purpose || '—'}
        </p>
        <p>
            <i class="fa-solid fa-calendar-days"></i>
            <strong>Date:</strong> ${appt.AppointmentDate} — ${formatTime(appt.AppointmentTime)}
        </p>
        <p>
            <i class="fa-solid fa-hospital"></i>
            <strong>Type:</strong> ${appt.AppointmentType || '—'}
        </p>
        <p>
            <i class="fa-solid fa-circle-info"></i>
            <strong>Status:</strong>
            <span style="color:${statusColor}; font-weight:600;">${appt.Status || 'Pending'}</span>
        </p>
    `;
}

// =========================
// UPCOMING EVENTS
// Fetches upcoming/scheduled events from ImmunizationProgramsTbl (admin side)
// =========================
async function loadUpcomingEvents() {
    const container = document.getElementById('eventsContent');
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('ImmunizationProgramsTbl')
        .select('*')
        .in('Status', ['Upcoming', 'Scheduled'])  // only show upcoming/scheduled
        .gte('Date', today)
        .order('Date', { ascending: true })
        .limit(5);

    if (error) {
        container.innerHTML = '<p>Failed to load events.</p>';
        console.error(error);
        return;
    }

    if (!data || !data.length) {
        container.innerHTML = '<p>No upcoming events.</p>';
        return;
    }

    container.innerHTML = '';
    data.forEach(event => {
        const p = document.createElement('p');
        p.innerHTML = `
            <i class="fa-solid fa-bullhorn"></i>
            <strong>${event.EventName}</strong> — ${event.Date}
            <br><small>${event.Location || ''}</small>
        `;
        container.appendChild(p);
    });
}

// =========================
// HELPER: format HH:MM:SS → 10:00 AM
// =========================
function formatTime(timeStr) {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
}