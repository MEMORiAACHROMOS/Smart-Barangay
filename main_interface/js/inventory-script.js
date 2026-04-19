// SEARCH FUNCTION
function searchInventory() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let table = document.getElementById("inventoryTable");
    let rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        let item = rows[i].getElementsByTagName("td")[0];
        if (item) {
            let text = item.textContent || item.innerText;
            rows[i].style.display = text.toLowerCase().includes(input) ? "" : "none";
        }
    }
}

// OPEN MODAL
function openModal() {
    document.getElementById("itemModal").style.display = "flex";
}

// CLOSE MODAL
function closeModal() {
    document.getElementById("itemModal").style.display = "none";
}