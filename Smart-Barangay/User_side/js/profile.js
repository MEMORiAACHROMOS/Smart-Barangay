// =========================
// SUPABASE SETUP
// =========================
const supabase = window.supabase.createClient(
    'https://fdywrbdjrtrpnyyhrpoj.supabase.co',
    'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH'
);

let currentUser = null;
let userRecord  = null;

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', async () => {
    currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    await loadProfile();
});

// =========================
// LOAD profile from UserRegistrationTbl
// =========================
async function loadProfile() {
    const { data, error } = await supabase
        .from('UserRegistrationTbl')
        .select('*')
        .eq('Registration_ID', currentUser.id)
        .single();

    if (error || !data) {
        console.error('Failed to load profile:', error);
        return;
    }

    userRecord = data;
    renderProfile(data);
    fillEditForm(data);
}

// =========================
// RENDER personal info tab
// =========================
function renderProfile(data) {
    const fullName = `${data.FirstName || ''} ${data.MiddleName ? data.MiddleName + ' ' : ''}${data.LastName || ''} ${data.Suffix || ''}`.trim();

    // Header
    document.getElementById('profileFullName').textContent = fullName || '—';
    document.getElementById('profileEmail').textContent    = data.Email || '—';
    document.getElementById('profileStatus').textContent   = data.Status || 'Active';

    // Info grid
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
// FILL edit form with current data
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
// SAVE profile changes
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

    // Update sessionStorage name too
    currentUser.firstname = updates.FirstName;
    currentUser.lastname  = updates.LastName;
    currentUser.email     = updates.Email;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

    msg.textContent = '✓ Profile updated successfully!';
    msg.style.color = 'green';

    // Reload profile display
    await loadProfile();
}

// =========================
// CHANGE PASSWORD
// Uses Supabase RPC verify_password + update PasswordHash
// =========================
async function changePassword() {
    const msg         = document.getElementById('pwMsg');
    const newPw       = document.getElementById('newPassword').value;
    const confirmPw   = document.getElementById('confirmPassword').value;
    msg.textContent   = '';

    if (!newPw || !confirmPw) {
        msg.textContent = 'Please fill in both fields.';
        msg.style.color = 'red';
        return;
    }

    if (newPw !== confirmPw) {
        msg.textContent = 'Passwords do not match.';
        msg.style.color = 'red';
        return;
    }

    if (newPw.length < 6) {
        msg.textContent = 'Password must be at least 6 characters.';
        msg.style.color = 'red';
        return;
    }

    // Hash new password using Supabase RPC (same bcrypt function used at register)
    const { data: hashed, error: hashError } = await supabase
        .rpc('hash_password', { password: newPw });

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
    // Hide all tabs
    document.getElementById('tab-info').style.display     = 'none';
    document.getElementById('tab-edit').style.display     = 'none';
    document.getElementById('tab-password').style.display = 'none';

    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    // Show selected tab
    document.getElementById(`tab-${tab}`).style.display = 'block';

    // Set active button
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