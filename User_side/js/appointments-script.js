document.addEventListener("DOMContentLoaded", () => {
    initActivity();
    setupAppointmentForm();
});

/* =========================
   DATA LAYER (SWAP FOR BACKEND LATER)
========================= */
function fetchActivityData() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                appointments: [
                    {
                        service: "Dental Checkup",
                        date: "2026-05-10",
                        time: "10:00",
                        status: "Confirmed"
                    },
                    {
                        service: "Prenatal Care",
                        date: "2026-05-15",
                        time: "13:00",
                        status: "Pending"
                    }
                ],
                events: [
                    "Free Vaccination Drive - Registered",
                    "Health Seminar for Mothers - Registered"
                ],
                history: []
            });
        }, 300);
    });
}

/* =========================
   INIT
========================= */
async function initActivity() {

    let stored = localStorage.getItem("appointmentsData");

    window.appData = stored
        ? JSON.parse(stored)
        : await fetchActivityData();

    saveData();

    renderAppointments();
    renderEvents();
    renderHistory();
}

/* =========================
   SAVE (LOCAL STORAGE)
========================= */
function saveData() {
    localStorage.setItem("appointmentsData", JSON.stringify(window.appData));
}

/* =========================
   RENDER APPOINTMENTS
========================= */
function renderAppointments() {

    const container = document.getElementById("appointmentContent");
    if (!container || !window.appData) return;

    container.innerHTML = "";

    window.appData.appointments.forEach((a, index) => {

        const div = document.createElement("div");

        div.innerHTML = `
            <p><strong>${a.service}</strong></p>
            <p>${a.date} - ${a.time}</p>
            <span class="status ${a.status.toLowerCase()}">${a.status}</span>

            <div style="margin-top:10px;">
                <button onclick="rescheduleAppointment(${index})">Reschedule</button>
                <button onclick="cancelAppointment(${index})">Cancel</button>
            </div>
        `;

        container.appendChild(div);
    });
}

/* =========================
   EVENTS
========================= */
function renderEvents() {

    const container = document.getElementById("eventsContent");
    if (!container || !window.appData) return;

    container.innerHTML = "";

    window.appData.events.forEach(e => {
        const p = document.createElement("p");
        p.innerHTML = `<i class="fa-solid fa-check"></i> ${e}`;
        container.appendChild(p);
    });
}

/* =========================
   HISTORY
========================= */
function renderHistory() {

    const container = document.getElementById("historyContent");
    if (!container || !window.appData) return;

    container.innerHTML = "";

    if (!window.appData.history || window.appData.history.length === 0) {
        container.innerHTML = "<p>No records yet</p>";
        return;
    }

    window.appData.history.forEach(h => {

        const div = document.createElement("div");

        div.innerHTML = `
            <p><strong>${h.service}</strong></p>
            <p>${h.action}</p>
            <p>${h.timestamp}</p>
            ${h.oldDate ? `<p>Old: ${h.oldDate} ${h.oldTime}</p>` : ""}
            ${h.newDate ? `<p>New: ${h.newDate} ${h.newTime}</p>` : ""}
        `;

        container.appendChild(div);
    });
}

/* =========================
   FORM HANDLER
========================= */
function setupAppointmentForm() {

    const form = document.getElementById("appointmentForm");
    if (!form) return;

    const blockedDates = ["2026-05-20", "2026-05-25"];
    const timeInput = document.getElementById("time");

    // REAL-TIME TIME VALIDATION
    if (timeInput) {
        timeInput.addEventListener("change", () => {

            const hour = parseInt(timeInput.value.split(":")[0]);

            if (hour < 7 || hour >= 15) {
                alert("Clinic hours are only 7:00 AM to 3:00 PM.");
                timeInput.value = "";
            }
        });
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const service = document.getElementById("service").value;
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;

        if (!service || !date || !time) {
            alert("Please complete all fields.");
            return;
        }

        const hour = parseInt(time.split(":")[0]);

        if (hour < 7 || hour >= 15) {
            alert("Appointments allowed only 7AM - 3PM.");
            return;
        }

        if (blockedDates.includes(date)) {
            alert("No doctor available on this date.");
            return;
        }

        const newAppointment = {
            service,
            date,
            time,
            status: "Pending"
        };

        window.appData.appointments.push(newAppointment);

        window.appData.history.push({
            ...newAppointment,
            action: "Created",
            timestamp: new Date().toLocaleString()
        });

        saveData();
        renderAppointments();
        renderHistory();

        alert("Appointment successfully booked!");
        form.reset();
    });
}

/* =========================
   CANCEL
========================= */
function cancelAppointment(index) {

    const removed = window.appData.appointments.splice(index, 1)[0];

    window.appData.history.push({
        ...removed,
        action: "Cancelled",
        timestamp: new Date().toLocaleString()
    });

    saveData();
    renderAppointments();
    renderHistory();
}

/* =========================
   RESCHEDULE
========================= */
function rescheduleAppointment(index) {

    const appt = window.appData.appointments[index];

    const newDate = prompt("New date (YYYY-MM-DD):");
    const newTime = prompt("New time (HH:MM):");

    if (!newDate || !newTime) return;

    window.appData.history.push({
        ...appt,
        action: "Rescheduled",
        oldDate: appt.date,
        oldTime: appt.time,
        newDate,
        newTime,
        timestamp: new Date().toLocaleString()
    });

    appt.date = newDate;
    appt.time = newTime;
    appt.status = "Rescheduled";

    saveData();
    renderAppointments();
    renderHistory();
}