// ================= COPY =================
function copyText(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error("Copy failed:", err);
    });
}

// ================= TOAST =================
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 1500);
}

// ================= HELPERS =================
function value(id) {
    return document.getElementById(id)?.value.trim();
}

// ================= PASSWORD TOGGLES =================
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

document.getElementById("togglePassword")?.addEventListener("click", () => {
    const type = password.type === "password" ? "text" : "password";
    password.type = type;

    togglePassword.classList.toggle("fa-eye");
    togglePassword.classList.toggle("fa-eye-slash");
});

document.getElementById("toggleConfirmPassword")?.addEventListener("click", () => {
    const type = confirmPassword.type === "password" ? "text" : "password";
    confirmPassword.type = type;

    toggleConfirmPassword.classList.toggle("fa-eye");
    toggleConfirmPassword.classList.toggle("fa-eye-slash");
});


// ================= REGISTER =================
document.getElementById("registerButton").addEventListener("click", () => {

    // ===== GET VALUES =====
    const firstname = value("firstname");
    const lastname = value("lastname");
    const middlename = value("middlename");
    const suffix = value("suffix");
    const birthdate = value("birthdate");

    const email = value("email");
    const mobile = value("mobile");
    const address = value("address");

    const pass = password.value.trim();
    const confirm = confirmPassword.value.trim();

    // ===== VALIDATION =====

    if (!firstname || !lastname || !birthdate || !email || !mobile || !address || !pass || !confirm) {
        showToast("Please fill in all required fields");
        return;
    }

    // email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showToast("Invalid email format");
        return;
    }

    // mobile (PH basic check: 09xxxxxxxxx or +639xxxxxxxxx)
    const mobilePattern = /^(09|\+639)\d{9}$/;
    if (!mobilePattern.test(mobile)) {
        showToast("Invalid mobile number");
        return;
    }

    // password match
    if (pass !== confirm) {
        showToast("Passwords do not match");
        return;
    }

    if (pass.length < 6) {
        showToast("Password must be at least 6 characters");
        return;
    }

    // ===== AGE CALCULATION (AUTO) =====
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    // ===== STORAGE =====
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // duplicate email
    const exists = users.some(user => user.email === email);
    if (exists) {
        showToast("Email already registered");
        return;
    }

    // ===== CREATE USER OBJECT =====
    const newUser = {
        id: "BRGY-" + Date.now(),

        firstname,
        lastname,
        middlename,
        suffix,

        birthdate,
        age,

        email,
        mobile,
        address,

        password: pass,

        createdAt: new Date().toISOString()
    };

    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));

    // optional: set logged-in user
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    showToast("Account created successfully ✓");

    // redirect
    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 1200);
});