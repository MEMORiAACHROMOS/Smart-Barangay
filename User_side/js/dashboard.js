// =========================
// SUPABASE SETUP
// =========================
const supabase = window.supabase.createClient(
    'https://fdywrbdjrtrpnyyhrpoj.supabase.co',
    'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH'
);

// ADDED: Store all events for filtering
let allEvents = [];

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
});

async function loadDashboard() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        const fullName = `${currentUser.firstname} ${currentUser.lastname}`;
        document.querySelector('#greetingCard h2').textContent = `Good day, ${fullName} 👋`;

        loadNextAppointment(fullName);
        loadAllEvents(); // CHANGED: now loads all active events
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

// =========================
// NEXT APPOINTMENT
// =========================
async function loadNextAppointment(fullName) {
    const container = document.getElementById('appointmentContent');
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('AppointmentsTbl')
        .select('*')
        .eq('Notes', fullName)
        .gte('AppointmentDate', today)
        .not('Status', 'eq', 'Completed')
        .order('AppointmentDate', { ascending: true })
        .limit(1);

    if (error) {
        container.innerHTML = '<p>Failed to load appointment.</p>';
        return;
    }

    if (!data || !data.length) {
        container.innerHTML = '<p>No upcoming appointments.</p>';
        return;
    }

    const appt = data[0];
    let statusColor = "#333";
    const status = (appt.Status || '').toLowerCase();
    if (status === 'approved')  statusColor = '#00c267';
    if (status === 'pending')   statusColor = '#f59e0b';
    if (status === 'cancelled') statusColor = '#ef4444';
    if (status === 'completed') statusColor = '#2563eb';

    container.innerHTML = `
        <p><i class="fa-solid fa-stethoscope"></i><strong>Service:</strong> ${appt.Purpose || '—'}</p>
        <p><i class="fa-solid fa-calendar-days"></i><strong>Date:</strong> ${appt.AppointmentDate} — ${formatTime(appt.AppointmentTime)}</p>
        <p><i class="fa-solid fa-hospital"></i><strong>Type:</strong> ${appt.AppointmentType || '—'}</p>
        <p><i class="fa-solid fa-circle-info"></i><strong>Status:</strong>
            <span style="color:${statusColor}; font-weight:600;">${appt.Status || 'Pending'}</span>
        </p>
    `;
}

// =========================
// ADDED: LOAD ALL ACTIVE EVENTS
// Fetches Upcoming, Scheduled, Ongoing — no limit, scrollable
// =========================
async function loadAllEvents() {
    const container = document.getElementById('eventsContent');

    const { data, error } = await supabase
        .from('ImmunizationProgramsTbl')
        .select('*')
        .in('Status', ['Upcoming', 'Scheduled', 'Ongoing'])
        .order('Date', { ascending: true });

    if (error) {
        container.innerHTML = '<p style="color:#ef4444;">Failed to load events.</p>';
        console.error(error);
        return;
    }

    if (!data || !data.length) {
        container.innerHTML = '<p>No active events at the moment.</p>';
        return;
    }

    // ADDED: Store globally for filtering
    allEvents = data;
    renderEvents(allEvents);
}

// =========================
// ADDED: RENDER EVENTS as clickable cards
// =========================
function renderEvents(events) {
    const container = document.getElementById('eventsContent');

    if (!events.length) {
        container.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:20px;">No events found.</p>';
        return;
    }

    // ADDED: Status config for colors and icons
    const statusConfig = {
        'Upcoming':  { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: '🗓️' },
        'Scheduled': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: '📋' },
        'Ongoing':   { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: '🔄' },
    };

    container.innerHTML = '';
    events.forEach(event => {
        const config = statusConfig[event.Status] || { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: '📌' };

        const card = document.createElement('div');
        card.className = 'event-item-card';
        card.style.borderLeftColor = config.color;
        card.style.background = config.bg;
        card.onclick = () => openEventModal(event);

        card.innerHTML = `
            <div class="event-item-header">
                <span class="event-item-icon">${config.icon}</span>
                <div class="event-item-info">
                    <span class="event-item-name">${event.EventName || '—'}</span>
                    <span class="event-item-type">${event.TypeOfEvent || ''}</span>
                </div>
                <span class="event-item-status" style="background:${config.color};">${event.Status}</span>
            </div>
            <div class="event-item-meta">
                <span>📅 ${event.Date || '—'}</span>
                <span>📍 ${event.Location || '—'}</span>
                <span>👥 ${event.Participants_Count ?? '—'} participants</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// =========================
// ADDED: FILTER EVENTS by status
// =========================
function filterEvents(status) {
    // Update active tab
    document.querySelectorAll('.events-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    if (status === 'all') {
        renderEvents(allEvents);
    } else {
        renderEvents(allEvents.filter(e => e.Status === status));
    }
}

// =========================
// ADDED: OPEN EVENT DETAIL MODAL
// =========================
function openEventModal(event) {
    const statusConfig = {
        'Upcoming':  { color: '#3b82f6', icon: '🗓️' },
        'Scheduled': { color: '#f59e0b', icon: '📋' },
        'Ongoing':   { color: '#10b981', icon: '🔄' },
    };
    const config = statusConfig[event.Status] || { color: '#6b7280', icon: '📌' };

    document.getElementById('modalIcon').textContent          = config.icon;
    document.getElementById('modalEventName').textContent     = event.EventName || '—';
    document.getElementById('modalStatus').textContent        = event.Status || '—';
    document.getElementById('modalStatus').style.background   = config.color;
    document.getElementById('modalDate').textContent          = event.Date || '—';
    document.getElementById('modalLocation').textContent      = event.Location || '—';
    document.getElementById('modalType').textContent          = event.TypeOfEvent || '—';
    document.getElementById('modalParticipants').textContent  = event.Participants_Count ?? '—';
    document.getElementById('modalNotes').textContent         = event.Notes || 'No notes.';

    document.getElementById('eventDetailModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// =========================
// ADDED: CLOSE EVENT MODAL
// =========================
function closeEventModal() {
    document.getElementById('eventDetailModal').style.display = 'none';
    document.body.style.overflow = '';
}

// Close modal on overlay click
document.getElementById('eventDetailModal')?.addEventListener('click', function (e) {
    if (e.target === this) closeEventModal();
});

// =========================
// HELPER: format time
// =========================
function formatTime(timeStr) {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
}