// =========================
// SUPABASE SETUP
// =========================
const supabase = window.supabase.createClient(
    'https://fdywrbdjrtrpnyyhrpoj.supabase.co',
    'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH'
);

let currentUser = null;
let userRecord  = null;

// ADDED: Store full name globally for bell
let currentFullName = '';

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', async () => {
    currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    currentFullName = `${currentUser.firstname} ${currentUser.lastname}`;
    loadBellNotifications(); // ADDED

    // ADDED: Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        const wrapper = document.getElementById('notifBellWrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            document.getElementById('notifDropdown')?.classList.remove('open');
        }
    });

    await loadProfile();
});

// =========================
// ADDED: NOTIFICATION BELL
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
// LOAD PROFILE
// =========================
async function loadProfile() {
    const { data, error } = await supabase
        .from('UserRegistrationTbl')
        .select('*')
        .eq('Registration_ID', currentUser.id)
        .single();

    if (error || !data) { console.error('Failed to load profile:', error); return; }

    userRecord = data;
    renderProfile(data);
    fillEditForm(data);
}

// =========================
// RENDER PROFILE
// =========================
function renderProfile(data) {
    const fullName = `${data.FirstName || ''} ${data.MiddleName ? data.MiddleName + ' ' : ''}${data.LastName || ''} ${data.Suffix || ''}`.trim();

    document.getElementById('profileFullName').textContent = fullName || '—';
    document.getElementById('profileEmail').textContent    = data.Email || '—';
    document.getElementById('profileStatus').textContent   = data.Status || 'Active';

    document.getElementById('infoFirstName').textContent  = data.FirstName  || '—';
    document.getElementById('infoLastName').textContent   = data.LastName   || '—';
    document.getElementById('infoMiddleName').textContent = data.MiddleName || '—';
    document.getElementById('infoSuffix').textContent     = data.Suffix     || '—';
    document.getElementById('infoDOB').textContent        = data.DateOfBirth
        ? new Date(data.DateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';
    document.getElementById('infoEmail').textContent      = data.Email        || '—';
    document.getElementById('infoMobile').textContent     = data.MobileNumber || '—';
    document.getElementById('infoAddress').textContent    = data.Address      || '—';
    document.getElementById('infoCreatedAt').textContent  = data.Created_At
        ? new Date(data.Created_At).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';
}

// =========================
// FILL EDIT FORM
// =========================
function fillEditForm(data) {
    document.getElementById('editFirstName').value  = data.FirstName    || '';
    document.getElementById('editLastName').value   = data.LastName     || '';
    document.getElementById('editMiddleName').value = data.MiddleName   || '';
    document.getElementById('editSuffix').value     = data.Suffix       || '';
    document.getElementById('editDOB').value        = data.DateOfBirth  || '';
    document.getElementById('editEmail').value      = data.Email        || '';
    document.getElementById('editMobile').value     = data.MobileNumber || '';
    document.getElementById('editAddress').value    = data.Address      || '';
}

// =========================
// SAVE PROFILE
// =========================
async function saveProfile() {
    const msg = document.getElementById('editMsg');
    msg.textContent = '';

    const updates = {
        FirstName:    document.getElementById('editFirstName').value.trim(),
        LastName:     document.getElementById('editLastName').value.trim(),
        MiddleName:   document.getElementById('editMiddleName').value.trim(),
        Suffix:       document.getElementById('editSuffix').value.trim(),
        DateOfBirth:  document.getElementById('editDOB').value || null,
        Email:        document.getElementById('editEmail').value.trim(),
        MobileNumber: document.getElementById('editMobile').value.trim(),
        Address:      document.getElementById('editAddress').value.trim()
    };

    if (!updates.FirstName || !updates.LastName || !updates.Email) {
        msg.textContent = 'First name, last name, and email are required.';
        msg.style.color = 'red';
        return;
    }

    const { error } = await supabase
        .from('UserRegistrationTbl')
        .update(updates)
        .eq('Registration_ID', currentUser.id);

    if (error) {
        msg.textContent = 'Failed to update: ' + error.message;
        msg.style.color = 'red';
        return;
    }

    currentUser.firstname = updates.FirstName;
    currentUser.lastname  = updates.LastName;
    currentUser.email     = updates.Email;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

    msg.textContent = '✓ Profile updated successfully!';
    msg.style.color = 'green';
    await loadProfile();
}

// =========================
// CHANGE PASSWORD
// =========================
async function changePassword() {
    const msg       = document.getElementById('pwMsg');
    const newPw     = document.getElementById('newPassword').value;
    const confirmPw = document.getElementById('confirmPassword').value;
    msg.textContent = '';

    if (!newPw || !confirmPw) { msg.textContent = 'Please fill in both fields.'; msg.style.color = 'red'; return; }
    if (newPw !== confirmPw)  { msg.textContent = 'Passwords do not match.';     msg.style.color = 'red'; return; }
    if (newPw.length < 6)    { msg.textContent = 'Password must be at least 6 characters.'; msg.style.color = 'red'; return; }

    // FIXED: correct parameter name is input_password (matches register-script.js)
    const { data: hashed, error: hashError } = await supabase
        .rpc('hash_password', { input_password: newPw });

    if (hashError || !hashed) {
        msg.textContent = 'Failed to hash password. Try again.';
        msg.style.color = 'red';
        return;
    }

    const { error } = await supabase
        .from('UserRegistrationTbl')
        .update({ PasswordHash: hashed })
        .eq('Registration_ID', currentUser.id);

    if (error) {
        msg.textContent = 'Failed to update password: ' + error.message;
        msg.style.color = 'red';
        return;
    }

    msg.textContent = '✓ Password updated successfully!';
    msg.style.color = 'green';
    document.getElementById('newPassword').value     = '';
    document.getElementById('confirmPassword').value = '';
}

// =========================
// TAB SWITCHER
// =========================
function switchTab(tab) {
    document.getElementById('tab-info').style.display     = 'none';
    document.getElementById('tab-edit').style.display     = 'none';
    document.getElementById('tab-password').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${tab}`).style.display = 'block';
    const btnIndex = { info: 0, edit: 1, password: 2 };
    document.querySelectorAll('.tab-btn')[btnIndex[tab]].classList.add('active');
}

// =========================
// PASSWORD TOGGLE
// =========================
function togglePw(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}