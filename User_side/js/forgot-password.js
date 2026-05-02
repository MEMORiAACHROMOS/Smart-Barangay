// =========================
// SUPABASE SETUP
// =========================
const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================
// EMAILJS
// =========================
const EMAILJS_SERVICE_ID  = 'service_x8c2d9m';
const EMAILJS_TEMPLATE_ID = 'template_ppipkaj';
const EMAILJS_PUBLIC_KEY  = 'vLyW_aMqCBeE49ENq';

// =========================
// STATE
// =========================
let currentEmail  = '';
let generatedCode = '';
let resendInterval = null;

// =========================
// TOAST — ADDED: type support (success, error, info)
// Auto-closes after duration
// =========================
function showToast(message, type = 'error', duration = 4000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast';

    // ADDED: color per type
    if (type === 'success') {
        toast.style.background = 'rgba(5, 150, 105, 0.95)';
        toast.style.border = '1px solid #10b981';
    } else if (type === 'error') {
        toast.style.background = 'rgba(185, 28, 28, 0.95)';
        toast.style.border = '1px solid #ef4444';
    } else {
        toast.style.background = 'rgba(0,0,0,0.85)';
        toast.style.border = 'none';
    }

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

// =========================
// STEP NAVIGATION
// =========================
function goToStep(step) {
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.step-dot').forEach(d => d.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    for (let i = 1; i <= step && i <= 3; i++) {
        document.getElementById(`dot${i}`).classList.add('active');
    }
}

// =========================
// STEP 1: SEND RESET CODE
// =========================
document.getElementById('sendCodeBtn').addEventListener('click', async function () {
    const email = document.getElementById('resetEmail').value.trim();

    if (!email) {
        showToast('⚠️ Please enter your email address.', 'error');
        return;
    }

    // ADDED: Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('⚠️ Please enter a valid email address.', 'error');
        return;
    }

    const btn = this;
    btn.disabled = true;
    btn.textContent = 'Checking...';

    // ADDED: Check if email exists in UserRegistrationTbl
    const { data, error } = await supabase
        .from('UserRegistrationTbl')
        .select('Registration_ID, Email, Status')
        .eq('Email', email);

    console.log('Email check:', data, error);

    if (error) {
        showToast('❌ Database error. Please try again.', 'error');
        btn.disabled = false;
        btn.textContent = 'Send Reset Code';
        return;
    }

    // ADDED: Clear message if email not in database
    if (!data || data.length === 0) {
        showToast('❌ No account found with that email address. Please check and try again.', 'error', 5000);
        btn.disabled = false;
        btn.textContent = 'Send Reset Code';
        return;
    }

    const user = data[0];

    if (user.Status !== 'active') {
        showToast('❌ Your account is inactive. Please contact support.', 'error', 5000);
        btn.disabled = false;
        btn.textContent = 'Send Reset Code';
        return;
    }

    // Generate OTP
    generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    currentEmail  = email;
   // FIXED: Store as Unix timestamp (milliseconds) to avoid timezone/format issues
    const expiresAt = Date.now() + 10 * 60 * 1000;

    btn.textContent = 'Saving code...';

    // Invalidate old codes
    await supabase
        .from('PasswordResetTbl')
        .update({ Used: true })
        .eq('Email', email)
        .eq('Used', false);

    // Save new code
    const { error: insertError } = await supabase
        .from('PasswordResetTbl')
        .insert([{
            Email:     email,
            ResetCode: generatedCode,
            ExpiresAt: expiresAt,
            Used:      false
        }]);

    if (insertError) {
        console.error('Insert error:', insertError);
        // ADDED: More specific error message
        showToast('❌ Failed to generate reset code. Make sure RLS is disabled on PasswordResetTbl in Supabase.', 'error', 6000);
        btn.disabled = false;
        btn.textContent = 'Send Reset Code';
        return;
    }

    btn.textContent = 'Sending email...';

    const expiryDisplay = new Date(Date.now() + 10 * 60 * 1000)
        .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    try {
        const result = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                email:    email,
                passcode: generatedCode,
                time:     expiryDisplay
            },
            EMAILJS_PUBLIC_KEY
        );

        console.log('EmailJS success:', result);
        showToast('✅ Reset code sent! Check your email inbox.', 'success', 4000);
        document.getElementById('displayEmail').textContent = email;
        goToStep(2);
        startResendTimer();

    } catch (emailError) {
        console.error('EmailJS error:', emailError);
        showToast('❌ Failed to send email. Please try again.', 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Send Reset Code';
});

// =========================
// RESEND TIMER
// =========================
function startResendTimer() {
    let seconds = 60;
    const resendBtn = document.getElementById('resendBtn');
    const timerSpan = document.getElementById('resendTimer');

    resendBtn.disabled = true;
    timerSpan.textContent = seconds;

    if (resendInterval) clearInterval(resendInterval);

    resendInterval = setInterval(() => {
        seconds--;
        timerSpan.textContent = seconds;
        if (seconds <= 0) {
            clearInterval(resendInterval);
            resendBtn.disabled = false;
            resendBtn.innerHTML = 'Resend Code';
        }
    }, 1000);
}

