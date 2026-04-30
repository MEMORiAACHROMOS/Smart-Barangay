// ADDED: Supabase setup
const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== COPY =====
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
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        this.classList.toggle("fa-eye");
        this.classList.toggle("fa-eye-slash");
    });
}

// ===== LOGIN FUNCTION =====
// CHANGED: Replaced localStorage with Supabase authentication against UserRegistrationTbl
document.getElementById("loginButton").addEventListener("click", async function () {

    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value.trim();

    // Basic validation
    if (!email || !pass) {
        showToast("Please fill in all fields");
        return;
    }

    // ADDED: Look up user by email in UserRegistrationTbl
    const { data, error } = await supabase
        .from('UserRegistrationTbl')
        .select('*')
        .eq('Email', email)
        .eq('Status', 'active')
        .single();

    if (error || !data) {
        showToast("Invalid email or password");
        return;
    }

    // ADDED: Verify password using bcrypt via Supabase RPC
    const { data: verified, error: verifyError } = await supabase
        .rpc('verify_password', {
            input_password: pass,
            hashed_password: data.PasswordHash
        });

    if (verifyError || !verified) {
        showToast("Invalid email or password");
        return;
    }

    // ADDED: Save user session in sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify({
        id: data.Registration_ID,
        email: data.Email,
        firstname: data.FirstName,
        lastname: data.LastName
    }));

    showToast("Login successful ✓");

    // ADDED: Redirect to user dashboard after login
    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 1000);
});