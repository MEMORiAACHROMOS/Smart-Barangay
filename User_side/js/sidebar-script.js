document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("menuToggle");
    const overlay = document.getElementById("sidebarOverlay");

    console.log("Sidebar loaded:", location.pathname);

    /* =========================
       SIDEBAR TOGGLE
    ========================= */
    toggle?.addEventListener("click", () => {
        sidebar?.classList.toggle("active");
        overlay?.classList.toggle("active");
    });

    overlay?.addEventListener("click", () => {
        sidebar?.classList.remove("active");
        overlay?.classList.remove("active");
    });

    /* =========================
       ACTIVE LINK
    ========================= */
    const links = document.querySelectorAll(".sidebar a");

    let currentPage = location.pathname.split("/").pop();
    if (!currentPage) currentPage = "dashboard.html";

    links.forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === currentPage
        );
    });

    /* =========================
       LOGOUT HANDLER (FIXED GLOBAL SAFE)
    ========================= */
    document.addEventListener("click", (e) => {

        const logoutBtn = e.target.closest(".logout-trigger");

        if (!logoutBtn) return;

        e.preventDefault();

        const modal = document.getElementById("logoutModal");

        if (!modal) {
            console.warn("Logout modal missing on this page");
            return;
        }

        modal.classList.add("show");
    });

    /* =========================
       CONFIRM LOGOUT
    ========================= */
    document.addEventListener("click", (e) => {

        if (e.target.id === "confirmLogoutBtn") {

            localStorage.removeItem("currentUser");

            window.location.href = "login.html";
        }
    });

});

/* =========================
   GLOBAL MODAL CONTROL
========================= */
window.closeLogoutModal = function () {
    document.getElementById("logoutModal")?.classList.remove("show");
};