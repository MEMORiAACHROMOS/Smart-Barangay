document.addEventListener("DOMContentLoaded", function () {

    const password = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginButton');
    const usernameInput = document.getElementById('username');

    // Supabase configuration
   const SUPABASE_URL = 'https://fdywrbdjrtrpnyyhrpoj.supabase.co';
   const SUPABASE_ANON_KEY = 'sb_publishable_LMKNlKJ7lXXZIvbUllHPjA_Xi7cwKGH';

    // Initialize Supabase
    const { createClient } = window.supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Toggle password visibility
    toggleIcon.addEventListener('click', function () {
        if (password.type === 'password') {
            password.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            password.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    });

    // Login function
    async function login() {
        const username = usernameInput.value.trim();
        const pass = password.value;

        if (!username || !pass) {
            alert("Please enter username and password!");
            return;
        }

        try {
            // Fetch user from LoginTbl by username
            const { data, error } = await supabaseClient
                .from('LoginTbl')
                .select('*, User_ManagementTbl(RoleName)')
                .eq('Username', username)
                .eq('Status', 'active')
                .single();

            if (error || !data) {
                alert("Invalid username or password!");
                return;
            }

            // Verify password using Supabase SQL
            const { data: verified, error: verifyError } = await supabaseClient
                .rpc('verify_password', {
                    input_password: pass,
                    hashed_password: data.PasswordHash
                });

            if (verifyError || !verified) {
                alert("Invalid username or password!");
                return;
            }

            // Store user info in session
            sessionStorage.setItem('userId', data.User_ID);
            sessionStorage.setItem('username', data.Username);
            sessionStorage.setItem('userRole', data.User_ManagementTbl?.RoleName || 'Staff');

            // Redirect to dashboard
            window.location.href = "../main_interface/dashboard.html";

        } catch (err) {
            console.error(err);
            alert("Error connecting to database.");
        }
    }

    // Button click
    loginBtn.addEventListener('click', login);

    // Press Enter to login
    password.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login();
    });

    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login();
    });

});