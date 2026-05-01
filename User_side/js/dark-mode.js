// =========================
// DARK MODE TOGGLE SCRIPT - MATCHING ADMIN SIDE
// =========================

document.addEventListener("DOMContentLoaded", () => {
    // Initialize dark mode from localStorage
    initializeDarkMode();

    // Create and add dark mode toggle button
    createDarkModeToggle();
});

// Initialize dark mode on page load
function initializeDarkMode() {
    const isDarkMode = localStorage.getItem("darkMode") === "enabled";

    if (isDarkMode) {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}

// Create the dark mode toggle button
function createDarkModeToggle() {
    const header = document.querySelector(".main-header");

    if (!header) return;

    // Check if button already exists
    if (document.querySelector(".dark-mode-toggle")) {
        return;
    }

    const toggleBtn = document.createElement("button");
    toggleBtn.classList.add("dark-mode-toggle");
    toggleBtn.title = "Toggle Dark Mode";

    toggleBtn.addEventListener("click", toggleDarkMode);

    header.appendChild(toggleBtn);

    // Set initial button text
    updateToggleButton();
}

// Toggle dark mode on/off
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle("dark");

    if (isDarkMode) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }

    updateToggleButton();
}

// Update button icon/text
function updateToggleButton() {
    const toggleBtn = document.querySelector(".dark-mode-toggle");
    const isDarkMode = document.body.classList.contains("dark");

    if (toggleBtn) {
        if (isDarkMode) {
            toggleBtn.textContent = "☀️ Light";
        } else {
            toggleBtn.textContent = "🌙 Dark";
        }
    }
}

// Initialize button text on page load
window.addEventListener("load", () => {
    updateToggleButton();
});
