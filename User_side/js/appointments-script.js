// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const blockedDates = ["2026-05-20", "2026-05-25"];

let currentFullName = '';
// ADDED: Store pending cancel ID
let pendingCancelId = null;

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    currentFullName = `${currentUser.firstname} ${currentUser.lastname}`;
    document.querySelector('#greetingCard h2').textContent = `Good day, ${currentFullName} 👋`;

    setupAppointmentForm(currentUser);
    loadMyAppointments(currentUser);
    renderEvents();
    loadBellNotifications();

    document.addEventListener('click', function (e) {
        const wrapper = document.getElementById('notifBellWrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            document.getElementById('notifDropdown')?.classList.remove('open');
        }
    });
});

// =========================
// NOTE CHARACTER COUNTER
// =========================
function updateNoteCount() {
    const textarea = document.getElementById('userNote');
    const counter  = document.getElementById('noteCount');
    if (!textarea || !counter) return;
    const len = textarea.value.length;
    counter.textContent = `${len} / 300`;
    counter.style.color = len >= 280 ? '#ef4444' : '#a7f3d0';
}

// =========================
// ADDED: SUCCESS MODAL FUNCTIONS
// =========================
function showSuccessModal(service, date, time, apptType, note) {
    const details = document.getElementById('successModalDetails');
    details.innerHTML = `
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${formatTime(time)}</p>
        <p><strong>Type:</strong> ${apptType}</p>
        ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
    `;
    const modal = document.getElementById('successModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSuccessModal(e) {
    if (e && e.target !== document.getElementById('successModal') && e.type === 'click') {
        if (!e.target.classList.contains('success-modal-overlay')) return;
    }
    document.getElementById('successModal').classList.remove('active');
    document.body.style.overflow = '';
}

// =========================
// ADDED: CANCEL CONFIRM MODAL FUNCTIONS
// Replaces browser confirm() with custom modal
// =========================
function showCancelModal(id) {
    pendingCancelId = id;
    document.getElementById('cancelConfirmModal').classList.add('active');
    document.body.style.overflow = 'hidden';

    // ADDED: Wire up the confirm button
    document.getElementById('cancelConfirmBtn').onclick = async () => {
        await doCancel(pendingCancelId);
        closeCancelModal();
    };
}

function closeCancelModal() {
    document.getElementById('cancelConfirmModal').classList.remove('active');
    document.body.style.overflow = '';
    pendingCancelId = null;
}

// =========================
// NOTIFICATION BELL
// =========================
function toggleNotifDropdown() {
    document.getElementById('notifDropdown')?.classList.toggle('open');
}

async function loadBellNotifications() {
    const dropdownBody = document.getElementById('notifDropdownBody');
    const dropClearBtn = document.getElementById('dropdownClearBtn');
    const badge        = document.getElementById('notifBadge');

    const { data, error } = await supabase
        .from('AppointmentsTbl')
        .select('Appointment_ID, Purpose, AppointmentDate, AppointmentTime, Status, Updated_At')
        .eq('Notes', currentFullName)
        .in('Status', ['Approved', 'Cancelled'])
        .order('Updated_At', { ascending: false });

    if (error || !data || !data.length) {
        if (dropdownBody) dropdownBody.innerHTML = '<p class="notif-empty">No notifications</p>';
        if (badge) badge.style.display = 'none';
        return;
    }

    const readKey  = `readNotifs_${currentFullName}`;
    const readList = JSON.parse(localStorage.getItem(readKey) || '[]');
    const unread   = data.filter(n => !readList.includes(n.Appointment_ID));

    if (unread.length > 0) {
        badge.textContent   = unread.length > 9 ? '9+' : unread.length;
        badge.style.display = 'flex';
        if (dropClearBtn) dropClearBtn.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
        if (dropClearBtn) dropClearBtn.style.display = 'none';
    }

    if (dropdownBody) {
        dropdownBody.innerHTML = data.map(notif => {
            const isRead     = readList.includes(notif.Appointment_ID);
            const isApproved = notif.Status === 'Approved';
            const date = notif.Updated_At
                ? new Date(notif.Updated_At).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '';
            return `
                <div class="notif-item ${isRead ? 'notif-read' : 'notif-unread'}"
                     onclick="markOneBellRead(${notif.Appointment_ID})">
                    <div class="notif-icon ${isApproved ? 'notif-icon-approved' : 'notif-icon-cancelled'}">
                        ${isApproved ? '✅' : '❌'}
                    </div>
                    <div class="notif-body">
                        <div class="notif-title">
                            Appointment ${isApproved ? 'Approved' : 'Cancelled'}
                            ${!isRead ? '<span class="notif-dot"></span>' : ''}
                        </div>
                        <div class="notif-desc">
                            Your <strong>${notif.Purpose || 'appointment'}</strong> on
                            <strong>${notif.AppointmentDate}</strong> has been
                            <span style="color:${isApproved ? '#00c267' : '#ef4444'}; font-weight:600;">
                                ${notif.Status.toLowerCase()}
                            </span>.
                        </div>
                        <div class="notif-time">${date}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function markOneBellRead(id) {
    const readKey  = `readNotifs_${currentFullName}`;
    const readList = JSON.parse(localStorage.getItem(readKey) || '[]');
    if (!readList.includes(id)) {
        readList.push(id);
        localStorage.setItem(readKey, JSON.stringify(readList));
        loadBellNotifications();
    }
}

async function markAllRead() {
    const readKey = `readNotifs_${currentFullName}`;
    const { data } = await supabase
        .from('AppointmentsTbl')
        .select('Appointment_ID')
        .eq('Notes', currentFullName)
        .in('Status', ['Approved', 'Cancelled']);

    if (data) {
        localStorage.setItem(readKey, JSON.stringify(data.map(d => d.Appointment_ID)));
        loadBellNotifications();
    }
}

// =========================
// LOAD MY APPOINTMENTS
// =========================
async function loadMyAppointments(currentUser) {
    const container = document.getElementById('appointmentContent');
    container.innerHTML = '<p>Loading...</p>';

    const fullName = `${currentUser.firstname} ${currentUser.lastname}`;

    const { data, error } = await supabase
        .from('AppointmentsTbl')
        .select('*')
        .eq('Notes', fullName)
        .order('AppointmentDate', { ascending: false });

    if (error) {
        container.innerHTML = '<p>Failed to load appointments.</p>';
        return;
    }

    if (!data || !data.length) {
        container.innerHTML = '<p>No appointments yet.</p>';
        return;
    }

    container.innerHTML = '';

    const active = data.filter(a => {
        const status = (a.Status || '').toLowerCase();
        return status !== 'cancelled' && status !== 'completed';
    });

    const history = data.filter(a => {
        const status = (a.Status || '').toLowerCase();
        return status === 'cancelled' || status === 'completed';
    });

    if (!active.length) {
        container.innerHTML = '<p>No active appointments.</p>';
    }

    active.forEach(appt => {
        const div = document.createElement('div');
        div.className = 'appt-card';

        const noteHtml = appt.UserNote
            ? `<p class="appt-user-note"><i class="fa-solid fa-note-sticky"></i> <em>${appt.UserNote}</em></p>`
            : '';

        div.innerHTML = `
            <p><strong>${appt.Purpose || '—'}</strong></p>
            <p>${appt.AppointmentDate} — ${formatTime(appt.AppointmentTime)}</p>
            <p>Type: ${appt.AppointmentType || '—'}</p>
            ${noteHtml}
            <span class="status ${(appt.Status || 'pending').toLowerCase()}">${appt.Status || 'Pending'}</span>
            <div style="margin-top:10px;">
                <!-- ADDED: Uses custom modal instead of confirm() -->
                <button onclick="showCancelModal(${appt.Appointment_ID})">Cancel</button>
            </div>
        `;
        container.appendChild(div);
    });

    renderHistory(history);
}

// =========================
// BOOK NEW APPOINTMENT
// ADDED: Uses custom success modal instead of alert()
// =========================
function setupAppointmentForm(currentUser) {
    const form      = document.getElementById('appointmentForm');
    const timeInput = document.getElementById('time');
    const dateInput = document.getElementById('date');

    dateInput.min = new Date().toISOString().split('T')[0];

    if (timeInput) {
        timeInput.addEventListener('change', () => {
            const hour = parseInt(timeInput.value.split(':')[0]);
            if (hour < 7 || hour >= 15) {
                alert('Clinic hours are only 7:00 AM to 3:00 PM.');
                timeInput.value = '';
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const service  = document.getElementById('service').value;
        const apptType = document.getElementById('apptType').value;
        const date     = document.getElementById('date').value;
        const time     = document.getElementById('time').value;
        const userNote = document.getElementById('userNote').value.trim();

        if (!service || !date || !time) {
            alert('Please complete all required fields.');
            return;
        }

        const hour = parseInt(time.split(':')[0]);
        if (hour < 7 || hour >= 15) {
            alert('Appointments allowed only 7AM - 3PM.');
            return;
        }

        if (blockedDates.includes(date)) {
            alert('No doctor available on this date.');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const { error } = await supabase.from('AppointmentsTbl').insert([{
            CreatedBy_User_ID: null,
            AppointmentDate:   date,
            AppointmentTime:   time,
            AppointmentType:   apptType,
            Purpose:           service,
            Status:            'Pending',
            Notes:             `${currentUser.firstname} ${currentUser.lastname}`,
            UserNote:          userNote || null
        }]);

        if (error) {
            alert('Failed to book appointment: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Appointment';
            return;
        }

        // ADDED: Show custom success modal instead of alert()
        showSuccessModal(service, date, time, apptType, userNote);

        form.reset();
        updateNoteCount();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Appointment';
        await loadMyAppointments(currentUser);
    });
}

// =========================
// CANCEL APPOINTMENT
// ADDED: Now called from modal confirm button
// =========================
async function doCancel(id) {
    const { error } = await supabase
        .from('AppointmentsTbl')
        .update({ Status: 'Cancelled' })
        .eq('Appointment_ID', id);

    if (error) { alert('Failed to cancel. Please try again.'); return; }

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    await loadMyAppointments(currentUser);
    loadBellNotifications();
}

// ADDED: Keep old function name for backward compatibility
async function cancelAppointment(id) {
    showCancelModal(id);
}

// =========================
// RENDER HISTORY
// =========================
function renderHistory(historyData) {
    const container = document.getElementById('historyContent');
    container.innerHTML = '';

    if (!historyData || !historyData.length) {
        container.innerHTML = '<p>No records yet</p>';
        return;
    }

    historyData.forEach(h => {
        const div = document.createElement('div');
        div.className = 'appt-card';

        const noteHtml = h.UserNote
            ? `<p class="appt-user-note"><i class="fa-solid fa-note-sticky"></i> <em>${h.UserNote}</em></p>`
            : '';

        div.innerHTML = `
            <p><strong>${h.Purpose || '—'}</strong></p>
            <p>${h.AppointmentDate} — ${formatTime(h.AppointmentTime)}</p>
            ${noteHtml}
            <span class="status ${(h.Status || '').toLowerCase()}">${h.Status || '—'}</span>
        `;
        container.appendChild(div);
    });
}

// =========================
// RENDER EVENTS
// =========================
function renderEvents() {
    const container = document.getElementById('eventsContent');
    container.innerHTML = '';
    const events = [
        'Free Vaccination Drive - Registered',
        'Health Seminar for Mothers - Registered'
    ];
    events.forEach(e => {
        const p = document.createElement('p');
        p.innerHTML = `<i class="fa-solid fa-check"></i> ${e}`;
        container.appendChild(p);
    });
}

// =========================
// HELPER: format time
// =========================
function formatTime(timeStr) {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
}