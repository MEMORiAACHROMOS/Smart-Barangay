const API = {
    GET_USER: "/api/user",
    UPDATE_USER: "/api/user/update",
    GET_RECORDS: "/api/records"
};

/* =========================
   STATE
========================= */
let currentUser = null;
let records = [];

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {

    currentUser = await getUser();

    if (!currentUser) {
        console.warn("No user logged in");
        return;
    }

    records = await getRecords();

    renderProfile();
    renderRecords();
    setupUI();
});

/* =========================
   DATA LAYER (LOCAL STORAGE - API READY)
========================= */
async function getUser() {
    try {
        return JSON.parse(localStorage.getItem("currentUser"));
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function updateUser(data) {
    try {
        // future backend
        // await fetch(API.UPDATE_USER, { method:"POST", body: JSON.stringify(data) });

        localStorage.setItem("currentUser", JSON.stringify(data));
    } catch (err) {
        console.error(err);
    }
}

async function getRecords() {
    try {
        const all = JSON.parse(localStorage.getItem("medicalRecords")) || [];

        // patient-only filtering
        return all.filter(r => r.userId === currentUser?.id);

    } catch (err) {
        console.error(err);
        return [];
    }
}

/* =========================
   RENDER PROFILE
========================= */
function renderProfile() {

    if (!currentUser) return;

    const fullName = [
        currentUser.firstname,
        currentUser.middlename,
        currentUser.lastname,
        currentUser.suffix
    ].filter(Boolean).join(" ");

    setText("fullName", fullName);
    setText("email", currentUser.email);
    setText("phone", currentUser.phone);
    setText("address", currentUser.address);

    setText("ageText", `Age: ${calculateAge(currentUser.birthdate)}`);
}

/* =========================
   RENDER RECORDS (READ ONLY)
========================= */
function renderRecords() {

    const container = document.getElementById("recordsList");
    container.innerHTML = "";

    if (!records.length) {
        container.innerHTML = "<p>No medical records found.</p>";
        return;
    }

    records
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(r => {

            const el = document.createElement("div");
            el.className = "record-item";

            el.innerHTML = `
                <h4>${escapeHtml(r.title)}</h4>
                <p><strong>Type:</strong> ${r.type}</p>
                <p><strong>Date:</strong> ${r.date}</p>
                <p><strong>Doctor:</strong> ${r.doctor || "-"}</p>
                <p>${escapeHtml(r.description || "")}</p>
            `;

            container.appendChild(el);
        });
}

/* =========================
   UI LOGIC (PROFILE ONLY)
========================= */
function setupUI() {

    document.getElementById("editProfileBtn").onclick = () => {
        fillProfileForm();
        show("editProfileModal");
    };

    document.getElementById("saveProfileBtn").onclick = async () => {

        const updated = {
            ...currentUser,
            firstname: val("firstname"),
            middlename: val("middlename"),
            lastname: val("lastname"),
            suffix: val("suffix"),
            birthdate: val("birthdate"),
            email: val("emailInput"),
            phone: val("phoneInput"),
            address: val("addressInput")
        };

        currentUser = updated;
        await updateUser(updated);

        renderProfile();
        closeEditModal();
    };
}

/* =========================
   HELPERS
========================= */
function calculateAge(birthdate) {
    if (!birthdate) return "-";

    const diff = Date.now() - new Date(birthdate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
}

function val(id) {
    return document.getElementById(id)?.value?.trim() || "";
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
}

function show(id) {
    document.getElementById(id)?.classList.add("show");
}

function closeEditModal() {
    document.getElementById("editProfileModal")?.classList.remove("show");
}

function fillProfileForm() {
    valSet("firstname", currentUser.firstname);
    valSet("middlename", currentUser.middlename);
    valSet("lastname", currentUser.lastname);
    valSet("suffix", currentUser.suffix);
    valSet("birthdate", currentUser.birthdate);

    valSet("emailInput", currentUser.email);
    valSet("phoneInput", currentUser.phone);
    valSet("addressInput", currentUser.address);
}

function valSet(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || "";
}

/* =========================
   SECURITY HELPER
========================= */
function escapeHtml(text) {
    return (text || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}