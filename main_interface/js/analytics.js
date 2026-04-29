// ADDED: Supabase setup
const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ADDED: Load all analytics data on page load
window.addEventListener('DOMContentLoaded', async function () {
    await loadOverviewCards();
    await loadAppointmentReport();
    await loadPatientReport();
    await loadInventoryReport();
    await loadUserSummary();
});

// ADDED: Load overview card counts
async function loadOverviewCards() {
    // Total Users from LoginTbl
    const { count: userCount } = await supabase
        .from('LoginTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('totalUsers').textContent = userCount || 0;

    // Total Patients from Patient_RecordsTbl
    const { count: patientCount } = await supabase
        .from('Patient_RecordsTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('totalPatients').textContent = patientCount || 0;

    // Pending Appointments from AppointmentsTbl
    const { count: pendingCount } = await supabase
        .from('AppointmentsTbl')
        .select('*', { count: 'exact', head: true })
        .ilike('Status', '%pending%');
    document.getElementById('pendingAppointments').textContent = pendingCount || 0;

    // Total Immunization Programs from ImmunizationProgramsTbl
    const { count: immunCount } = await supabase
        .from('ImmunizationProgramsTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('totalImmunizations').textContent = immunCount || 0;

    // Total Inventory Items from InventoryTbl
    const { count: invCount } = await supabase
        .from('InventoryTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('totalInventory').textContent = invCount || 0;
}

// ADDED: Load appointment report counts by status
async function loadAppointmentReport() {
    const { count: pending } = await supabase
        .from('AppointmentsTbl')
        .select('*', { count: 'exact', head: true })
        .ilike('Status', '%pending%');

    const { count: completed } = await supabase
        .from('AppointmentsTbl')
        .select('*', { count: 'exact', head: true })
        .ilike('Status', '%completed%');

    const { count: cancelled } = await supabase
        .from('AppointmentsTbl')
        .select('*', { count: 'exact', head: true })
        .ilike('Status', '%cancelled%');

    document.getElementById('apptPending').textContent = pending || 0;
    document.getElementById('apptCompleted').textContent = completed || 0;
    document.getElementById('apptCancelled').textContent = cancelled || 0;
}

// ADDED: Load patient report - total and new this month
async function loadPatientReport() {
    // Total patients
    const { count: total } = await supabase
        .from('Patient_RecordsTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('totalPatientsReport').textContent = total || 0;

    // New patients this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count: newThisMonth } = await supabase
        .from('Patient_RecordsTbl')
        .select('*', { count: 'exact', head: true })
        .gte('PatientRecord_ID', 0); // fallback — no created_at on patients table

    // ADDED: Since Patient_RecordsTbl has no created_at, we just show total for now
    document.getElementById('newPatientsMonth').textContent = '—';
}

// ADDED: Load inventory report - low stock and expired
async function loadInventoryReport() {
    // Low stock: items where Quantity <= MinStockLevel
    const { data: inventoryData } = await supabase
        .from('InventoryTbl')
        .select('Quantity, MinStockLevel, Expiry');

    if (inventoryData) {
        const today = new Date().toISOString().split('T')[0];

        // Count low stock items
        const lowStock = inventoryData.filter(item =>
            item.Quantity !== null &&
            item.MinStockLevel !== null &&
            item.Quantity <= item.MinStockLevel
        ).length;

        // Count expired items
        const expired = inventoryData.filter(item =>
            item.Expiry && item.Expiry < today
        ).length;

        document.getElementById('lowStock').textContent = lowStock;
        document.getElementById('expiredItems').textContent = expired;
    }
}

// ADDED: Load user summary counts by role and status
async function loadUserSummary() {
    // Total users
    const { count: total } = await supabase
        .from('LoginTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('totalUsersReport').textContent = total || 0;

    // Admin count (Role_ID = 1)
    const { count: adminCount } = await supabase
        .from('LoginTbl')
        .select('*', { count: 'exact', head: true })
        .eq('Role_ID', 1);
    document.getElementById('adminCount').textContent = adminCount || 0;

    // Nurse count (Role_ID = 2)
    const { count: nurseCount } = await supabase
        .from('LoginTbl')
        .select('*', { count: 'exact', head: true })
        .eq('Role_ID', 2);
    document.getElementById('nurseCount').textContent = nurseCount || 0;

    // Doctor count (Role_ID = 3)
    const { count: doctorCount } = await supabase
        .from('LoginTbl')
        .select('*', { count: 'exact', head: true })
        .eq('Role_ID', 3);
    document.getElementById('doctorCount').textContent = doctorCount || 0;

    // Active accounts
    const { count: activeCount } = await supabase
        .from('LoginTbl')
        .select('*', { count: 'exact', head: true })
        .eq('Status', 'active');
    document.getElementById('activeAccounts').textContent = activeCount || 0;
}