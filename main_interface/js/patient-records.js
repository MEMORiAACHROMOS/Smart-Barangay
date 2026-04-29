// Supabase setup
const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Load patients ──────────────────────────────
async function loadPatients() {
    const { data, error } = await supabase
        .from('Patient_RecordsTbl')
        .select('*')
        .order('PatientRecord_ID', { ascending: false });

    if (error) { console.error('Load error:', error); return; }
    renderPatients(data);
}

// ── Render patients ────────────────────────────
function renderPatients(data) {
    const tbody = document.getElementById('patientTableBody');
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No patients found.</td></tr>';
        return;
    }

    data.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.Name || ''}</td>
            <td>${p.DataOfBirth || ''}</td>
            <td>${p.Sex || ''}</td>
            <td>${p.Contact || ''}</td>
            <td>${p.Address || ''}</td>
            <td>${p.BloodType || ''}</td>
            <td style="display:flex; gap:5px; flex-wrap:wrap;">
                <button class="btn" data-id="${p.PatientRecord_ID}" data-action="view">View</button>
                <button class="btn" data-id="${p.PatientRecord_ID}" data-action="edit">Edit</button>
                <button class="btn" style="background:#d9534f;" data-id="${p.PatientRecord_ID}" data-action="delete">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ── Save new patient ───────────────────────────
async function savePatient() {
    const name = document.getElementById('patientName').value.trim();
    const dob = document.getElementById('patientDOB').value;
    const sex = document.getElementById('patientSex').value;
    const contact = document.getElementById('patientContact').value.trim();
    const address = document.getElementById('patientAddress').value.trim();
    const bloodType = document.getElementById('patientBloodType').value;
    const allergies = document.getElementById('patientAllergies').value.trim();
    const medHistory = document.getElementById('patientMedHistory').value.trim();

    if (!name || !dob || !sex) {
        alert('Please fill in Name, Date of Birth, and Sex.');
        return;
    }

    const { error } = await supabase.from('Patient_RecordsTbl').insert([{
        Name: name,
        DataOfBirth: dob,
        Sex: sex,
        Contact: contact,
        Address: address,
        BloodType: bloodType,
        Allergies: allergies,
        MedicalHistory: medHistory
    }]);

    if (error) { alert('Failed to save: ' + error.message); return; }

    alert('Patient added successfully!');
    document.getElementById('patientModal').classList.remove('active');
    // CLEAR all form fields after saving
    document.getElementById('patientName').value = '';
    document.getElementById('patientDOB').value = '';
    document.getElementById('patientSex').value = '';
    document.getElementById('patientContact').value = '';
    document.getElementById('patientAddress').value = '';
    document.getElementById('patientBloodType').value = '';
    document.getElementById('patientAllergies').value = '';
    document.getElementById('patientMedHistory').value = '';
    loadPatients();
}

// ── View patient ───────────────────────────────
async function viewPatient(id) {
    const { data, error } = await supabase
        .from('Patient_RecordsTbl')
        .select('*')
        .eq('PatientRecord_ID', id)
        .single();

    if (error || !data) { alert('Failed to load patient.'); return; }

    document.getElementById('viewName').textContent = data.Name || '';
    document.getElementById('viewDOB').textContent = data.DataOfBirth || '';
    document.getElementById('viewSex').textContent = data.Sex || '';
    document.getElementById('viewContact').textContent = data.Contact || '';
    document.getElementById('viewAddress').textContent = data.Address || '';
    document.getElementById('viewBloodType').textContent = data.BloodType || '';
    document.getElementById('viewAllergies').textContent = data.Allergies || '';
    document.getElementById('viewMedHistory').textContent = data.MedicalHistory || '';
    document.getElementById('viewModal').classList.add('active');
}

