let selectedEvent = null;
let events = [];
let currentDate = new Date();

/* =========================
   MOCK DATABASE (LOCALSTORAGE)
========================= */
const DB_KEY = "eventsData";

/* seed database */
function seedDB() {
    let data = JSON.parse(localStorage.getItem(DB_KEY));

    if (!data || !Array.isArray(data) || data.length === 0) {
        data = [
            {
                id: 1,
                title: "Vaccination Drive",
                date: "2026-05-15",
                description: "Free vaccination for children and seniors.",
                duration: "8:00 AM - 3:00 PM",
                location: "Barangay Baesa Health Center",
                imageUrl: "assets/vaccine.jpg"
            },
            {
                id: 2,
                title: "Health Seminar",
                date: "2026-05-20",
                description: "Maternal and child health awareness program.",
                duration: "9:00 AM - 12:00 PM",
                location: "Barangay Baesa Hall",
                imageUrl: "assets/seminar.jpg"
            }
        ];

        localStorage.setItem(DB_KEY, JSON.stringify(data));
    }

    return data;
}

/* =========================
   MOCK API LAYER (SWAPPABLE)
========================= */
const eventsAPI = {

    async getAll() {
        // FUTURE:
        // const res = await fetch("/api/events");
        // return await res.json();

        return seedDB();
    },

    async create(event) {
        const data = seedDB();
        event.id = Date.now();
        data.push(event);
        localStorage.setItem(DB_KEY, JSON.stringify(data));
        return event;
    },

    async clear() {
        localStorage.removeItem(DB_KEY);
    }
};

/* expose for browser console testing */
window.eventsAPI = eventsAPI;

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
    events = await eventsAPI.getAll();

    renderCalendar();
    setupUI();
    updateMonthTitle();
});

/* =========================
   CALENDAR RENDER
========================= */
function renderCalendar() {
    const calendar = document.getElementById("calendar");
    if (!calendar) return;

    calendar.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // weekday labels
    weekDays.forEach(day => {
        const el = document.createElement("div");
        el.className = "weekday";
        el.textContent = day;
        calendar.appendChild(el);
    });

    // empty cells
    for (let i = 0; i < firstDayIndex; i++) {
        const empty = document.createElement("div");
        empty.className = "empty";
        calendar.appendChild(empty);
    }

    // days
    for (let day = 1; day <= daysInMonth; day++) {

        const dateStr = formatDate(year, month + 1, day);
        const dayEvents = events.filter(e => e.date === dateStr);

        const cell = document.createElement("div");
        cell.className = "day";

        cell.innerHTML = `<span>${day}</span>`;

        if (dayEvents.length > 0) {
            cell.classList.add("event");
            cell.onclick = () => openEvent(dayEvents[0]);
        } else {
            cell.classList.add("disabled");
        }

        calendar.appendChild(cell);
    }
}

/* =========================
   DATE FORMAT
========================= */
function formatDate(y, m, d) {
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/* =========================
   MONTH NAVIGATION
========================= */
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

/* =========================
   MONTH TITLE
========================= */
function updateMonthTitle() {
    const el = document.getElementById("monthTitle");
    if (!el) return;

    el.textContent = currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });
}

/* =========================
   MODAL
========================= */
function openEvent(event) {
    selectedEvent = event;

    setText("eventTitle", event.title);
    setText("eventDesc", event.description);
    setText("eventDate", event.date);
    setText("eventDuration", event.duration);
    setText("eventLocation", event.location);

    const img = document.getElementById("eventImage");
    if (img) img.src = event.imageUrl || "assets/default-event.jpg";

    document.getElementById("eventModal")?.classList.add("show");
}

function closeModal() {
    document.getElementById("eventModal")?.classList.remove("show");
}

/* =========================
   UI / REGISTRATION
========================= */
function setupUI() {

    document.getElementById("openRegisterBtn")?.addEventListener("click", () => {
        document.getElementById("eventModal")?.classList.remove("show");
        document.getElementById("registerModal")?.classList.add("show");
    });

    window.closeRegister = function () {
        document.getElementById("registerModal")?.classList.remove("show");
    };

    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!selectedEvent) return alert("No event selected.");

        const registration = {
            eventId: selectedEvent.id,
            event: selectedEvent.title,
            date: selectedEvent.date,
            lastname: value("lastname"),
            firstname: value("firstname"),
            middleinitial: value("middleinitial"),
            gender: value("gender"),
            phone: value("phone"),
            email: value("email"),
            address: value("address"),
            type: "event",
            timestamp: new Date().toISOString()
        };

        let data = JSON.parse(localStorage.getItem("appointmentsData")) || {
            appointments: [],
            events: [],
            eventRegistrations: []
        };

        data.eventRegistrations.push(registration);

        localStorage.setItem("appointmentsData", JSON.stringify(data));

        alert("Successfully registered!");
        form.reset();
        closeRegister();
    });
}

/* =========================
   HELPERS
========================= */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
}

function value(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}