document.getElementById('resendBtn').addEventListener('click', async function () {
    if (!currentEmail) return;
    document.getElementById('resetEmail').value = currentEmail;
    document.getElementById('sendCodeBtn').click();
});

// =========================
// STEP 2: VERIFY OTP
// =========================
document.getElementById('verifyCodeBtn').addEventListener('click', async function () {
    const enteredCode = document.getElementById('otpInput').value.trim();

    if (!enteredCode || enteredCode.length !== 6) {
        showToast('⚠️ Please enter the 6-digit code.', 'error');
        return;
    }

    const btn = this;
    btn.disabled = true;
    btn.textContent = 'Verifying...';

    const { data, error } = await supabase
        .from('PasswordResetTbl')
        .select('*')
        .eq('Email', currentEmail)
        .eq('Used', false)
        .order('Created_At', { ascending: false })
        .limit(1);

    if (error || !data || data.length === 0) {
        showToast('❌ Invalid or expired code. Please request a new one.', 'error');
        btn.disabled = false;
        btn.textContent = 'Verify Code';
        return;
    }

    const record = data[0];

   // FIXED: Compare in UTC to avoid timezone mismatch (Supabase stores UTC)
   // FIXED: Compare Unix timestamps directly — no timezone issues
    const nowMs     = Date.now();
    const expiresMs = Number(record.ExpiresAt);
    if (nowMs > expiresMs) {
        showToast('❌ Code has expired. Please request a new one.', 'error');
        btn.disabled = false;
        btn.textContent = 'Verify Code';
        return;
    }

    if (record.ResetCode !== enteredCode) {
        showToast('❌ Incorrect code. Please try again.', 'error');
        btn.disabled = false;
        btn.textContent = 'Verify Code';
        return;
    }

    showToast('✅ Code verified!', 'success');
    goToStep(3);

    btn.disabled = false;
    btn.textContent = 'Verify Code';
});

// =========================
// PASSWORD STRENGTH
// =========================
document.getElementById('newPassword').addEventListener('input', function () {
    const val = this.value;
    const bar = document.getElementById('strengthBar');
    let strength = 0;

    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    const colors = ['#ef4444', '#f59e0b', '#10b981', '#065f46'];
    const widths  = ['25%', '50%', '75%', '100%'];

    bar.style.width      = val.length === 0 ? '0%' : (widths[strength - 1] || '25%');
    bar.style.background = val.length === 0 ? '' : (colors[strength - 1] || '#ef4444');
});

// =========================
// PASSWORD TOGGLES
// =========================
document.getElementById('toggleNew').addEventListener('click', function () {
    const input = document.getElementById('newPassword');
    input.type  = input.type === 'password' ? 'text' : 'password';
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

document.getElementById('toggleConfirm').addEventListener('click', function () {
    const input = document.getElementById('confirmPassword');
    input.type  = input.type === 'password' ? 'text' : 'password';
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// =========================
// STEP 3: RESET PASSWORD
// =========================
document.getElementById('resetBtn').addEventListener('click', async function () {
    const newPass     = document.getElementById('newPassword').value.trim();
    const confirmPass = document.getElementById('confirmPassword').value.trim();

    if (!newPass || !confirmPass) {
        showToast('⚠️ Please fill in both password fields.', 'error');
        return;
    }

    if (newPass.length < 8) {
        showToast('⚠️ Password must be at least 8 characters.', 'error');
        return;
    }

    if (newPass !== confirmPass) {
        showToast('⚠️ Passwords do not match.', 'error');
        return;
    }

    const btn = this;
    btn.disabled = true;
    btn.textContent = 'Updating...';

   // FIXED: correct parameter name is input_password (matches register-script.js)
    const { data: hashed, error: hashError } = await supabase
        .rpc('hash_password', { input_password: newPass });
        
    if (hashError || !hashed) {
        console.error('Hash error:', hashError);
        showToast('❌ Failed to secure password. Please try again.', 'error');
        btn.disabled = false;
        btn.textContent = 'Reset Password';
        return;
    }

    // Update password
    const { error: updateError } = await supabase
        .from('UserRegistrationTbl')
        .update({ PasswordHash: hashed })
        .eq('Email', currentEmail);

    if (updateError) {
        console.error('Update error:', updateError);
        showToast('❌ Failed to update password. Please try again.', 'error');
        btn.disabled = false;
        btn.textContent = 'Reset Password';
        return;
    }

    // Mark code used
    await supabase
        .from('PasswordResetTbl')
        .update({ Used: true })
        .eq('Email', currentEmail)
        .eq('Used', false);

    showToast('✅ Password updated successfully!', 'success');
    goToStep(4);

    btn.disabled = false;
    btn.textContent = 'Reset Password';
});