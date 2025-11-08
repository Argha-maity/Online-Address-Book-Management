const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

loginForm.style.display = 'block';
signupForm.style.display = 'none';

function switchForm(formName) {
    if (formName === 'signup') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    }
}

function togglePasswordVisibility(inputId, iconElement) {
    const passwordInput = document.getElementById(inputId);
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        iconElement.textContent = '🙈'; 
    } else {
        passwordInput.type = 'password';
        iconElement.textContent = '👁️'; 
    }
}

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("signup-name").value;
    const contactNo = document.getElementById("signup-contactNo").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    const userData = {
        username: username, 
        contactNo: contactNo,
        email: email,
        password: password
    };

    try {
        const response = await fetch("https://online-address-book-management.onrender.com/api/users/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem("token", data.token); 
            localStorage.setItem("userEmail", data.email);
            window.location.href = "../dashboard/dashboard.html"; 
            alert("Registration successful!");
        } else {
            throw new Error(data.error || "Registration failed");
        }
    } catch (err) {
        console.error("Signup Error:", err);
        alert(err.message);
    }
});

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch("https://online-address-book-management.onrender.com/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Store token
            localStorage.setItem("token", data.token);

            // Since your API returns username directly (not inside data.user)
            const username = data.username || data.email?.split("@")[0] || "User";
            localStorage.setItem("username", username);
            localStorage.setItem("userEmail", data.email);

            console.log("Logged in as:", username);
            alert(`Welcome, ${username}!`);
            window.location.href = "../dashboard/dashboard.html";
        } else {
            throw new Error(data.error || "Login failed");
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert(err.message);
    }
});
