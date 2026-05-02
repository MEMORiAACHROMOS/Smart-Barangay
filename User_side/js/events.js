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

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", async () => {
    await loadEvents();
    renderCalendar();
    setupUI();
    updateMonthTitle();
    autoFillForm();
});

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

    if (error) {
        console.error(error);
        events = [];
        return;
    }

    events = (data || []).map(e => ({
        id: e.Programs_ID,
        title: e.EventName,
        date: e.Date,
        description: e.Notes || '—',
        duration: '—',
        location: e.Location || '—',
        type: e.TypeOfEvent || '—',
        status: e.Status || '—',
        participants: e.Participants_Count || 0,
        imageUrl: 'assets/default-event.jpg'
    }));
}

// =========================
// CALENDAR
// =========================
function renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

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
        const dateStr = formatDate(year, month + 1, day);
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

// =========================
// HANDLE MULTIPLE EVENTS
// =========================
function handleDayClick(dayEvents) {
    if (dayEvents.length === 1) {
        openEvent(dayEvents[0]);
    } else {
        openEventList(dayEvents);
    }
}

// =========================
// EVENT LIST MODAL
// =========================
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

        item.onclick = () => {
            closeEventList();
            openEvent(event);
        };

        container.appendChild(item);
    });

    document.getElementById("eventListModal").classList.add("show");
}

function closeEventList() {
    document.getElementById("eventListModal").classList.remove("show");
}

// =========================
// EVENT MODAL
// =========================
function openEvent(event) {
    selectedEvent = event;

    setText("eventTitle", event.title);
    setText("eventDesc", event.description);
    setText("eventDate", event.date);
    setText("eventDuration", event.duration);
    setText("eventLocation", event.location);
    setText("eventType", event.type);
    setText("eventStatus", event.status);
    setText("eventParticipants", event.participants);

    document.getElementById("eventModal").classList.add("show");
}

function closeModal() {
    document.getElementById("eventModal").classList.remove("show");
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

function refreshCalendar() {
    renderCalendar();
    updateMonthTitle();
}

function updateMonthTitle() {
    document.getElementById("monthTitle").textContent =
        currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// =========================
// REGISTER
// =========================
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
            Event_ID: selectedEvent.id,
            LastName: value('lastname'),
            FirstName: value('firstname'),
            MiddleInitial: value('middleinitial'),
            Gender: value('gender'),
            PhoneNumber: value('phone'),
            Email: value('email'),
            Address: value('address')
        }]);

        if (error) return alert(error.message);

        alert("Registered!");
        form.reset();
        autoFillForm();
        closeRegister();
    });
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