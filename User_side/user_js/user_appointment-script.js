// Get elements
const submitBtn = document.getElementById("submitAppointment");

submitBtn.addEventListener("click", function () {

    // Prevent spam clicking
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";

    // Get values
    const fullname = document.getElementById("fullname").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const service = document.getElementById("service").value;
    const reason = document.getElementById("reason").value.trim();

    // Validation
    if (!fullname || !contact || !date || !time || !service || !reason) {
        alert("Please fill in all fields.");
        resetButton();
        return;
    }

    // Contact number check (PH friendly)
    if (!/^09\d{9}$/.test(contact) && !/^\+639\d{9}$/.test(contact)) {
        alert("Enter a valid Philippine contact number (e.g. 09123456789).");
        resetButton();
        return;
    }

    // Date validation (no past dates)
    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
        alert("Please select a valid future date.");
        resetButton();
        return;
    }

    // Simulated request delay (like real API)
    setTimeout(() => {

        const appointmentData = {
            fullname,
            contact,
            date,
            time,
            service,
            reason
        };

        console.log("Appointment Request:", appointmentData);

        alert("Appointment request submitted successfully!");

        // Clear form
        document.getElementById("fullname").value = "";
        document.getElementById("contact").value = "";
        document.getElementById("date").value = "";
        document.getElementById("time").value = "";
        document.getElementById("service").value = "";
        document.getElementById("reason").value = "";

        resetButton();

    }, 1000); // 1 second delay
});

// Reset button state
function resetButton() {
    submitBtn.disabled = false;
    submitBtn.innerText = "Submit Request";
}