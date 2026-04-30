
function copyText(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error("Copy failed:", err);
    });
}

function getStarted() {
    // Future-ready logic (you can expand later)
    
    // Option A: direct redirect to login page
    window.location.href = "login.html";

    // Option B (if you want system role check later):
    // window.location.href = "login.html?redirect=dashboard";
}