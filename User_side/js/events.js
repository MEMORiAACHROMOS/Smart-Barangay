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

    // ADDED: Auto-fill registration form from sessionStorage
    autoFillForm();
});

// =========================
// ADDED: Auto-fill registration form using logged-in user info
// =========================
function autoFillForm() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;

    // Fill fields with user's info — user can still edit them
    if (document.getElementById('firstname'))
        document.getElementById('firstname').value = currentUser.firstname || '';
    if (document.getElementById('lastname'))
        document.getElementById('lastname').value = currentUser.lastname || '';
    if (document.getElementById('email'))
        document.getElementById('email').value = currentUser.email || '';
    if (document.getElementById('phone'))
        document.getElementById('phone').value = currentUser.MobileNumber || currentUser.phone || '';
    if (document.getElementById('address'))
        document.getElementById('address').value = currentUser.Address || currentUser.address || '';
}

// =========================
// LOAD EVENTS from Supabase
// =========================
async function loadEvents() {
    const { data, error } = await supabase
        .from('ImmunizationProgramsTbl')
        .select('*')
        .order('Date', { ascending: true });

    if (error) {
        console.error('Failed to load events:', error);
        events = [];
        return;
    }

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
// RENDER CALENDAR
// =========================
function renderCalendar() {
    const calendar = document.getElementById("calendar");
    if (!calendar) return;

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
            cell.onclick = () => openEvent(dayEvents[0]);

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
// DATE FORMAT
// =========================
function formatDate(y, m, d) {
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// =========================
// MONTH NAVIGATION
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
    const el = document.getElementById("monthTitle");
    if (!el) return;
    el.textContent = currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });
}

// =========================
// OPEN EVENT MODAL
// =========================
function openEvent(event) {
    selectedEvent = event;

    setText("eventTitle",        event.title);
    setText("eventDesc",         event.description);
    setText("eventDate",         event.date);
    setText("eventDuration",     event.duration);
    setText("eventLocation",     event.location);
    setText("eventType",         event.type);
    setText("eventStatus",       event.status);
    setText("eventParticipants", event.participants);

    const img = document.getElementById("eventImage");
    if (img) img.src = event.imageUrl || "assets/default-event.jpg";

    document.getElementById("eventModal")?.classList.add("show");
}

function closeModal() {
    document.getElementById("eventModal")?.classList.remove("show");
}

// =========================
// UI / REGISTRATION
// =========================
function setupUI() {
    document.getElementById("openRegisterBtn")?.addEventListener("click", () => {
        document.getElementById("eventModal")?.classList.remove("show");
        // ADDED: Re-fill form every time register modal opens
        autoFillForm();
        document.getElementById("registerModal")?.classList.add("show");
    });

    window.closeRegister = function () {
        document.getElementById("registerModal")?.classList.remove("show");
    };

    const form = document.getElementById("registerForm");
    if (!form) return;

    // CHANGED: Now saves to EventRegistrationsTbl in Supabase
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!selectedEvent) return alert("No event selected.");

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const { error } = await supabase.from('EventRegistrationsTbl').insert([{
            Event_ID:      selectedEvent.id,
            LastName:      document.getElementById('lastname').value.trim(),
            FirstName:     document.getElementById('firstname').value.trim(),
            MiddleInitial: document.getElementById('middleinitial').value.trim(),
            Gender:        document.getElementById('gender').value,
            PhoneNumber:   document.getElementById('phone').value.trim(),
            Email:         document.getElementById('email').value.trim(),
            Address:       document.getElementById('address').value.trim()
        }]);

        if (error) {
            alert('Failed to register: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Registration';
            return;
        }

        alert(`Successfully registered for ${selectedEvent.title}!`);
        form.reset();
        // ADDED: Re-fill after reset so info stays
        autoFillForm();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Registration';
        closeRegister();
    });
}

// =========================
// HELPERS
// =========================
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val || "—";
}

function value(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}