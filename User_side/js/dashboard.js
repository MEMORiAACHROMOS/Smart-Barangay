document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
});

async function loadDashboard() {
    try {
        let data;

        try {
            const response = await fetch("http://localhost:3000/api/dashboard");

            if (!response.ok) throw new Error("No backend yet");

            data = await response.json();

        } catch (err) {
            console.warn("Using mock data instead");

            data = {
                user: { name: "Juan Dela Cruz" },
                appointment: {
                    service: "Prenatal Care",
                    date: "May 10, 2026 - 10:00 AM",
                    doctor: "Dr. Santos",
                    status: "Confirmed"
                },
                events: [
                    "Free Vaccination Drive - May 15",
                    "Health Seminar for Mothers - May 20",
                    "General Checkup Week - May 25"
                ]
            };
        }

        // =========================
        // GREETING
        // =========================
        const greetingCard = document.getElementById("greetingCard");
        greetingCard.querySelector("h2").textContent =
            `Good day, ${data.user.name}`;

        // =========================
        // APPOINTMENT (with status color)
        // =========================
        const appointmentContainer = document.getElementById("appointmentContent");

        const status = data.appointment.status.toLowerCase();

        let statusColor = "#333";
        if (status === "confirmed") statusColor = "#00c267";
        else if (status === "pending") statusColor = "#f59e0b";
        else if (status === "cancelled") statusColor = "#ef4444";

        appointmentContainer.innerHTML = `
            <p>
                <i class="fa-solid fa-stethoscope"></i>
                <strong>Service:</strong> ${data.appointment.service}
            </p>

            <p>
                <i class="fa-solid fa-calendar-days"></i>
                <strong>Date:</strong> ${data.appointment.date}
            </p>

            <p>
                <i class="fa-solid fa-user-doctor"></i>
                <strong>Doctor:</strong> ${data.appointment.doctor}
            </p>

            <p>
                <i class="fa-solid fa-circle-info"></i>
                <strong>Status:</strong>
                <span style="color:${statusColor}; font-weight:600;">
                    ${data.appointment.status}
                </span>
            </p>
        `;

        // =========================
        // EVENTS
        // =========================
        const eventsContainer = document.getElementById("eventsContent");
        eventsContainer.innerHTML = "";

        data.events.forEach(event => {
            const p = document.createElement("p");
            p.innerHTML = `<i class="fa-solid fa-bullhorn"></i> ${event}`;
            eventsContainer.appendChild(p);
        });

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}