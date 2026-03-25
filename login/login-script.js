document.addEventListener("DOMContentLoaded", function () {

    const password = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginButton');
    const usernameInput = document.getElementById('username');

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
    function login() {
        const username = usernameInput.value;
        const pass = password.value;

        if (username === "admin" && pass === "12345") {
            alert("Login Successful!");
        } else {
            alert("Invalid username or password!");
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