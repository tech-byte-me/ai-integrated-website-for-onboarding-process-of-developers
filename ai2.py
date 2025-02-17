import requests
from bs4 import BeautifulSoup

# Function to categorize the user based on Leetcode problems solved
def categorize_user(username):
    url = f"https://leetcode.com/{username}/"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        # Make a request to the LeetCode user's profile page with User-Agent
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            return {"error": f"Failed to retrieve the profile page. Status code: {response.status_code}"}

        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the solved problem statistics from the profile page (you may need to adjust the parsing)
        stats = soup.find('div', class_="profile-stats-container")
        
        if not stats:
            return {"error": "Could not find the problem statistics on the profile page."}
        
        # Extract the solved problem counts by difficulty (you'll need to check the exact structure of the page)
        problems_solved = stats.find_all('div', class_="stat-value")

        if len(problems_solved) < 3:
            return {"error": "Could not find enough problem statistics to categorize the user."}
        
        beginner_count = int(problems_solved[0].text.strip())  # Adjust according to where each stat is found
        intermediate_count = int(problems_solved[1].text.strip())  # Adjust this index if necessary
        hard_count = int(problems_solved[2].text.strip())  # Adjust this index if necessary

        # Categorize based on the counts
        if beginner_count > intermediate_count and beginner_count > hard_count:
            category = "Beginner"
        elif intermediate_count > beginner_count and intermediate_count > hard_count:
            category = "Intermediate"
        else:
            category = "Hard"

        return {
            "username": username,
            "beginner_count": beginner_count,
            "intermediate_count": intermediate_count,
            "hard_count": hard_count,
            "category": category
        }

    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}

# Example usage:
username = input("Enter LeetCode username: ")
user_data = categorize_user(username)

if 'error' in user_data:
    print(user_data['error'])
else:
    print(f"User: {user_data['username']}")
    print(f"Beginner Problems Solved: {user_data['beginner_count']}")
    print(f"Intermediate Problems Solved: {user_data['intermediate_count']}")
    print(f"Hard Problems Solved: {user_data['hard_count']}")
    print(f"Category: {user_data['category']}")
