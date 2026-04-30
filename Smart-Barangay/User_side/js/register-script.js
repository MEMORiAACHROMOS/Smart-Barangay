// ADDED: Supabase setup
const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================= TOAST =================
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 1500);
}

// ================= COPY =================
function copyText(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error("Copy failed:", err);
    });
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
    document.getElementById("togglePassword").classList.toggle("fa-eye");
    document.getElementById("togglePassword").classList.toggle("fa-eye-slash");
});

document.getElementById("toggleConfirmPassword")?.addEventListener("click", () => {
    const type = confirmPassword.type === "password" ? "text" : "password";
    confirmPassword.type = type;
    document.getElementById("toggleConfirmPassword").classList.toggle("fa-eye");
    document.getElementById("toggleConfirmPassword").classList.toggle("fa-eye-slash");
});

// ================= REGISTER =================
document.getElementById("registerButton").addEventListener("click", async () => {

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

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showToast("Invalid email format");
        return;
    }

    const mobilePattern = /^(09|\+639)\d{9}$/;
    if (!mobilePattern.test(mobile)) {
        showToast("Invalid mobile number");
        return;
    }

    if (pass !== confirm) {
        showToast("Passwords do not match");
        return;
    }

    if (pass.length < 6) {
        showToast("Password must be at least 6 characters");
        return;
    }

    // ===== AGE CALCULATION =====
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    // ADDED: Check if email already exists in Supabase
    const { data: existing, error: checkError } = await supabase
        .from('UserRegistrationTbl')
        .select('Email')
        .eq('Email', email)
        .single();

    if (existing) {
        showToast("Email already registered");
        return;
    }

    // ADDED: Hash password using Supabase RPC (bcrypt)
    const { data: hashed, error: hashError } = await supabase
        .rpc('hash_password', { input_password: pass });

    if (hashError) {
        showToast("Error creating account. Try again.");
        console.error("Hash error:", hashError);
        return;
    }

    // ADDED: Insert new user into Supabase UserRegistrationTbl
    const { error: insertError } = await supabase
        .from('UserRegistrationTbl')
        .insert([{
            FirstName: firstname,
            LastName: lastname,
            MiddleName: middlename,
            Suffix: suffix,
            DateOfBirth: birthdate,
            Email: email,
            MobileNumber: mobile,
            Address: address,
            PasswordHash: hashed,
            Status: 'active'
        }]);

    if (insertError) {
        showToast("Failed to create account: " + insertError.message);
        console.error("Insert error:", insertError);
        return;
    }

    showToast("Account created successfully ✓");

    // ADDED: Redirect to login after success
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1200);
});