// Get elements
const submitBtn = document.getElementById("submitAppointment");

submitBtn.addEventListener("click", function () {

    // Get values
    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const service = document.getElementById("service").value;
    const reason = document.getElementById("reason").value.trim();

    // Validation
    if (!fullname || !email || !contact || !date || !time || !service || !reason) {
        alert("Please fill in all fields.");
        return;
    }

    // Email format check
    if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Contact number check (basic)
    if (!/^[0-9]{10,13}$/.test(contact)) {
        alert("Enter a valid contact number (10-13 digits).");
        return;
    }

    // Date validation (no past dates)
    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
        alert("Please select a valid future date.");
        return;
    }

    // Simulate sending data
    const appointmentData = {
        fullname,
        email,
        contact,
        date,
        time,
        service,
        reason
    };

    console.log("Appointment Request:", appointmentData);

    // Success message
    alert("Appointment request submitted successfully!");

    // Clear form
    document.getElementById("fullname").value = "";
    document.getElementById("email").value = "";
    document.getElementById("contact").value = "";
    document.getElementById("date").value = "";
    document.getElementById("time").value = "";
    document.getElementById("service").value = "";
    document.getElementById("reason").value = "";
});


// Email validation function
function validateEmail(email) {
    const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return re.test(email);
}