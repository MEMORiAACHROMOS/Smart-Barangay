
function togglePassword() {
    const password = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword');

    if (password.type === 'password') {
        password.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        password.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === "admin" && password === "12345") {
        alert("Login Successful!");
    } else {
        alert("Invalid username or password!");
    }
}

// Optional: Press Enter to login
document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
});
document.getElementById('username').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
});
