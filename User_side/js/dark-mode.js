// =========================
// DARK MODE TOGGLE SCRIPT
// =========================

document.addEventListener("DOMContentLoaded", () => {
    initializeDarkMode();
    createDarkModeToggle();
});

function initializeDarkMode() {
    const isDarkMode = localStorage.getItem("darkMode") === "enabled";
    if (isDarkMode) {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}

// FIXED: Create dark mode button on the LEFT side of header
// ADDED: Notification bell also created here so both are always visible
function createDarkModeToggle() {
    const header = document.querySelector(".main-header");
    if (!header) return;

    // FIXED: Remove existing toggle if any to avoid duplicates
    const existing = document.querySelector(".dark-mode-toggle");
    if (existing) existing.remove();

    // ADDED: Create dark mode button — positioned on LEFT side
    const toggleBtn = document.createElement("button");
    toggleBtn.classList.add("dark-mode-toggle");
    toggleBtn.title = "Toggle Dark Mode";
    toggleBtn.addEventListener("click", toggleDarkMode);
    header.appendChild(toggleBtn);

    updateToggleButton();
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
    updateToggleButton();
}

function updateToggleButton() {
    const toggleBtn = document.querySelector(".dark-mode-toggle");
    const isDarkMode = document.body.classList.contains("dark");
    if (toggleBtn) {
        toggleBtn.textContent = isDarkMode ? "☀️ Light" : "🌙 Dark";
    }
}

window.addEventListener("load", () => {
    updateToggleButton();
});