// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let allItems = [];

// =========================
// INIT
// =========================
window.addEventListener('DOMContentLoaded', function () {
    loadInventory();
});

// =========================
// LOAD from Supabase
// =========================
async function loadInventory() {
    const { data, error } = await supabase
        .from('InventoryTbl')
        .select('*')
        .order('DateAdded', { ascending: false });

    if (error) {
        console.error('Supabase error:', error);
        document.getElementById('inventoryTableBody').innerHTML =
            '<tr><td colspan="7" style="text-align:center; color:red;">Failed to load: ' + error.message + '</td></tr>';
        return;
    }

    allItems = data || [];
    renderTable(allItems);
}

// =========================
// RENDER TABLE
// =========================
function renderTable(items) {
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = '';

    if (!items.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#888;">No items found.</td></tr>';
        return;
    }

    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.Item || '—'}</td>
            <td>${item.Category || '—'}</td>
            <td>${item.Quantity ?? '—'}</td>
            <td>${item.Unit || '—'}</td>
            <td><span class="${getStatusClass(item.Status)}">${item.Status || '—'}</span></td>
            <td>${item.Expiry || '—'}</td>
            <td>
                <button class="btn" onclick="openEditModal(${item.Inventory_ID})">Edit</button>
                <button class="btn btn-delete" onclick="deleteItem(${item.Inventory_ID})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// =========================
// AUTO STATUS based on quantity
// 0-10 = Critical, 11-25 = Low, 26+ = Normal
// =========================
function autoStatus(qtyId, statusId) {
    const qty = parseInt(document.getElementById(qtyId).value);
    const statusEl = document.getElementById(statusId);
    if (isNaN(qty)) return;

    if (qty <= 10) {
        statusEl.value = 'Critical';
    } else if (qty <= 25) {
        statusEl.value = 'Low';
    } else {
        statusEl.value = 'Normal';
    }
}

// =========================
// ADD MODAL
// =========================
function openAddModal() {
    document.getElementById('addItemModal').classList.add('active');
}

function closeAddModal() {
    document.getElementById('addItemModal').classList.remove('active');
    document.getElementById('addItem').value     = '';
    document.getElementById('addCategory').value = 'Medicine';
    document.getElementById('addQuantity').value = '';
    document.getElementById('addUnit').value     = '';
    document.getElementById('addStatus').value   = 'Normal';
    document.getElementById('addExpiry').value   = '';
    document.getElementById('addSupplier').value = '';
}

async function saveNewItem() {
    const itemName = document.getElementById('addItem').value.trim();
    if (!itemName) { alert('Item name is required.'); return; }

    const qty = parseInt(document.getElementById('addQuantity').value) || 0;

    const { error } = await supabase.from('InventoryTbl').insert([{
        Item:     itemName,
        Category: document.getElementById('addCategory').value,
        Quantity: qty,
        Unit:     document.getElementById('addUnit').value.trim(),
        // CHANGED: status is computed from quantity on save too
        Status:   computeStatus(qty),
        Expiry:   document.getElementById('addExpiry').value || null,
        Supplier: document.getElementById('addSupplier').value.trim()
    }]);

    if (error) { alert('Failed to add: ' + error.message); return; }
    closeAddModal();
    await loadInventory();
}

// =========================
// EDIT MODAL
// =========================
function openEditModal(id) {
    const item = allItems.find(i => i.Inventory_ID === id);
    if (!item) return;

    document.getElementById('editItemId').value   = item.Inventory_ID;
    document.getElementById('editItem').value     = item.Item || '';
    document.getElementById('editCategory').value = item.Category || 'Medicine';
    document.getElementById('editQuantity').value = item.Quantity ?? 0;
    document.getElementById('editUnit').value     = item.Unit || '';
    document.getElementById('editStatus').value   = item.Status || 'Normal';
    document.getElementById('editExpiry').value   = item.Expiry || '';
    document.getElementById('editSupplier').value = item.Supplier || '';

    document.getElementById('editItemModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editItemModal').classList.remove('active');
}

async function saveEditItem() {
    const id = document.getElementById('editItemId').value;
    const itemName = document.getElementById('editItem').value.trim();
    if (!itemName) { alert('Item name is required.'); return; }

    const qty = parseInt(document.getElementById('editQuantity').value) || 0;

    const { error } = await supabase.from('InventoryTbl').update({
        Item:     itemName,
        Category: document.getElementById('editCategory').value,
        Quantity: qty,
        Unit:     document.getElementById('editUnit').value.trim(),
        // CHANGED: status is computed from quantity on save too
        Status:   computeStatus(qty),
        Expiry:   document.getElementById('editExpiry').value || null,
        Supplier: document.getElementById('editSupplier').value.trim()
    }).eq('Inventory_ID', id);

    if (error) { alert('Failed to update: ' + error.message); return; }
    closeEditModal();
    await loadInventory();
}

// =========================
// DELETE
// =========================
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const { error } = await supabase
        .from('InventoryTbl')
        .delete()
        .eq('Inventory_ID', id);

    if (error) { alert('Failed to delete: ' + error.message); return; }
    await loadInventory();
}

// =========================
// SEARCH
// =========================
function searchInventory() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allItems.filter(item =>
        (item.Item || '').toLowerCase().includes(query) ||
        (item.Category || '').toLowerCase().includes(query) ||
        (item.Supplier || '').toLowerCase().includes(query)
    );
    renderTable(filtered);
}

// =========================
// CLOSE MODAL ON OUTSIDE CLICK
// =========================
window.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// =========================
// HELPERS
// =========================

// Computes status from quantity
function computeStatus(qty) {
    if (qty <= 10) return 'Critical';
    if (qty <= 25) return 'Low';
    return 'Normal';
}

function getStatusClass(status) {
    switch ((status || '').toLowerCase()) {
        case 'low':      return 'status-low';
        case 'critical': return 'status-critical';
        case 'normal':   return 'status-normal';
        default:         return '';
    }
}