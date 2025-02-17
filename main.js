document.addEventListener("DOMContentLoaded", function () {
    const accountForm = document.getElementById("account-form");
    const loginForm = document.getElementById("login-form");
    const githubForm = document.getElementById("github-form");
    const recommendationsSection = document.getElementById("recommendations");
    const resourceList = document.getElementById("resource-list");
    const githubCredentialsSection = document.getElementById("github-credentials");
    const accountCreationSection = document.getElementById("account-creation");
    const loginSection = document.getElementById("login");
    const switchToLogin = document.getElementById("switch-to-login");
    const switchToSignup = document.getElementById("switch-to-signup");
    const logoutButton = document.getElementById("logout-button");

    // Switch between Login and Signup
    switchToLogin.addEventListener("click", function (event) {
        event.preventDefault();
        accountCreationSection.style.display = "none";
        loginSection.style.display = "block";
    });

    switchToSignup.addEventListener("click", function (event) {
        event.preventDefault();
        loginSection.style.display = "none";
        accountCreationSection.style.display = "block";
    });

    // Handle account creation
    accountForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://127.0.0.1:5000/create_account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, username, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Account created successfully! Please log in.");
                accountCreationSection.style.display = "none";
                loginSection.style.display = "block";
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        }
    });

    // Handle login
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (response.ok) {
                sessionStorage.setItem("user_id", data.user_id);
                alert("Login successful!");
                loginSection.style.display = "none";
                githubCredentialsSection.style.display = "block";
                logoutButton.style.display = "block";
            } else {
                alert("Login failed: " + data.error);
            }
        } catch (error) {
            alert("An error occurred during login. Please try again.");
        }
    });

    // Handle GitHub credentials submission
    githubForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const githubUsername = document.getElementById("github-username").value;
        const githubToken = document.getElementById("github-token").value;

        try {
            const response = await fetch("http://127.0.0.1:5000/analyze_github", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ githubUsername, githubToken }),
            });

            const data = await response.json();
            if (response.ok) {
                displayResources(data.recommended_skills);
                githubCredentialsSection.style.display = "none";
                recommendationsSection.style.display = "block";
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            alert("Failed to fetch GitHub data. Please check your credentials.");
        }
    });

    // Function to display resources dynamically
    function displayResources(resources) {
        resourceList.innerHTML = ""; // Clear previous resources
        resources.forEach((resource) => {
            const li = document.createElement("li");
            li.textContent = resource;
            resourceList.appendChild(li);
        });
    }

    // Handle logout
    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("user_id");
        alert("Logged out!");
        recommendationsSection.style.display = "none";
        accountCreationSection.style.display = "block";
        logoutButton.style.display = "none";
    });

    // Auto-hide logout button if user is not logged in
    if (!sessionStorage.getItem("user_id")) {
        logoutButton.style.display = "none";
    }
});
