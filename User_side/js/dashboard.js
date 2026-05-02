// =========================
// SUPABASE SETUP
// =========================
const supabase = window.supabase.createClient(
    'https://fdywrbdjrtrpnyyhrpoj.supabase.co',
    'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH'
);

let allEvents = [];
let currentFullName = '';

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();

    // ADDED: Close bell dropdown when clicking outside
    document.addEventListener('click', function (e) {
        const wrapper = document.getElementById('notifBellWrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            document.getElementById('notifDropdown')?.classList.remove('open');
        }
    });
});

async function loadDashboard() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        currentFullName = `${currentUser.firstname} ${currentUser.lastname}`;
        document.querySelector('#greetingCard h2').textContent = `Good day, ${currentFullName} 👋`;

        loadNextAppointment(currentFullName);
        loadAllEvents();
        loadNotifications(currentFullName);
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

    if (error) { container.innerHTML = '<p>Failed to load appointment.</p>'; return; }

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
        <p><i class="fa-solid fa-stethoscope"></i><strong> Service:</strong> ${appt.Purpose || '—'}</p>
        <p><i class="fa-solid fa-calendar-days"></i><strong> Date:</strong> ${appt.AppointmentDate} — ${formatTime(appt.AppointmentTime)}</p>
        <p><i class="fa-solid fa-hospital"></i><strong> Type:</strong> ${appt.AppointmentType || '—'}</p>
        <p><i class="fa-solid fa-circle-info"></i><strong> Status:</strong>
            <span style="color:${statusColor}; font-weight:600;">${appt.Status || 'Pending'}</span>
        </p>
    `;
}

// =========================
// LOAD ALL ACTIVE EVENTS
// =========================
async function loadAllEvents() {
    const container = document.getElementById('eventsContent');

    const { data, error } = await supabase
        .from('ImmunizationProgramsTbl')
        .select('*')
        .in('Status', ['Upcoming', 'Scheduled', 'Ongoing'])
        .order('Date', { ascending: true });

    if (error) { container.innerHTML = '<p style="color:#ef4444;">Failed to load events.</p>'; return; }
    if (!data || !data.length) { container.innerHTML = '<p>No active events at the moment.</p>'; return; }

    allEvents = data;
    renderEvents(allEvents);
}

// =========================
// RENDER EVENTS
// =========================
function renderEvents(events) {
    const container = document.getElementById('eventsContent');

    if (!events.length) {
        container.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:20px;">No events found.</p>';
        return;
    }

    const statusConfig = {
        'Upcoming':  { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: '🗓️' },
        'Scheduled': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: '📋' },
        'Ongoing':   { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: '🔄' },
    };

    container.innerHTML = '';
    events.forEach(ev => {
        const config = statusConfig[ev.Status] || { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: '📌' };
        const card = document.createElement('div');
        card.className = 'event-item-card';
        card.style.borderLeftColor = config.color;
        card.style.background = config.bg;
        card.onclick = () => openEventModal(ev);
        card.innerHTML = `
            <div class="event-item-header">
                <span class="event-item-icon">${config.icon}</span>
                <div class="event-item-info">
                    <span class="event-item-name">${ev.EventName || '—'}</span>
                    <span class="event-item-type">${ev.TypeOfEvent || ''}</span>
                </div>
                <span class="event-item-status" style="background:${config.color};">${ev.Status}</span>
            </div>
            <div class="event-item-meta">
                <span>📅 ${ev.Date || '—'}</span>
                <span>📍 ${ev.Location || '—'}</span>
                <span>👥 ${ev.Participants_Count ?? '—'} participants</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// =========================
