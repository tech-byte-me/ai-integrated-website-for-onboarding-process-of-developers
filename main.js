document.addEventListener("DOMContentLoaded", function () {
    const accountForm = document.getElementById("account-form");
    const githubForm = document.getElementById("github-form");
    const recommendationsSection = document.getElementById("recommendations");
    const resourceList = document.getElementById("resource-list");
    const githubCredentialsSection = document.getElementById("github-credentials");
    const accountCreationSection = document.getElementById("account-creation");

    // Handle account creation
    accountForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent page reload
        const email = document.getElementById("email").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const response = await fetch('http://127.0.0.1:5000/create_account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, username, password }),
        });

        const data = await response.json();
        const userId = data.user_id;

        // After account creation, show the GitHub credentials form
        localStorage.setItem("user_id", userId);
        accountCreationSection.style.display = "none";
        githubCredentialsSection.style.display = "block";
    });

    // Handle GitHub credentials submission
    githubForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent page reload
        const githubUsername = document.getElementById("github-username").value;
        const githubToken = document.getElementById("github-token").value;

        const response = await fetch('http://127.0.0.1:5000/analyze_github', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ githubUsername, githubToken }),
        });

        const data = await response.json();

        // Show recommendations based on the inputs
        displayResources(data.recommended_skills);

        // Show the recommendations section
        githubCredentialsSection.style.display = "none";
        recommendationsSection.style.display = "block";
    });

    // Function to display resources dynamically
    function displayResources(resources) {
        resourceList.innerHTML = ''; // Clear any previous resources
        resources.forEach(resource => {
            const li = document.createElement("li");
            li.textContent = resource;
            resourceList.appendChild(li);
        });
    }
});
