document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".sidebar a");

    // Get current page (e.g. dashboard.html)
    let currentPage = window.location.pathname.split("/").pop();

    // Default to dashboard if empty (like opening root)
    if (currentPage === "") {
        currentPage = "dashboard.html";
    }

    links.forEach(link => {
        const linkPage = link.getAttribute("href");

        // Remove any existing active
        link.classList.remove("active");

        // Match current page
        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });
});