// ── Open edit modal ────────────────────────────
async function openEditModal(id) {
    const { data, error } = await supabase
        .from('Patient_RecordsTbl')
        .select('*')
        .eq('PatientRecord_ID', id)
        .single();

    if (error || !data) { alert('Failed to load patient.'); return; }

    document.getElementById('editPatientId').value = data.PatientRecord_ID;
    document.getElementById('editName').value = data.Name || '';
    document.getElementById('editDOB').value = data.DataOfBirth || '';
    document.getElementById('editSex').value = data.Sex || '';
    document.getElementById('editContact').value = data.Contact || '';
    document.getElementById('editAddress').value = data.Address || '';
    document.getElementById('editBloodType').value = data.BloodType || '';
    document.getElementById('editAllergies').value = data.Allergies || '';
    document.getElementById('editMedHistory').value = data.MedicalHistory || '';
    document.getElementById('editModal').classList.add('active');
}

// ── Update patient ─────────────────────────────
async function updatePatient() {
    const id = document.getElementById('editPatientId').value;
    const { error } = await supabase.from('Patient_RecordsTbl').update({
        Name: document.getElementById('editName').value.trim(),
        DataOfBirth: document.getElementById('editDOB').value,
        Sex: document.getElementById('editSex').value,
        Contact: document.getElementById('editContact').value.trim(),
        Address: document.getElementById('editAddress').value.trim(),
        BloodType: document.getElementById('editBloodType').value,
        Allergies: document.getElementById('editAllergies').value.trim(),
        MedicalHistory: document.getElementById('editMedHistory').value.trim()
    }).eq('PatientRecord_ID', id);

    if (error) { alert('Failed to update: ' + error.message); return; }

    alert('Patient updated successfully!');
    document.getElementById('editModal').classList.remove('active');
    loadPatients();
}

// ── Delete patient ─────────────────────────────
async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    const { error } = await supabase
        .from('Patient_RecordsTbl')
        .delete()
        .eq('PatientRecord_ID', id);

    if (error) { alert('Failed to delete: ' + error.message); return; }
    alert('Patient deleted!');
    loadPatients();
}

// ── Search ─────────────────────────────────────
async function searchPatient() {
    const term = document.getElementById('searchInput').value.trim();
    const { data, error } = await supabase
        .from('Patient_RecordsTbl')
        .select('*')
        .ilike('Name', `%${term}%`)
        .order('PatientRecord_ID', { ascending: false });

    if (error) { console.error(error); return; }
    renderPatients(data);
}

