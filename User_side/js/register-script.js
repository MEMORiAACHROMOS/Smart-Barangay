// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================
// EMAILJS SETUP
// ADDED: Same keys used in forgot-password
// =========================
const EMAILJS_SERVICE_ID  = 'service_x8c2d9m';
const EMAILJS_TEMPLATE_ID = 'template_ppipkaj';
const EMAILJS_PUBLIC_KEY  = 'vLyW_aMqCBeE49ENq';

// =========================
// STATE
// ADDED: Store form data and OTP temporarily
// =========================
let pendingUserData  = null;
let generatedOTP     = '';
let resendInterval   = null;

// =========================
// TOAST
// =========================
function showToast(message, duration = 3500) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), duration);
}

// =========================
// COPY
// =========================
function copyText(text) {
    navigator.clipboard.writeText(text).catch(err => console.error("Copy failed:", err));
}

// =========================
// HELPERS
// =========================
function value(id) {
    return document.getElementById(id)?.value.trim();
}

// =========================
// PASSWORD TOGGLES
// =========================
const password        = document.getElementById("password");
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

// =========================
// STEP 1: VALIDATE FORM & SEND OTP
// ADDED: Validates all fields, checks email not already used,
//        sends OTP via EmailJS to verify email is real
// =========================
document.getElementById("registerButton").addEventListener("click", async () => {

    const firstname  = value("firstname");
    const lastname   = value("lastname");
    const middlename = value("middlename");
    const suffix     = value("suffix");
    const birthdate  = value("birthdate");
    const email      = value("email");
    const mobile     = value("mobile");
    const address    = value("address");
    const pass       = password.value.trim();
    const confirm    = confirmPassword.value.trim();

    // ADDED: Required field check
    if (!firstname || !lastname || !birthdate || !email || !mobile || !address || !pass || !confirm) {
        showToast("⚠️ Please fill in all required fields.");
        return;
    }

    // ADDED: Email format check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showToast("⚠️ Please enter a valid email address.");
        return;
    }

    // ADDED: Block known disposable/fake email domains
    const blockedDomains = [
        'mailinator.com', 'tempmail.com', 'guerrillamail.com',
        'throwaway.email', 'fakeinbox.com', 'yopmail.com',
        'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
        'spam4.me', 'trashmail.com', 'dispostable.com'
    ];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (blockedDomains.includes(emailDomain)) {
        showToast("❌ Disposable email addresses are not allowed.");
        return;
    }

    // ADDED: Mobile number check
    const mobilePattern = /^(09|\+639)\d{9}$/;
    if (!mobilePattern.test(mobile)) {
        showToast("⚠️ Invalid mobile number. Use format: 09XXXXXXXXX");
        return;
    }

    // ADDED: Password match check
    if (pass !== confirm) {
        showToast("⚠️ Passwords do not match.");
        return;
    }

    if (pass.length < 6) {
        showToast("⚠️ Password must be at least 6 characters.");
        return;
    }

    const btn = document.getElementById("registerButton");
    btn.disabled = true;
    btn.textContent = "Checking email...";

    // ADDED: Check if email already registered
    const { data: existing } = await supabase
        .from('UserRegistrationTbl')
        .select('Email')
        .eq('Email', email);

    if (existing && existing.length > 0) {
        showToast("❌ This email is already registered. Please login instead.");
        btn.disabled = false;
        btn.textContent = "Verify Email & Register";
        return;
    }

    // ADDED: Save form data temporarily — don't create account yet
    pendingUserData = { firstname, lastname, middlename, suffix, birthdate, email, mobile, address, pass };

    // ADDED: Generate 6-digit OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    btn.textContent = "Sending verification code...";

    // ADDED: Send OTP via EmailJS to verify the email is real
    const expiryDisplay = new Date(Date.now() + 10 * 60 * 1000)
        .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    try {
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                email:    email,
                passcode: generatedOTP,
                time:     expiryDisplay
            },
            EMAILJS_PUBLIC_KEY
        );

        // ADDED: Show OTP overlay
        document.getElementById('otpEmailDisplay').textContent = email;
        document.getElementById('otpOverlay').classList.add('active');
        document.getElementById('otpInputField').value = '';
        document.getElementById('otpInputField').focus();
        startResendTimer();

        showToast("✅ Verification code sent! Check your email.", 4000);

    } catch (err) {
        console.error("EmailJS error:", err);
        showToast("❌ Failed to send verification email. Please check your email address and try again.");
    }

    btn.disabled = false;
    btn.textContent = "Verify Email & Register";
});

