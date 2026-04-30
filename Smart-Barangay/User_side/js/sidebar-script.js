document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("menuToggle");
    const overlay = document.getElementById("sidebarOverlay");

    const links = document.querySelectorAll(".sidebar a");

    // =========================
    // TOGGLE SIDEBAR
    // =========================
    if (toggle && sidebar) {
        toggle.addEventListener("click", () => {
            sidebar.classList.toggle("active");

            if (overlay) {
                overlay.classList.toggle("active");
            }
        });
    }

    // CLOSE ON OUTSIDE CLICK
    if (overlay) {
        overlay.addEventListener("click", () => {
            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        });
    }

    // =========================
    // ACTIVE LINK HIGHLIGHT
    // =========================
    let currentPage = window.location.pathname.split("/").pop();

    if (currentPage === "") {
        currentPage = "dashboard.html";
    }

    links.forEach(link => {
        const linkPage = link.getAttribute("href");

        link.classList.remove("active");

        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });

});