// ADDED: Export patient details to PDF
// Opens a styled print window matching the system's green theme
function exportPatientPDF() {
    // ADDED: Grab all visible patient details from the view modal
    const name = document.getElementById('viewName').textContent;
    const dob = document.getElementById('viewDOB').textContent;
    const sex = document.getElementById('viewSex').textContent;
    const contact = document.getElementById('viewContact').textContent;
    const address = document.getElementById('viewAddress').textContent;
    const bloodType = document.getElementById('viewBloodType').textContent;
    const allergies = document.getElementById('viewAllergies').textContent;
    const medHistory = document.getElementById('viewMedHistory').textContent;

    // ADDED: Format today's date for the export timestamp
    const today = new Date().toLocaleDateString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    // ADDED: Open a new blank window and write styled HTML into it
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Patient Record - ${name}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; color: #333; padding: 40px; }

                /* ADDED: Header bar styled with system green color */
                .header {
                    background: #065f46;
                    color: white;
                    padding: 20px 30px;
                    border-radius: 8px 8px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .header h1 { font-size: 20px; letter-spacing: 1px; }
                .header p { font-size: 12px; opacity: 0.85; }

                /* ADDED: Light green subheader strip below header */
                .subheader {
                    background: #f0fdf4;
                    border: 1px solid #065f46;
                    border-top: none;
                    padding: 12px 30px;
                    font-size: 13px;
                    color: #065f46;
                    font-weight: bold;
                }

                /* ADDED: Body content area with border */
                .body {
                    padding: 24px 30px;
                    border: 1px solid #ddd;
                    border-top: none;
                    border-radius: 0 0 8px 8px;
                }

                /* ADDED: Section titles with green underline */
                .section-title {
                    font-size: 13px;
                    font-weight: bold;
                    color: #065f46;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 2px solid #065f46;
                    padding-bottom: 4px;
                    margin: 20px 0 12px 0;
                }

                /* ADDED: Two-column grid for patient fields */
                .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .field { margin-bottom: 8px; }
                .field label {
                    font-size: 11px;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: block;
                    margin-bottom: 2px;
                }
                .field span { font-size: 14px; color: #222; font-weight: 500; }

                /* ADDED: Full width fields for longer content */
                .full-width { grid-column: 1 / -1; }

                /* ADDED: Footer at bottom of the exported PDF */
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 11px;
                    color: #aaa;
                    border-top: 1px solid #eee;
                    padding-top: 12px;
                }

                @media print {
                    body { padding: 20px; }
                }
            </style>
        </head>
        <body>
            <!-- ADDED: Styled header with system name and export date -->
            <div class="header">
                <div>
                    <h1>SMART BARANGAY</h1>
                    <p>Health Information System</p>
                </div>
                <div style="text-align:right;">
                    <p style="font-size:13px;">PATIENT RECORD</p>
                    <p style="font-size:11px; opacity:0.8;">Date Exported: ${today}</p>
                </div>
            </div>

            <div class="subheader">Patient Information Sheet</div>

            <div class="body">
                <!-- ADDED: Personal info section -->
                <div class="section-title">Personal Information</div>
                <div class="grid">
                    <div class="field">
                        <label>Full Name</label>
                        <span>${name || '—'}</span>
                    </div>
                    <div class="field">
                        <label>Date of Birth</label>
                        <span>${dob || '—'}</span>
                    </div>
                    <div class="field">
                        <label>Sex</label>
                        <span>${sex || '—'}</span>
                    </div>
                    <div class="field">
                        <label>Blood Type</label>
                        <span>${bloodType || '—'}</span>
                    </div>
                    <div class="field">
                        <label>Contact Number</label>
                        <span>${contact || '—'}</span>
                    </div>
                    <div class="field">
                        <label>Address</label>
                        <span>${address || '—'}</span>
                    </div>
                </div>

                <!-- ADDED: Medical info section -->
                <div class="section-title">Medical Information</div>
                <div class="grid">
                    <div class="field full-width">
                        <label>Allergies</label>
                        <span>${allergies || '—'}</span>
                    </div>
                    <div class="field full-width">
                        <label>Medical History</label>
                        <span>${medHistory || '—'}</span>
                    </div>
                </div>
            </div>

            <!-- ADDED: Footer copyright line -->
            <div class="footer">
                &copy; 2026 Smart Barangay Health Information System | All Rights Reserved
            </div>

            <script>
                // ADDED: Auto-trigger browser print dialog on load
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// ── Event listeners on DOMContentLoaded ───────
window.addEventListener('DOMContentLoaded', function () {
    loadPatients();

    // Add patient modal
    document.getElementById('addPatientBtn').addEventListener('click', () => {
        document.getElementById('patientModal').classList.add('active');
    });

    document.getElementById('cancelPatientBtn').addEventListener('click', () => {
        document.getElementById('patientModal').classList.remove('active');
    });

    document.getElementById('savePatientBtn').addEventListener('click', savePatient);

    // View modal close
    document.getElementById('closeViewBtn').addEventListener('click', () => {
        document.getElementById('viewModal').classList.remove('active');
    });

    // ADDED: Export PDF button event listener
    document.getElementById('exportPDFBtn').addEventListener('click', exportPatientPDF);

    // Edit modal
    document.getElementById('updatePatientBtn').addEventListener('click', updatePatient);

    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        document.getElementById('editModal').classList.remove('active');
    });

    // Table action buttons (delegated)
    document.getElementById('patientTableBody').addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (action === 'view') viewPatient(id);
        if (action === 'edit') openEditModal(id);
        if (action === 'delete') deletePatient(id);
    });
});