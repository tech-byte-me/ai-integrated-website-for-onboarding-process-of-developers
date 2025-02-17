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

    // Resources categorized by language and category
    const resources = {
        "Python": {
            "Tutorial": { title: "Python Tutorial", url: "https://www.w3schools.com/python/" },
            "Assessment Questions": { title: "Python Assessment Questions", url: "https://www.geeksforgeeks.org/python-programming-language/" }
        },
        "Java": {
            "Tutorial": { title: "Java Tutorial", url: "https://www.w3schools.com/java/default.asp" },
            "Assessment Questions": { title: "Java Assessment Questions", url: "https://www.geeksforgeeks.org/html-interview-questions/" }
        },
        "JavaScript": {
            "Tutorial": { title: "JavaScript Tutorial", url: "https://www.w3schools.com/js/default.asp" },
            "Assessment Questions": { title: "JavaScript Assessment Questions", url: "https://www.geeksforgeeks.org/javascript-interview-questions-and-answers/" },
            "Questions": { title: "JavaScript Questions", url: "https://www.w3resource.com/javascript-exercises/javascript-basic-exercises.php" }
        },
        "CSS": {
            "Tutorial": { title: "CSS Tutorial", url: "https://www.w3schools.com/css/default.asp" },
            "Exercise": { title: "CSS Exercises", url: "https://www.w3schools.com/css/css_exercises.asp" }
        },
        "HTML": {
            "Tutorial": { title: "HTML Tutorial", url: "https://www.w3schools.com/html/default.asp" },
            "Assessment Questions": { title: "HTML Assessment Questions", url: "https://www.geeksforgeeks.org/html-interview-questions/" }
        },
        "C#": {
            "Tutorial": { title: "C# Tutorial", url: "https://www.w3schools.com/cs/index.php" }
        },
        "React": {
            "Tutorial": { title: "React Tutorial", url: "https://www.w3schools.com/react/default.asp" },
            "Interview Questions": { title: "React Assessment Questions", url: "https://www.greatfrontend.com/questions/react-interview-questions?utm_source=google&utm_campaign=21407184174&utm_medium=ad&utm_content=703817022372&utm_term=react%20coding&gad_source=1&gclid=CjwKCAiA2cu9BhBhEiwAft6IxFFUI016KTDGMOdEwi170kGRXnrj88XGnPdZcb7px-1dSV2OwhnCjRoCkj4QAvD_BwE" }
        },
        "MySQL": {
            "Tutorial": { title: "MySQL Tutorial", url: "https://www.w3schools.com/mysql/default.asp" },
            "Exercises": { title: "MySQL Exercises", url: "https://www.w3schools.com/mysql/mysql_exercises.asp" }
        },
        "Django": {
            "Tutorial": { title: "Django Tutorial", url: "https://www.w3schools.com/django/index.php" },
            "Assessment Questions": { title: "Django Assessment Questions", url: "https://www.geeksforgeeks.org/django-interview-questions/" }
        },
        "Node.js": {
            "Tutorial": { title: "Node.js Tutorial", url: "https://www.w3schools.com/nodejs/default.asp" },
            "Assessment Questions": { title: "Node.js Assessment Questions", url: "https://www.geeksforgeeks.org/node-interview-questions-and-answers/" }
        },
        "DSA": {
            "Tutorial": { title: "DSA Tutorial", url: "https://www.w3schools.com/dsa/index.php" }
        },
        "C++": {
            "Tutorial": { title: "C++ Tutorial", url: "https://www.w3schools.com/cpp/default.asp" },
            "Exercise": { title: "C++ Exercises", url: "https://www.w3schools.com/cpp/default.asp" } // Added the new link here
        },
        "Flask": {
            "Tutorial": { title: "Flask Tutorial", url: "https://www.geeksforgeeks.org/flask-tutorial/" },
            "Assessment Questions": { title: "Flask Assessment Questions", url: "https://www.knowledgehut.com/interview-questions/flask" }
        }
    };
    

    // Function to display resources dynamically as buttons
    function displayResources(recommendedSkills = null) {
        resourceList.innerHTML = ""; // Clear previous resources
    
        // If recommendedSkills is passed, only display resources related to those skills
        const resourcesToDisplay = recommendedSkills ? 
            Object.keys(resources).filter(language => recommendedSkills.includes(language)) : 
            Object.keys(resources);
    
        resourcesToDisplay.forEach(language => {
            const languageSection = document.createElement('div');
            const languageTitle = document.createElement('h3');
            languageTitle.textContent = language;
            languageSection.appendChild(languageTitle);
    
            Object.keys(resources[language]).forEach(category => {
                const categorySection = document.createElement('ul');
                const categoryTitle = document.createElement('li');
                categoryTitle.textContent = category;
                categorySection.appendChild(categoryTitle);
    
                const resource = resources[language][category];
                const li = document.createElement("li");
    
                const button = document.createElement("button");
                button.textContent = resource.title;
                button.classList.add("resource-button");
    
                button.addEventListener("click", () => {
                    window.open(resource.url, "_blank");
                });
    
                li.appendChild(button);
                categorySection.appendChild(li);
    
                languageSection.appendChild(categorySection);
            });
    
            resourceList.appendChild(languageSection);
        });
    }
    
    

    // Display resources when logged in
    displayResources();
});
