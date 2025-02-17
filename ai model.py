import requests
import time

# Set your Groq API key (make sure to securely store your keys and not hardcode them)
groq_api_key = "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"
groq_endpoint = "https://api.groq.com/openai/v1"  # Example endpoint (make sure it's correct)

# Set your GitHub API credentials
github_username = "YOUR_GITHUB_USERNAME"
github_token = "YOUR_GITHUB_TOKEN"

# Function to fetch repositories using the GitHub API
def fetch_repositories(username, token):
    github_url = f"https://api.github.com/users/{username}/repos"
    headers = {
        'Authorization': f'token {token}'  # Authorization header using the token
    }

    response = requests.get(github_url, headers=headers)

    if response.status_code == 200:
        return response.json()  # Return repository data if the request is successful
    else:
        print(f"Error: {response.status_code}")
        return []

# Function to classify repository description using Groq AI
def classify_repository_with_groq_ai(description):
    if not description:
        return "Beginner"  # If no description, assume beginner level

    try:
        headers = {
            'Authorization': f'Bearer {groq_api_key}',  # Your Groq API Key
            'Content-Type': 'application/json',
        }
        data = {
            'text': description,  # The description text to classify
        }

        max_retries = 3  # Retry up to 3 times
        for attempt in range(max_retries):
            try:
                response = requests.post(groq_endpoint, headers=headers, json=data)

                if response.status_code == 200:
                    result = response.json()
                    return result.get('category', 'Intermediate')
                elif response.status_code == 503:  # Service Unavailable
                    print("Service unavailable, retrying...")
                    time.sleep(5)  # Wait for 5 seconds before retrying
                else:
                    print(f"Error in Groq AI classification: {response.status_code}")
                    break
            except requests.exceptions.RequestException as e:
                print(f"Request failed on attempt {attempt + 1}: {e}")
                if attempt < max_retries - 1:
                    time.sleep(5)  # Wait before retrying

        return "Intermediate"  # Default to Intermediate if all retries fail

    except Exception as e:
        print(f"Error in AI classification: {e}")
        return "Intermediate"  # Default to Intermediate if an error occurs

# Function to classify repository description with fallback logic if Groq AI fails
def classify_repository_with_fallback(description):
    if not description:
        return "Beginner"

    description_lower = description.lower()
    if 'birthday' in description_lower or 'gift' in description_lower:
        return "Intermediate"
    return "Beginner"  # Default fallback to Beginner

# Main function to prompt for GitHub credentials and display categorized repositories
def main():
    # Get GitHub credentials from the user
    username = input("Enter your GitHub username: ")
    token = input("Enter your GitHub personal access token: ")

    # Fetch repositories from the GitHub API
    repos = fetch_repositories(username, token)

    if not repos:
        print("No repositories found or invalid credentials.")
        return

    print(f"\nRepositories for {username}:\n")

    # For each repository, classify and display its category using Groq AI or fallback logic
    for repo in repos:
        print(f"Repository: {repo['name']}")
        description = repo.get('description', '')
        category = classify_repository_with_groq_ai(description)

        if category == "Intermediate":
            print("Groq AI classification failed, using fallback logic.")
            category = classify_repository_with_fallback(description)

        print(f"Category: {category}")
        print(f"Description: {description if description else 'No description available.'}")
        print("-----------")

if __name__ == "__main__":
    main()
