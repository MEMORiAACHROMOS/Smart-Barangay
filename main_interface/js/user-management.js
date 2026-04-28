// Modal open/close logic
window.addEventListener('DOMContentLoaded', function() {
    const openBtn = document.getElementById('openAddUserModal');
    const closeBtn = document.getElementById('closeAddUserModal');
    const modal = document.getElementById('addUserModal');
    const form = document.getElementById('addUserForm');

    if (openBtn && closeBtn && modal && form) {
        openBtn.addEventListener('click', function() {
            modal.style.display = 'flex';
        });
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            form.reset();
        });
        // Optional: close modal when clicking outside window
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
            alert('User registered! (Demo only)');
            modal.style.display = 'none';
            form.reset();
        });
    }
});
