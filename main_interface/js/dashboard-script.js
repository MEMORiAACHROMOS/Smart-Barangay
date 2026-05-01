// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================
// LOAD ALL ON PAGE LOAD
// =========================
window.addEventListener('DOMContentLoaded', async function () {
    await loadSummaryCards();
    await loadUpcomingAppointments();
    await loadLowStockAlerts();
    await loadImmunizationSummary();
});

// =========================
// SUMMARY CARDS
// =========================
async function loadSummaryCards() {
    const { count: userCount } = await supabase
        .from('LoginTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('dashTotalUsers').textContent = userCount || 0;

    const { count: patientCount } = await supabase
        .from('Patient_RecordsTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('dashTotalPatients').textContent = patientCount || 0;

    const { count: pendingCount } = await supabase
        .from('AppointmentsTbl')
        .select('*', { count: 'exact', head: true })
        .ilike('Status', '%pending%');
    document.getElementById('dashPendingAppointments').textContent = pendingCount || 0;

    const { count: immunCount } = await supabase
        .from('ImmunizationProgramsTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('dashTotalImmunizations').textContent = immunCount || 0;

    const { count: invCount } = await supabase
        .from('InventoryTbl')
        .select('*', { count: 'exact', head: true });
    document.getElementById('dashTotalInventory').textContent = invCount || 0;
}

// =========================
// UPCOMING APPOINTMENTS
// =========================
async function loadUpcomingAppointments() {
    const { data, error } = await supabase
        .from('AppointmentsTbl')
        .select('Notes, AppointmentDate, AppointmentTime, Purpose, Status')
        .ilike('Status', '%pending%')
        .order('AppointmentDate', { ascending: true })
        .limit(5);

    const tbody = document.getElementById('upcomingAppointmentsBody');

    if (error) {
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

// =========================
// LOW STOCK ALERTS
// =========================
async function loadLowStockAlerts() {
    const { data, error } = await supabase
        .from('InventoryTbl')
        .select('Item, Quantity, MinStockLevel');

    const list = document.getElementById('lowStockList');

    if (error || !data) {
        list.innerHTML = '<li>Unable to load inventory.</li>';
        return;
    }

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
        const stockPercentage = (item.Quantity / item.MinStockLevel) * 100;
        const isCritical = stockPercentage <= 25;

        if (isCritical) {
            li.style.color = '#dc2626';
            li.style.fontWeight = '700';
            li.style.fontSize = '15px';
            li.style.backgroundColor = 'rgba(220, 38, 38, 0.08)';
            li.style.padding = '10px 12px';
            li.style.borderRadius = '6px';
            li.style.margin = '8px 0';
            li.textContent = `⚠️ CRITICAL: ${item.Item} (${item.Quantity} remaining)`;
        } else {
            li.style.color = '#ea580c';
            li.style.fontWeight = '700';
            li.style.fontSize = '15px';
            li.style.backgroundColor = 'rgba(234, 88, 12, 0.08)';
            li.style.padding = '10px 12px';
            li.style.borderRadius = '6px';
            li.style.margin = '8px 0';
            li.textContent = `🔶 Low Stock: ${item.Item} (${item.Quantity} remaining)`;
        }

        list.appendChild(li);
    });
}

// =========================
// FIXED: IMMUNIZATION SUMMARY
// Fixed column names: Date, TypeOfEvent, Participants_Count (not EventDate, Type, Participants)
// =========================
async function loadImmunizationSummary() {

    // FIXED: correct column names matching ImmunizationProgramsTbl
    const { data, error } = await supabase
        .from('ImmunizationProgramsTbl')
        .select('EventName, TypeOfEvent, Date, Location, Status, Participants_Count, Notes')
        .in('Status', ['Upcoming', 'Scheduled', 'Ongoing'])
        .order('Date', { ascending: true });

    // Total count
    const { count: total } = await supabase
        .from('ImmunizationProgramsTbl')
        .select('*', { count: 'exact', head: true });

    document.getElementById('dashTotalPrograms').textContent = total || 0;

    // Count per status
    const upcoming  = data ? data.filter(e => e.Status === 'Upcoming').length  : 0;
    const scheduled = data ? data.filter(e => e.Status === 'Scheduled').length : 0;
    const ongoing   = data ? data.filter(e => e.Status === 'Ongoing').length   : 0;

    document.getElementById('immunUpcomingCount').textContent  = upcoming;
    document.getElementById('immunScheduledCount').textContent = scheduled;
    document.getElementById('immunOngoingCount').textContent   = ongoing;

    const container = document.getElementById('immunEventsList');

    if (error) {
        console.error('Immunization load error:', error);
        container.innerHTML = '<p style="text-align:center; color:#ef4444;">Error loading events.</p>';
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#94a3b8;">No active events at the moment.</p>';
        return;
    }

    // Render each event as a card
    container.innerHTML = '';
    data.forEach(event => {

        // Color/icon config per status
        const statusConfig = {
            'Upcoming':  { color: '#3b82f6', bg: '#eff6ff', icon: '🗓️' },
            'Scheduled': { color: '#f59e0b', bg: '#fffbeb', icon: '📋' },
            'Ongoing':   { color: '#10b981', bg: '#ecfdf5', icon: '🔄' },
        };
        const config = statusConfig[event.Status] || { color: '#6b7280', bg: '#f9fafb', icon: '📌' };

       const card = document.createElement('div');
        // FIXED: use status class instead of inline bg so dark mode CSS can override it
        const statusClass = event.Status.toLowerCase(); // 'upcoming', 'scheduled', or 'ongoing'
        card.className = `immun-event-card immun-event-${statusClass}`;
        card.style.borderLeftColor = config.color;

        card.innerHTML = `
            <div class="immun-event-header">
                <span class="immun-event-icon">${config.icon}</span>
                <div class="immun-event-title-group">
                    <!-- FIXED: using EventName and TypeOfEvent -->
                    <span class="immun-event-name">${event.EventName || '—'}</span>
                    <span class="immun-event-type">${event.TypeOfEvent || ''}</span>
                </div>
                <span class="immun-event-status" style="background:${config.color};">${event.Status}</span>
            </div>
            <div class="immun-event-details">
                <!-- FIXED: using Date and Participants_Count -->
                <span>📅 ${event.Date || '—'}</span>
                <span>📍 ${event.Location || '—'}</span>
                <span>👥 ${event.Participants_Count ?? '—'} participants</span>
                ${event.Notes ? `<span>📝 ${event.Notes}</span>` : ''}
            </div>
        `;

        container.appendChild(card);
    });
}