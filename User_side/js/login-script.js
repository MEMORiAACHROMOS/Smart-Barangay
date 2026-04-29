function copyText(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error("Copy failed:", err);
    });
}

// ===== TOAST =====
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 1500);
}


// ===== PASSWORD TOGGLE =====
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePassword) {
    togglePassword.addEventListener("click", function () {
        const type = passwordInput.getAttribute("type") === "password"
            ? "text"
            : "password";

        passwordInput.setAttribute("type", type);

        this.classList.toggle("fa-eye");
        this.classList.toggle("fa-eye-slash");
    });
}


// ===== LOGIN FUNCTION =====
document.getElementById("loginButton").addEventListener("click", function () {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // basic validation
    if (!email || !password) {
        showToast("Please fill in all fields");
        return;
    }

    // get users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // find matching user
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        showToast("Invalid email or password");
        return;
    }

    // save session
    localStorage.setItem("currentUser", JSON.stringify(user));

    showToast("Login successful ✓");

    // redirect to user dashboard
    setTimeout(() => {
        window.location.href = "user-dashboard.html";
    }, 1000);
});