// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Holds all programs loaded from DB
let allPrograms = [];

// ADDED: Tracks which program is currently open in View Details
let currentViewedProgram = null;

// =========================
// INIT
// =========================
window.addEventListener('DOMContentLoaded', function () {
    loadPrograms();
    setupAddModal();
    setupEditModal();
    setupViewModal();
});

// =========================
// LOAD programs from Supabase
// =========================
async function loadPrograms() {
    const { data, error } = await supabase
        .from('ImmunizationProgramsTbl')
        .select('*')
        .order('Date', { ascending: false });

    if (error) { console.error('Failed to load programs:', error); return; }

    allPrograms = data || [];
    renderTable(allPrograms);
}

// =========================
// RENDER table rows
// =========================
function renderTable(programs) {
    const tbody = document.getElementById('programsTableBody');
    tbody.innerHTML = '';

    if (!programs.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#888;">No events found.</td></tr>';
        return;
    }

    programs.forEach(prog => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${prog.EventName || '—'}</td>
            <td>${prog.TypeOfEvent || '—'}</td>
            <td>${prog.Date || '—'}</td>
            <td>${prog.Location || '—'}</td>
            <td><span class="${getStatusClass(prog.Status)}">${prog.Status || '—'}</span></td>
            <td>
                <button class="btn" onclick="openEditModal(${prog.Programs_ID})">Edit</button>
                <button class="btn btn-delete" onclick="deleteProgram(${prog.Programs_ID})">Delete</button>
                <button class="btn view-details" onclick="openViewModal(${prog.Programs_ID})">View Details</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// =========================
// ADD EVENT
// =========================
function setupAddModal() {
    const modal    = document.getElementById('addEventModal');
    const closeBtn = document.getElementById('closeAddEventModal');
    const form     = document.getElementById('addEventForm');

    closeBtn.addEventListener('click', () => { modal.classList.remove('active'); form.reset(); });
    modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.remove('active'); form.reset(); } });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = form.querySelector('.modal-save');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        const { error } = await supabase.from('ImmunizationProgramsTbl').insert([{
            EventName:          document.getElementById('eventName').value.trim(),
            TypeOfEvent:        document.getElementById('eventType').value,
            Date:               document.getElementById('eventDate').value,
            Location:           document.getElementById('eventLocation').value.trim(),
            Status:             document.getElementById('eventStatus').value,
            Participants_Count: parseInt(document.getElementById('eventParticipants').value) || 0,
            Notes:              document.getElementById('eventNotes').value.trim()
        }]);

        if (error) {
            alert('Failed to save: ' + error.message);
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save';
            return;
        }

        modal.classList.remove('active');
        form.reset();
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
        await loadPrograms();
    });
}

function openModal() {
    document.getElementById('addEventModal').classList.add('active');
}

// =========================
// EDIT EVENT
// =========================
function setupEditModal() {
    const modal    = document.getElementById('editEventModal');
    const closeBtn = document.getElementById('closeEditEventModal');
    const form     = document.getElementById('editEventForm');

    closeBtn.addEventListener('click', () => { modal.classList.remove('active'); form.reset(); });
    modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.remove('active'); form.reset(); } });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = form.querySelector('.modal-save');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Updating...';

        const id = document.getElementById('editEventId').value;

        const { error } = await supabase.from('ImmunizationProgramsTbl').update({
            EventName:          document.getElementById('editEventName').value.trim(),
            TypeOfEvent:        document.getElementById('editEventType').value,
            Date:               document.getElementById('editEventDate').value,
            Location:           document.getElementById('editEventLocation').value.trim(),
            Status:             document.getElementById('editEventStatus').value,
            Participants_Count: parseInt(document.getElementById('editEventParticipants').value) || 0,
            Notes:              document.getElementById('editEventNotes').value.trim()
        }).eq('Programs_ID', id);

        if (error) {
            alert('Failed to update: ' + error.message);
            saveBtn.disabled = false;
            saveBtn.textContent = 'Update';
            return;
        }

        modal.classList.remove('active');
        form.reset();
        saveBtn.disabled = false;
        saveBtn.textContent = 'Update';
        await loadPrograms();
    });
}