// FILTER EVENTS
// =========================
function filterEvents(status, e) {
    document.querySelectorAll('.events-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    renderEvents(status === 'all' ? allEvents : allEvents.filter(ev => ev.Status === status));
}

// =========================
// EVENT MODAL
// =========================
function openEventModal(ev) {
    const statusConfig = {
        'Upcoming':  { color: '#3b82f6', icon: '🗓️' },
        'Scheduled': { color: '#f59e0b', icon: '📋' },
        'Ongoing':   { color: '#10b981', icon: '🔄' },
    };
    const config = statusConfig[ev.Status] || { color: '#6b7280', icon: '📌' };

    document.getElementById('modalIcon').textContent         = config.icon;
    document.getElementById('modalEventName').textContent    = ev.EventName || '—';
    document.getElementById('modalStatus').textContent       = ev.Status || '—';
    document.getElementById('modalStatus').style.background  = config.color;
    document.getElementById('modalDate').textContent         = ev.Date || '—';
    document.getElementById('modalLocation').textContent     = ev.Location || '—';
    document.getElementById('modalType').textContent         = ev.TypeOfEvent || '—';
    document.getElementById('modalParticipants').textContent = ev.Participants_Count ?? '—';
    document.getElementById('modalNotes').textContent        = ev.Notes || 'No notes.';
    document.getElementById('eventDetailModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeEventModal() {
    document.getElementById('eventDetailModal').style.display = 'none';
    document.body.style.overflow = '';
}

document.getElementById('eventDetailModal')?.addEventListener('click', function (e) {
    if (e.target === this) closeEventModal();
});

// =========================
// LOAD NOTIFICATIONS
// Shared function — updates BOTH the card section and the bell dropdown
// =========================
async function loadNotifications(fullName) {
    const cardContainer  = document.getElementById('notificationsContent');
    const dropdownBody   = document.getElementById('notifDropdownBody');
    const clearBtn       = document.getElementById('clearNotifsBtn');
    const dropClearBtn   = document.getElementById('dropdownClearBtn');
    const badge          = document.getElementById('notifBadge');

    const { data, error } = await supabase
        .from('AppointmentsTbl')
        .select('Appointment_ID, Purpose, AppointmentDate, AppointmentTime, Status, Updated_At')
        .eq('Notes', fullName)
        .in('Status', ['Approved', 'Cancelled'])
        .order('Updated_At', { ascending: false });

    if (error || !data || !data.length) {
        const empty = '<p class="notif-empty">No new notifications</p>';
        cardContainer.innerHTML = empty;
        dropdownBody.innerHTML  = empty;
        badge.style.display     = 'none';
        return;
    }

    const readKey  = `readNotifs_${fullName}`;
    const readList = JSON.parse(localStorage.getItem(readKey) || '[]');
    const unread   = data.filter(n => !readList.includes(n.Appointment_ID));
    const unreadCount = unread.length;

    // Update badge
    if (unreadCount > 0) {
        badge.textContent    = unreadCount > 9 ? '9+' : unreadCount;
        badge.style.display  = 'flex';
        clearBtn.style.display    = 'inline-block';
        dropClearBtn.style.display = 'inline-block';
    } else {
        badge.style.display       = 'none';
        clearBtn.style.display    = 'none';
        dropClearBtn.style.display = 'none';
    }

    // Build notification HTML — same for both card and dropdown
    const buildNotifHTML = (notif) => {
        const isRead     = readList.includes(notif.Appointment_ID);
        const isApproved = notif.Status === 'Approved';
        const updatedDate = new Date(notif.Updated_At).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
        return `
            <div class="notif-item ${isRead ? 'notif-read' : 'notif-unread'}"
                 onclick="markOneRead(${notif.Appointment_ID}, '${fullName}')">
                <div class="notif-icon ${isApproved ? 'notif-icon-approved' : 'notif-icon-cancelled'}">
                    ${isApproved ? '✅' : '❌'}
                </div>
                <div class="notif-body">
                    <div class="notif-title">
                        Appointment ${isApproved ? 'Approved' : 'Cancelled'}
                        ${!isRead ? '<span class="notif-dot"></span>' : ''}
                    </div>
                    <div class="notif-desc">
                        Your <strong>${notif.Purpose || 'appointment'}</strong> on
                        <strong>${notif.AppointmentDate}</strong> at
                        <strong>${formatTime(notif.AppointmentTime)}</strong> has been
                        <span style="color:${isApproved ? '#00c267' : '#ef4444'}; font-weight:600;">
                            ${notif.Status.toLowerCase()}
                        </span>.
                    </div>
                    <div class="notif-time">${updatedDate}</div>
                </div>
            </div>
        `;
    };

    // ADDED: Render in BOTH card and dropdown
    const html = data.map(buildNotifHTML).join('');
    cardContainer.innerHTML = html;
    dropdownBody.innerHTML  = html;
}

// =========================
// ADDED: Toggle bell dropdown open/close
// =========================
function toggleNotifDropdown() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown?.classList.toggle('open');
}

// =========================
// ADDED: Mark one notification as read
// =========================
function markOneRead(id, fullName) {
    const readKey  = `readNotifs_${fullName}`;
    const readList = JSON.parse(localStorage.getItem(readKey) || '[]');
    if (!readList.includes(id)) {
        readList.push(id);
        localStorage.setItem(readKey, JSON.stringify(readList));
        loadNotifications(fullName);
    }
}

// =========================
// MARK ALL AS READ
// =========================
async function markAllRead() {
    const readKey = `readNotifs_${currentFullName}`;
    const { data } = await supabase
        .from('AppointmentsTbl')
        .select('Appointment_ID')
        .eq('Notes', currentFullName)
        .in('Status', ['Approved', 'Cancelled']);

    if (data) {
        const allIds = data.map(d => d.Appointment_ID);
        localStorage.setItem(readKey, JSON.stringify(allIds));
        loadNotifications(currentFullName);
    }
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