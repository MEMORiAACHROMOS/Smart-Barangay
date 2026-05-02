// =========================
// SUPABASE SETUP
// =========================
const supabase = window.supabase.createClient(
    'https://fdywrbdjrtrpnyyhrpoj.supabase.co',
    'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH'
);

let selectedEvent = null;
let events = [];
let currentDate = new Date();

// ADDED: Store full name globally for bell
let currentFullName = '';

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", async () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
        currentFullName = `${currentUser.firstname} ${currentUser.lastname}`;
        loadBellNotifications(); // ADDED
    }

    await loadEvents();
    renderCalendar();
    setupUI();
    updateMonthTitle();
    autoFillForm();

    // ADDED: Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        const wrapper = document.getElementById('notifBellWrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            document.getElementById('notifDropdown')?.classList.remove('open');
        }
    });
});

// =========================
// ADDED: NOTIFICATION BELL
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
                <div class="notif-item ${isRead ? 'notif-read' : 'notif-unread'}"
                     onclick="markOneBellRead(${notif.Appointment_ID})">
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
                            <strong>${notif.AppointmentDate}</strong> has been
                            <span style="color:${isApproved ? '#00c267' : '#ef4444'}; font-weight:600;">
                                ${notif.Status.toLowerCase()}
                            </span>.
                        </div>
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
// AUTO FILL
// =========================
function autoFillForm() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;
    setVal('firstname', currentUser.firstname);
    setVal('lastname', currentUser.lastname);
    setVal('email', currentUser.email);
    setVal('phone', currentUser.MobileNumber || currentUser.phone);
    setVal('address', currentUser.Address || currentUser.address);
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
        duration:     '—',
        location:     e.Location || '—',
        type:         e.TypeOfEvent || '—',
        status:       e.Status || '—',
        participants: e.Participants_Count || 0,
        imageUrl:     'assets/default-event.jpg'
    }));
}

// =========================
// CALENDAR
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

        const cell = document.createElement("div");
        cell.className = "day";
        cell.innerHTML = `<span>${day}</span>`;

        if (dayEvents.length > 0) {
            cell.classList.add("event");
            cell.onclick = () => handleDayClick(dayEvents);
            if (dayEvents.length > 1) {
                const badge = document.createElement("span");
                badge.className = "event-badge";
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
    dayEvents.forEach(event => {
        const item = document.createElement("div");
        item.className = "event-list-item";
        item.innerHTML = `
            <div class="event-list-title">${event.title}</div>
            <div class="event-list-meta">${event.date} • ${event.location}</div>
        `;
        item.onclick = () => { closeEventList(); openEvent(event); };
        container.appendChild(item);
    });
    document.getElementById("eventListModal").classList.add("show");
}

function closeEventList() {
    document.getElementById("eventListModal").classList.remove("show");
}

function openEvent(event) {
    selectedEvent = event;
    setText("eventTitle",       event.title);
    setText("eventDesc",        event.description);
    setText("eventDate",        event.date);
    setText("eventDuration",    event.duration);
    setText("eventLocation",    event.location);
    setText("eventType",        event.type);
    setText("eventStatus",      event.status);
    setText("eventParticipants", event.participants);
    document.getElementById("eventModal").classList.add("show");
}

function closeModal() {
    document.getElementById("eventModal").classList.remove("show");
}

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

function setupUI() {
    document.getElementById("openRegisterBtn")?.addEventListener("click", () => {
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
        if (error) return alert(error.message);
        alert("Registered!");
        form.reset();
        autoFillForm();
        closeRegister();
    });
}

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