async function openEditModal(id) {
    const prog = allPrograms.find(p => p.Programs_ID === id);
    if (!prog) return;

    document.getElementById('editEventId').value           = prog.Programs_ID;
    document.getElementById('editEventName').value         = prog.EventName || '';
    document.getElementById('editEventType').value         = prog.TypeOfEvent || '';
    document.getElementById('editEventDate').value         = prog.Date || '';
    document.getElementById('editEventLocation').value     = prog.Location || '';
    document.getElementById('editEventStatus').value       = prog.Status || '';
    document.getElementById('editEventParticipants').value = prog.Participants_Count || 0;
    document.getElementById('editEventNotes').value        = prog.Notes || '';

    document.getElementById('editEventModal').classList.add('active');
}

// =========================
// DELETE EVENT
// =========================
async function deleteProgram(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const { error } = await supabase
        .from('ImmunizationProgramsTbl')
        .delete()
        .eq('Programs_ID', id);

    if (error) { alert('Failed to delete: ' + error.message); return; }

    await loadPrograms();
}

// =========================
// VIEW DETAILS
// =========================
function setupViewModal() {
    const modal    = document.getElementById('viewEventModal');
    const closeBtn = document.getElementById('closeViewEventModal');
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
}

function openViewModal(id) {
    const prog = allPrograms.find(p => p.Programs_ID === id);
    if (!prog) return;

    // ADDED: Save current program so exportEventPDF() can use it
    currentViewedProgram = prog;

    document.getElementById('viewEventName').textContent         = prog.EventName || '—';
    document.getElementById('viewEventType').textContent         = prog.TypeOfEvent || '—';
    document.getElementById('viewEventDate').textContent         = prog.Date || '—';
    document.getElementById('viewEventLocation').textContent     = prog.Location || '—';
    document.getElementById('viewEventStatus').textContent       = prog.Status || '—';
    document.getElementById('viewEventParticipants').textContent = prog.Participants_Count ?? '—';
    document.getElementById('viewEventNotes').textContent        = prog.Notes || '—';

    document.getElementById('viewEventModal').classList.add('active');
}

