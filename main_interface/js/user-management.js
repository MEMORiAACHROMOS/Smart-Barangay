// Supabase configuration
// CHANGED: Supabase already initialized in dashboard-script.js, just reuse the client
const supabase = window.supabase.createClient(
    'https://fdywrbdjrtrpnyyhrpoj.supabase.co',
    'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH'
);

const ROLES = { 1: 'Admin', 2: 'Nurse', 3: 'Doctor' };
const ROLE_IDS = { 'Admin': 1, 'Nurse': 2, 'Doctor': 3 };

function toggleStatusColor(select) {
    if (select.value === 'inactive') {
        select.classList.add('inactive');
        select.classList.remove('active-status');
    } else {
        select.classList.remove('inactive');
        select.classList.add('active-status');
    }
}

function buildRow(user) {
    const roleId = user.Role_ID || 1;
    const statusClass = user.Status === 'inactive' ? 'inactive' : 'active-status';
    return `
        <td>${escapeHtml(user.Username)}</td>
        <td>••••••••</td>
        <td>
            <select class="role-select" data-user-id="${user.User_ID}" onchange="updateUserRole(this)">
                <option value="1" ${roleId === 1 ? 'selected' : ''}>Admin</option>
                <option value="2" ${roleId === 2 ? 'selected' : ''}>Nurse</option>
                <option value="3" ${roleId === 3 ? 'selected' : ''}>Doctor</option>
            </select>
        </td>
        <td>
            <select class="status-select ${statusClass}" data-user-id="${user.User_ID}" onchange="updateUserStatus(this); toggleStatusColor(this)">
                <option value="active" ${user.Status === 'active' ? 'selected' : ''}>Active</option>
                <option value="inactive" ${user.Status === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
        </td>
        <td>
            <button class="delete" onclick="deleteUserConfirm(${user.User_ID}, '${escapeHtml(user.Username)}')">Delete</button>
        </td>
    `;
}

// CHANGED: Removed join with User_ManagementTbl to avoid FK join issues
async function loadUsers() {
    try {
        const { data, error } = await supabase
            .from('LoginTbl')
            .select('*')
            .order('Created_At', { ascending: false });

        if (error) throw error;
        renderUsers(data);
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Failed to load users: ' + error.message);
    }
}

function renderUsers(data) {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No users found</td></tr>';
        return;
    }
    data.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = buildRow(user);
        tbody.appendChild(row);
    });
}

async function updateUserRole(selectElement) {
    const userId = selectElement.dataset.userId;
    const roleId = parseInt(selectElement.value);
    try {
        const { error } = await supabase.from('LoginTbl').update({ Role_ID: roleId }).eq('User_ID', userId);
        if (error) throw error;
        alert(`Role updated to ${ROLES[roleId]} successfully!`);
    } catch (error) {
        alert('Failed to update role: ' + error.message);
        loadUsers();
    }
}

async function updateUserStatus(selectElement) {
    const userId = selectElement.dataset.userId;
    const status = selectElement.value;
    try {
        const { error } = await supabase.from('LoginTbl').update({ Status: status }).eq('User_ID', userId);
        if (error) throw error;
        // Status updated successfully; UI will update automatically.
    } catch (error) {
        alert('Failed to update status: ' + error.message);
        loadUsers();
    }
}

async function deleteUserConfirm(userId, username) {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;
    try {
        const { error } = await supabase.from('LoginTbl').delete().eq('User_ID', userId);
        if (error) throw error;
        alert(`User "${username}" deleted successfully!`);
        loadUsers();
    } catch (error) {
        alert('Failed to delete user: ' + error.message);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// CHANGED: Removed join with User_ManagementTbl
async function searchUsername(searchTerm) {
    try {
        let query = supabase.from('LoginTbl').select('*');
        if (searchTerm.trim()) query = query.ilike('Username', `%${searchTerm}%`);
        const { data, error } = await query.order('Created_At', { ascending: false });
        if (error) throw error;
        renderUsers(data);
    } catch (error) {
        console.error('Error searching:', error);
    }
}

// CHANGED: Removed join with User_ManagementTbl
async function filterByRole(roleFilter) {
    try {
        let query = supabase.from('LoginTbl').select('*');
        if (roleFilter !== 'All Roles') {
            const roleId = ROLE_IDS[roleFilter];
            if (roleId) query = query.eq('Role_ID', roleId);
        }
        const { data, error } = await query.order('Created_At', { ascending: false });
        if (error) throw error;
        renderUsers(data);
    } catch (error) {
        console.error('Error filtering:', error);
    }
}

window.addEventListener('DOMContentLoaded', function () {
    const openBtn = document.getElementById('openAddUserModal');
    const closeBtn = document.getElementById('closeAddUserModal');
    const modal = document.getElementById('addUserModal');
    const form = document.getElementById('addUserForm');
    const searchInput = document.querySelector('.top-bar input');
    const roleFilter = document.querySelector('.top-bar select');

    loadUsers();

    openBtn.addEventListener('click', () => modal.style.display = 'flex');
    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; form.reset(); });
    modal.addEventListener('click', e => { if (e.target === modal) { modal.style.display = 'none'; form.reset(); } });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('newUsername').value.trim();
        const password = document.getElementById('newPassword').value.trim();
        const role = document.getElementById('newRole').value;
        const status = document.getElementById('newStatus').value;

        if (!username || !password) { alert('Please fill in all fields'); return; }

        try {
            const { data: hashed, error: hashError } = await supabase.rpc('hash_password', { input_password: password });
            if (hashError) throw hashError;

            const { error } = await supabase.from('LoginTbl').insert([{
                Username: username,
                PasswordHash: hashed,
                Role_ID: ROLE_IDS[role],
                Status: status.toLowerCase(),
                Created_At: new Date()
            }]);
            if (error) throw error;

            alert('User registered successfully!');
            modal.style.display = 'none';
            form.reset();
            loadUsers();
        } catch (error) {
            alert('Failed to register user: ' + error.message);
        }
    });

    if (searchInput) searchInput.addEventListener('input', () => searchUsername(searchInput.value));
    if (roleFilter) roleFilter.addEventListener('change', () => filterByRole(roleFilter.value));
});