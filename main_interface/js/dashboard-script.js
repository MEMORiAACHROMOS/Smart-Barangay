// ADDED: Supabase setup
const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ADDED: Load all dashboard data on page load
window.addEventListener('DOMContentLoaded', async function () {
    await loadSummaryCards();
    await loadUpcomingAppointments();
    await loadLowStockAlerts();
    await loadImmunizationSummary();
});

// ADDED: Load summary card counts from all tables
async function loadSummaryCards() {
    // Total users from LoginTbl
    const { count: userCount } = await supabase
        .from('LoginTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('dashTotalUsers').textContent = userCount || 0;

    // Total patients from Patient_RecordsTbl
    const { count: patientCount } = await supabase
        .from('Patient_RecordsTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('dashTotalPatients').textContent = patientCount || 0;

    // Pending appointments from AppointmentsTbl
    const { count: pendingCount } = await supabase
        .from('AppointmentsTbl')
        .select('*', { count: 'exact', head: true })
        .ilike('Status', '%pending%');
    document.getElementById('dashPendingAppointments').textContent = pendingCount || 0;

    // Total immunization programs from ImmunizationProgramsTbl
    const { count: immunCount } = await supabase
        .from('ImmunizationProgramsTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('dashTotalImmunizations').textContent = immunCount || 0;

    // Total inventory items from InventoryTbl
    const { count: invCount } = await supabase
        .from('InventoryTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('dashTotalInventory').textContent = invCount || 0;
}

// FIXED: Removed FK join, removed date filter, using Notes column for patient name
async function loadUpcomingAppointments() {
    const { data, error } = await supabase
        .from('AppointmentsTbl')
        .select('Notes, AppointmentDate, AppointmentTime, Purpose, Status')
        .ilike('Status', '%pending%')
        .order('AppointmentDate', { ascending: true })
        .limit(5);

    const tbody = document.getElementById('upcomingAppointmentsBody');

    if (error) {
        console.error('Appointments error:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Error loading appointments.</td></tr>';
        return;
    }

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No upcoming appointments.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    data.forEach(appt => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appt.Notes || '—'}</td>
            <td>${appt.AppointmentDate || ''}</td>
            <td>${appt.AppointmentTime || ''}</td>
            <td>${appt.Purpose || ''}</td>
            <td style="color:orange; font-weight:bold;">${appt.Status || ''}</td>
        `;
        tbody.appendChild(row);
    });
}

// ADDED: Load low stock alerts from InventoryTbl
async function loadLowStockAlerts() {
    const { data, error } = await supabase
        .from('InventoryTbl')
        .select('Item, Quantity, MinStockLevel');

    const list = document.getElementById('lowStockList');

    if (error || !data) {
        list.innerHTML = '<li>Unable to load inventory.</li>';
        return;
    }

    // ADDED: Filter items where quantity is at or below minimum stock level
    const lowStock = data.filter(item =>
        item.Quantity !== null &&
        item.MinStockLevel !== null &&
        item.Quantity <= item.MinStockLevel
    );

    if (lowStock.length === 0) {
        list.innerHTML = '<li style="color:green;">✅ All items are sufficiently stocked.</li>';
        return;
    }

    list.innerHTML = '';
    lowStock.forEach(item => {
        const li = document.createElement('li');
        li.style.color = 'red';
        li.textContent = `${item.Item} (${item.Quantity} remaining)`;
        list.appendChild(li);
    });
}

// ADDED: Load immunization summary from ImmunizationProgramsTbl
async function loadImmunizationSummary() {
    // Total programs
    const { count: total } = await supabase
        .from('ImmunizationProgramsTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('dashTotalPrograms').textContent = total || 0;

    // Active programs
    const { count: active } = await supabase
        .from('ImmunizationProgramsTbl')
        .select('*', { count: 'exact', head: true })
        .ilike('Status', '%active%');
    document.getElementById('dashActivePrograms').textContent = active || 0;
}