// =========================
// SUPABASE SETUP
// =========================
const supabase = window.supabase.createClient(
    'https://fdywrbdjrtrpnyyhrpoj.supabase.co',
    'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH'
);

let selectedEvent   = null;
let events          = [];
let currentDate     = new Date();
let currentUser     = null;
let currentFullName = '';

// Stores event IDs the user is registered for
let registeredEventIds = new Set();

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", async () => {
    currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
        currentFullName = `${currentUser.firstname} ${currentUser.lastname}`;
        loadBellNotifications();
    }

    await loadEvents();
    await loadRegisteredEvents();
    renderCalendar();
    setupUI();
    updateMonthTitle();
    autoFillForm();

    document.addEventListener('click', function (e) {
        const wrapper = document.getElementById('notifBellWrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            document.getElementById('notifDropdown')?.classList.remove('open');
        }
    });
});

// =========================
// LOAD REGISTERED EVENTS
// =========================
async function loadRegisteredEvents() {
    if (!currentUser || !currentUser.email) return;

    const { data, error } = await supabase
        .from('EventRegistrationsTbl')
        .select('Event_ID')
        .eq('Email', currentUser.email);

    if (error) { console.error('Failed to load registrations:', error); return; }
    registeredEventIds = new Set((data || []).map(r => r.Event_ID));
}

// =========================
// NOTIFICATION BELL
// =========================
function toggleNotifDropdown() {
    document.getElementById('notifDropdown')?.classList.toggle('open');
}

