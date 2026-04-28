// =========================
// Modal logic for Add Appointment
// Added/updated by Copilot
// =========================
document.addEventListener('DOMContentLoaded', function() {
    // Get modal and buttons
    const openBtn = document.querySelector('.appointments-topbar .btn'); // +Add Appointment button
    const modal = document.getElementById('addAppointmentModal');
    const closeBtn = document.getElementById('closeAddAppointmentModal');
    const form = document.getElementById('addAppointmentForm');

    if (openBtn && modal && closeBtn && form) {
        // Open modal
        openBtn.addEventListener('click', function() {
            modal.classList.add('active');
        });
        // Close modal
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            form.reset();
        });
        // Close modal when clicking outside modal content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                form.reset();
            }
        });
        // Handle form submission (frontend only, no backend)
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // You can add AJAX or table update logic here
            alert('Appointment created! (Demo only)');
            modal.classList.remove('active');
            form.reset();
        });
    }
});
// Modal logic for Add Appointment
window.addEventListener('DOMContentLoaded', function() {
    // Open modal
    const openBtn = document.querySelector('.appointments-topbar .btn'); // + Add Appointment button
    const modal = document.getElementById('addAppointmentModal');
    const closeBtn = document.getElementById('closeAddAppointmentModal');
    const form = document.getElementById('addAppointmentForm');

    if (openBtn && modal && closeBtn && form) {
        openBtn.addEventListener('click', function() {
            modal.style.display = 'flex';
        });
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            form.reset();
        });
        // Close modal when clicking outside modal content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                form.reset();
            }
        });
        // Handle form submission (frontend only, no backend)
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // You can add AJAX or table update logic here
            alert('Appointment created! (Demo only)');
            modal.style.display = 'none';
            form.reset();
        });
    }
});