// =========================
// ADDED: EXPORT TO PDF
// Builds a hidden styled div and calls window.print()
// @media print in CSS hides everything except #pdfPrintArea
// =========================
function exportEventPDF() {
    if (!currentViewedProgram) return;

    const prog = currentViewedProgram;

    // Format date nicely e.g. "May 19, 2026"
    const formattedDate = prog.Date
        ? new Date(prog.Date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    // Today's date for the footer
    const generatedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    // Remove old print area if exists
    const existing = document.getElementById('pdfPrintArea');
    if (existing) existing.remove();

    // Build the print area
    const printArea = document.createElement('div');
    printArea.id = 'pdfPrintArea';
    printArea.innerHTML = `
        <style>
            #pdfPrintArea {
                font-family: Arial, sans-serif;
                padding: 40px;
                color: #111;
            }
            #pdfPrintArea .pdf-header {
                text-align: center;
                border-bottom: 3px solid #065f46;
                padding-bottom: 16px;
                margin-bottom: 24px;
            }
            #pdfPrintArea .pdf-header h1 {
                color: #065f46;
                font-size: 20px;
                margin: 0 0 4px 0;
            }
            #pdfPrintArea .pdf-header p {
                font-size: 13px;
                color: #555;
                margin: 0;
            }
            #pdfPrintArea .pdf-title {
                font-size: 17px;
                font-weight: bold;
                color: #065f46;
                margin-bottom: 20px;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            #pdfPrintArea .pdf-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            #pdfPrintArea .pdf-table th {
                background: #065f46;
                color: white;
                padding: 10px 14px;
                text-align: left;
                font-size: 13px;
                width: 35%;
            }
            #pdfPrintArea .pdf-table td {
                padding: 10px 14px;
                border: 1px solid #ddd;
                font-size: 13px;
                background: #f9f9f9;
            }
            #pdfPrintArea .pdf-table tr:nth-child(even) td {
                background: #ffffff;
            }
            #pdfPrintArea .pdf-notes-box {
                border: 1px solid #ccc;
                border-radius: 6px;
                padding: 14px;
                background: #f4faf7;
                margin-bottom: 30px;
            }
            #pdfPrintArea .pdf-notes-box h3 {
                margin: 0 0 8px 0;
                color: #065f46;
                font-size: 14px;
            }
            #pdfPrintArea .pdf-notes-box p {
                margin: 0;
                font-size: 13px;
                color: #444;
            }
            #pdfPrintArea .pdf-signature-row {
                display: flex;
                justify-content: space-between;
                margin-top: 50px;
                margin-bottom: 10px;
            }
            #pdfPrintArea .pdf-signature-box {
                text-align: center;
                width: 40%;
            }
            #pdfPrintArea .pdf-signature-box .sig-line {
                border-top: 1px solid #333;
                margin-bottom: 6px;
            }
            #pdfPrintArea .pdf-signature-box p {
                font-size: 12px;
                color: #555;
                margin: 0;
            }
            #pdfPrintArea .pdf-footer {
                text-align: center;
                font-size: 11px;
                color: #888;
                border-top: 1px solid #ddd;
                padding-top: 12px;
            }
        </style>

        <!-- Header -->
        <div class="pdf-header">
            <h1>Smart Barangay Health Information System</h1>
            <p>Immunization and Programs — Official Event Report</p>
        </div>

        <!-- Title -->
        <div class="pdf-title">Event Details Report</div>

        <!-- Details Table -->
        <table class="pdf-table">
            <tr>
                <th>Event Name</th>
                <td>${prog.EventName || '—'}</td>
            </tr>
            <tr>
                <th>Type of Event</th>
                <td>${prog.TypeOfEvent || '—'}</td>
            </tr>
            <tr>
                <th>Date</th>
                <td>${formattedDate}</td>
            </tr>
            <tr>
                <th>Location</th>
                <td>${prog.Location || '—'}</td>
            </tr>
            <tr>
                <th>Status</th>
                <td>${prog.Status || '—'}</td>
            </tr>
            <tr>
                <th>Participants Count</th>
                <td>${prog.Participants_Count ?? '—'}</td>
            </tr>
            <tr>
                <th>Event ID</th>
                <td>${prog.Programs_ID || '—'}</td>
            </tr>
        </table>

        <!-- Notes -->
        <div class="pdf-notes-box">
            <h3>Notes / Remarks</h3>
            <p>${prog.Notes || 'No notes provided.'}</p>
        </div>

        <!-- Signature Lines -->
        <div class="pdf-signature-row">
            <div class="pdf-signature-box">
                <div class="sig-line"></div>
                <p>Prepared by</p>
            </div>
            <div class="pdf-signature-box">
                <div class="sig-line"></div>
                <p>Noted by / Health Officer</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="pdf-footer">
            Generated on: ${generatedDate} &nbsp;|&nbsp; Smart Barangay Health Information System &copy; 2026
        </div>
    `;

    document.body.appendChild(printArea);
    window.print();

    // Clean up after printing
    setTimeout(() => {
        const area = document.getElementById('pdfPrintArea');
        if (area) area.remove();
    }, 1000);
}

// =========================
// SEARCH
// =========================
function searchPrograms() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allPrograms.filter(prog =>
        (prog.EventName || '').toLowerCase().includes(query) ||
        (prog.TypeOfEvent || '').toLowerCase().includes(query) ||
        (prog.Location || '').toLowerCase().includes(query)
    );
    renderTable(filtered);
}

// =========================
// HELPERS
// =========================
function getStatusClass(status) {
    switch ((status || '').toLowerCase()) {
        case 'upcoming':  return 'status-upcoming';
        case 'scheduled': return 'status-scheduled';
        case 'ongoing':   return 'status-ongoing';
        case 'done':      return 'status-done';
        default:          return '';
    }
}