async function loadBellNotifications() {
    const dropdownBody = document.getElementById('notifDropdownBody');
    const dropClearBtn = document.getElementById('dropdownClearBtn');
    const badge        = document.getElementById('notifBadge');

    const { data, error } = await supabase
        .from('AppointmentsTbl')
        .select('Appointment_ID, Purpose, AppointmentDate, AppointmentTime, Status, Updated_At')
        .eq('Notes', currentFullName)
        .in('Status', ['Approved', 'Cancelled'])
        .order('Updated_At', { ascending: false });

    if (error || !data || !data.length) {
        if (dropdownBody) dropdownBody.innerHTML = '<p class="notif-empty">No notifications</p>';
        if (badge) badge.style.display = 'none';
        return;
    }

    const readKey  = `readNotifs_${currentFullName}`;
    const readList = JSON.parse(localStorage.getItem(readKey) || '[]');
    const unread   = data.filter(n => !readList.includes(n.Appointment_ID));

    if (unread.length > 0) {
        badge.textContent   = unread.length > 9 ? '9+' : unread.length;
        badge.style.display = 'flex';
        if (dropClearBtn) dropClearBtn.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
        if (dropClearBtn) dropClearBtn.style.display = 'none';
    }

    if (dropdownBody) {
        dropdownBody.innerHTML = data.map(notif => {
            const isRead     = readList.includes(notif.Appointment_ID);
            const isApproved = notif.Status === 'Approved';
            const date = notif.Updated_At
                ? new Date(notif.Updated_At).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '';
            return `
                <div class="notif-item ${isRead ? 'notif-read' : 'notif-unread'}" onclick="markOneBellRead(${notif.Appointment_ID})">
                    <div class="notif-icon ${isApproved ? 'notif-icon-approved' : 'notif-icon-cancelled'}">${isApproved ? '✅' : '❌'}</div>
                    <div class="notif-body">
                        <div class="notif-title">Appointment ${isApproved ? 'Approved' : 'Cancelled'}${!isRead ? '<span class="notif-dot"></span>' : ''}</div>
                        <div class="notif-desc">Your <strong>${notif.Purpose || 'appointment'}</strong> on <strong>${notif.AppointmentDate}</strong> has been <span style="color:${isApproved ? '#00c267' : '#ef4444'}; font-weight:600;">${notif.Status.toLowerCase()}</span>.</div>
                        <div class="notif-time">${date}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function markOneBellRead(id) {
    const readKey  = `readNotifs_${currentFullName}`;
    const readList = JSON.parse(localStorage.getItem(readKey) || '[]');
    if (!readList.includes(id)) {
        readList.push(id);
        localStorage.setItem(readKey, JSON.stringify(readList));
        loadBellNotifications();
    }
}

async function markAllRead() {
    const readKey = `readNotifs_${currentFullName}`;
    const { data } = await supabase
        .from('AppointmentsTbl')
        .select('Appointment_ID')
        .eq('Notes', currentFullName)
        .in('Status', ['Approved', 'Cancelled']);
    if (data) {
        localStorage.setItem(readKey, JSON.stringify(data.map(d => d.Appointment_ID)));
        loadBellNotifications();
    }
}

// =========================
// AUTO FILL FORM
// =========================
function autoFillForm() {
    if (!currentUser) return;
    setVal('firstname', currentUser.firstname);
    setVal('lastname',  currentUser.lastname);
    setVal('email',     currentUser.email);
    setVal('phone',     currentUser.MobileNumber || currentUser.phone || '');
    setVal('address',   currentUser.Address || currentUser.address || '');
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
}

// =========================
// LOAD EVENTS
// =========================
async function loadEvents() {
    const { data, error } = await supabase
        .from('ImmunizationProgramsTbl')
        .select('*')
        .order('Date', { ascending: true });

    if (error) { console.error(error); events = []; return; }

    events = (data || []).map(e => ({
        id:           e.Programs_ID,
        title:        e.EventName,
        date:         e.Date,
        description:  e.Notes || '—',
        location:     e.Location || '—',
        type:         e.TypeOfEvent || '—',
        status:       e.Status || '—',
        participants: e.Participants_Count || 0
    }));
}

// =========================
// CALENDAR RENDER
// =========================
function renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth   = new Date(year, month + 1, 0).getDate();

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekDays.forEach(day => {
        const el = document.createElement("div");
        el.className = "weekday";
        el.textContent = day;
        calendar.appendChild(el);
    });

    for (let i = 0; i < firstDayIndex; i++) {
        const empty = document.createElement("div");
        empty.className = "empty";
        calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr   = formatDate(year, month + 1, day);
        const dayEvents = events.filter(e => e.date === dateStr);
        const cell      = document.createElement("div");
        cell.className  = "day";
        cell.innerHTML  = `<span>${day}</span>`;

        if (dayEvents.length > 0) {
            const isRegistered = dayEvents.some(ev => registeredEventIds.has(ev.id));
            cell.classList.add("event");
            if (isRegistered) cell.classList.add("event-registered");
            cell.onclick = () => handleDayClick(dayEvents);

            if (dayEvents.length > 1) {
                const badge = document.createElement("span");
                badge.className   = "event-badge";
                badge.textContent = dayEvents.length;
                cell.appendChild(badge);
            }
        } else {
            cell.classList.add("disabled");
        }

        calendar.appendChild(cell);
    }
}

function handleDayClick(dayEvents) {
    if (dayEvents.length === 1) {
        openEvent(dayEvents[0]);
    } else {
        openEventList(dayEvents);
    }
}

function openEventList(dayEvents) {
    const container = document.getElementById("eventListContainer");
    container.innerHTML = "";
    dayEvents.forEach(ev => {
        const isReg = registeredEventIds.has(ev.id);
        const item  = document.createElement("div");
        item.className = `event-list-item${isReg ? ' event-list-registered' : ''}`;
        item.innerHTML = `
            <div class="event-list-title">${ev.title}${isReg ? '<span class="reg-tag">✅ Registered</span>' : ''}</div>
            <div class="event-list-meta">${ev.date} • ${ev.location}</div>
        `;
        item.onclick = () => { closeEventList(); openEvent(ev); };
        container.appendChild(item);
    });
    document.getElementById("eventListModal").classList.add("show");
}

function closeEventList() {
    document.getElementById("eventListModal").classList.remove("show");
}

// =========================
// OPEN EVENT MODAL
// =========================
function openEvent(ev) {
    selectedEvent = ev;
    setText("eventTitle",        ev.title);
    setText("eventDesc",         ev.description);
    setText("eventDate",         ev.date);
    setText("eventLocation",     ev.location);
    setText("eventType",         ev.type);
    setText("eventStatus",       ev.status);
    setText("eventParticipants", ev.participants);

    const isRegistered = registeredEventIds.has(ev.id);
    const badge        = document.getElementById('alreadyRegisteredBadge');
    const registerBtn  = document.getElementById('openRegisterBtn');
    const cancelBtn    = document.getElementById('cancelRegBtn'); // ADDED

    if (isRegistered) {
        badge.style.display      = 'flex';
        registerBtn.disabled     = true;
        registerBtn.innerHTML    = '<i class="fa-solid fa-check"></i> Already Registered';
        registerBtn.classList.add('btn-registered');
        // ADDED: Show cancel registration button
        cancelBtn.style.display  = 'inline-flex';
    } else {
        badge.style.display      = 'none';
        registerBtn.disabled     = false;
        registerBtn.innerHTML    = '<i class="fa-solid fa-user-plus"></i> Register';
        registerBtn.classList.remove('btn-registered');
        // ADDED: Hide cancel button if not registered
        cancelBtn.style.display  = 'none';
    }

    document.getElementById("eventModal").classList.add("show");
}

function closeModal() {
    document.getElementById("eventModal").classList.remove("show");
}

// =========================
// ADDED: CANCEL REGISTRATION
// Shows confirmation modal before deleting from DB
// =========================
function cancelRegistration() {
    if (!selectedEvent) return;
    // Show event name in confirmation modal
    document.getElementById('cancelEventName').textContent = selectedEvent.title;
    document.getElementById('cancelRegModal').classList.add('show');
}

function closeCancelModal() {
    document.getElementById('cancelRegModal').classList.remove('show');
}

async function confirmCancelRegistration() {
    if (!selectedEvent || !currentUser) return;

    const confirmBtn = document.querySelector('.confirm-cancel-btn');
    confirmBtn.disabled     = true;
    confirmBtn.textContent  = 'Cancelling...';

    // ADDED: Delete from EventRegistrationsTbl by Event_ID and Email
    const { error } = await supabase
        .from('EventRegistrationsTbl')
        .delete()
        .eq('Event_ID', selectedEvent.id)
        .eq('Email', currentUser.email);

    if (error) {
        alert('Failed to cancel registration: ' + error.message);
        confirmBtn.disabled    = false;
        confirmBtn.innerHTML   = '<i class="fa-solid fa-trash"></i> Yes, Cancel Registration';
        return;
    }

    // ADDED: Remove from local set and re-render calendar
    registeredEventIds.delete(selectedEvent.id);
    renderCalendar();

    confirmBtn.disabled    = false;
    confirmBtn.innerHTML   = '<i class="fa-solid fa-trash"></i> Yes, Cancel Registration';

    // Close both modals
    closeCancelModal();
    closeModal();

    // ADDED: Show success toast
    showCancelToast(`Registration for "${selectedEvent.title}" has been cancelled.`);
}

// ADDED: Simple toast for cancel confirmation
function showCancelToast(message) {
    const toast = document.createElement('div');
    toast.className   = 'cancel-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// =========================
// NAVIGATION
// =========================
function nextMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    refreshCalendar();
}

function prevMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    refreshCalendar();
}

function refreshCalendar() { renderCalendar(); updateMonthTitle(); }

function updateMonthTitle() {
    document.getElementById("monthTitle").textContent =
        currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// =========================
// SETUP UI
// =========================
function setupUI() {
    document.getElementById("openRegisterBtn")?.addEventListener("click", () => {
        if (document.getElementById("openRegisterBtn").disabled) return;
        closeModal();
        autoFillForm();
        document.getElementById("registerModal").classList.add("show");
    });

    window.closeRegister = () => {
        document.getElementById("registerModal").classList.remove("show");
    };

    const form = document.getElementById("registerForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled    = true;
        submitBtn.textContent = 'Submitting...';

        const { error } = await supabase.from('EventRegistrationsTbl').insert([{
            Event_ID:      selectedEvent.id,
            LastName:      value('lastname'),
            FirstName:     value('firstname'),
            MiddleInitial: value('middleinitial'),
            Gender:        value('gender'),
            PhoneNumber:   value('phone'),
            Email:         value('email'),
            Address:       value('address')
        }]);

        if (error) {
            alert(error.message);
            submitBtn.disabled    = false;
            submitBtn.innerHTML   = '<i class="fa-solid fa-check"></i> Submit Registration';
            return;
        }

        // Add to registered set and re-render
        registeredEventIds.add(selectedEvent.id);
        renderCalendar();

        document.getElementById('regSuccessEventName').textContent = selectedEvent.title;
        closeRegister();
        document.getElementById('regSuccessModal').classList.add('show');

        form.reset();
        autoFillForm();
        submitBtn.disabled    = false;
        submitBtn.innerHTML   = '<i class="fa-solid fa-check"></i> Submit Registration';
    });
}

function closeRegSuccess() {
    document.getElementById('regSuccessModal').classList.remove('show');
}

// =========================
// HELPERS
// =========================
function formatDate(y, m, d) {
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val || "—";
}

function value(id) {
    return document.getElementById(id)?.value || "";
}