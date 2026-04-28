// JS for Immunization and Programs page
// Handles View Details button click

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.btn.view-details').forEach(function(btn) {
        btn.addEventListener('click', function() {
            alert('View Details clicked! (Implement modal or details logic here)');
        });
    });
});

// Modal logic for Add Event
window.addEventListener('DOMContentLoaded', function() {
    // Open modal
    const openBtn = document.querySelector('.programs-topbar .btn'); // + Add Event button
    const modal = document.getElementById('addEventModal');
    const closeBtn = document.getElementById('closeAddEventModal');
    const form = document.getElementById('addEventForm');

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
            alert('Event created! (Demo only)');
            modal.style.display = 'none';
            form.reset();
        });
    }
});

// --- Dynamic Allocated Medicines/Vaccines Logic ---
window.addEventListener('DOMContentLoaded', function() {
    const allocatedList = document.getElementById('allocatedList');
    const addAllocatedBtn = document.getElementById('addAllocatedBtn');

    if (allocatedList && addAllocatedBtn) {
        addAllocatedBtn.addEventListener('click', function() {
            // Clone the first row
            const firstRow = allocatedList.querySelector('.allocated-row');
            const newRow = firstRow.cloneNode(true);
            // Clear values
            newRow.querySelector('.allocated-name').value = '';
            newRow.querySelector('.allocated-qty').value = '';
            // Show remove button
            newRow.querySelector('.allocated-remove').style.display = 'inline-block';
            // Add remove event
            newRow.querySelector('.allocated-remove').onclick = function() {
                newRow.remove();
            };
            allocatedList.appendChild(newRow);
            // Show remove button on all but first row
            allocatedList.querySelectorAll('.allocated-row').forEach(function(row, idx) {
                row.querySelector('.allocated-remove').style.display = idx === 0 ? 'none' : 'inline-block';
            });
        });
        // Remove row event for the first row (if ever needed)
        allocatedList.querySelector('.allocated-remove').onclick = function() {
            if (allocatedList.children.length > 1) {
                this.parentElement.remove();
            }
        };
    }
});