// =========================
// ADDED: RESEND TIMER
// 60 second countdown before resend is allowed
// =========================
function startResendTimer() {
    let seconds = 60;
    const resendBtn  = document.getElementById('otpResendBtn');
    const timerSpan  = document.getElementById('otpResendTimer');

    resendBtn.disabled = true;
    timerSpan.textContent = seconds;

    if (resendInterval) clearInterval(resendInterval);

    resendInterval = setInterval(() => {
        seconds--;
        timerSpan.textContent = seconds;
        if (seconds <= 0) {
            clearInterval(resendInterval);
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend Code';
        }
    }, 1000);
}

// ADDED: Resend button — regenerates and resends OTP
document.getElementById('otpResendBtn').addEventListener('click', async function () {
    if (!pendingUserData) return;

    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const expiryDisplay = new Date(Date.now() + 10 * 60 * 1000)
        .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    try {
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                email:    pendingUserData.email,
                passcode: generatedOTP,
                time:     expiryDisplay
            },
            EMAILJS_PUBLIC_KEY
        );
        showToast("✅ New code sent! Check your email.", 3500);
        startResendTimer();
    } catch (err) {
        showToast("❌ Failed to resend. Please try again.");
    }
});

// =========================
// ADDED: CANCEL OTP — go back to form
// =========================
function cancelOTP() {
    document.getElementById('otpOverlay').classList.remove('active');
    pendingUserData = null;
    generatedOTP    = '';
    if (resendInterval) clearInterval(resendInterval);
}

// =========================
// STEP 2: VERIFY OTP & CREATE ACCOUNT
// ADDED: Verifies entered code, then creates account in Supabase
// =========================
document.getElementById('otpVerifyBtn').addEventListener('click', async function () {
    const enteredCode = document.getElementById('otpInputField').value.trim();

    if (!enteredCode || enteredCode.length !== 6) {
        showToast("⚠️ Please enter the 6-digit code.");
        return;
    }

    // ADDED: Check if OTP matches
    if (enteredCode !== generatedOTP) {
        showToast("❌ Incorrect code. Please try again.");
        return;
    }

    if (!pendingUserData) {
        showToast("❌ Session expired. Please start over.");
        cancelOTP();
        return;
    }

    const btn = this;
    btn.disabled = true;
    btn.textContent = "Creating account...";

    // ADDED: Hash password
    const { data: hashed, error: hashError } = await supabase
        .rpc('hash_password', { input_password: pendingUserData.pass });

    if (hashError || !hashed) {
        showToast("❌ Error securing password. Please try again.");
        console.error("Hash error:", hashError);
        btn.disabled = false;
        btn.textContent = "✔ Verify & Create Account";
        return;
    }

    // ADDED: Insert new verified user into Supabase
    const { error: insertError } = await supabase
        .from('UserRegistrationTbl')
        .insert([{
            FirstName:    pendingUserData.firstname,
            LastName:     pendingUserData.lastname,
            MiddleName:   pendingUserData.middlename,
            Suffix:       pendingUserData.suffix,
            DateOfBirth:  pendingUserData.birthdate,
            Email:        pendingUserData.email,
            MobileNumber: pendingUserData.mobile,
            Address:      pendingUserData.address,
            PasswordHash: hashed,
            Status:       'active'
        }]);

    if (insertError) {
        showToast("❌ Failed to create account: " + insertError.message);
        console.error("Insert error:", insertError);
        btn.disabled = false;
        btn.textContent = "✔ Verify & Create Account";
        return;
    }

    // ADDED: Success — close overlay and redirect
    document.getElementById('otpOverlay').classList.remove('active');
    showToast("✅ Account created successfully! Redirecting to login...", 2500);

    setTimeout(() => {
        window.location.href = "login.html";
    }, 2000);
});

// ADDED: Allow pressing Enter in OTP input to trigger verify
document.getElementById('otpInputField').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('otpVerifyBtn').click();
    }
});