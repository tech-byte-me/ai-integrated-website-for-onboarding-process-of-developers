import requests
import networkx as nx
from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
import sqlite3
import bcrypt

app = Flask(__name__)
app.secret_key = "your_secret_key_here"  # Set a secure key for session handling
CORS(app)

def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()

    # Create users table with hashed passwords
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS onboarding (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            experience TEXT NOT NULL,
            languages TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    conn.commit()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

# User Registration (Signup)
@app.route('/create_account', methods=['POST'])
def create_account():
    data = request.json
    email = data['email']
    username = data['username']
    password = data['password'].encode('utf-8')

    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())  # Hash password

    conn = sqlite3.connect('database.db')
    c = conn.cursor()

    try:
        c.execute('INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
                  (email, username, hashed_password))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        session['user_id'] = user_id  # Set session for the user after creation
        return jsonify({'message': 'Account created successfully!', 'user_id': user_id})
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Email or username already exists'}), 400

# User Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password'].encode('utf-8')

    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('SELECT id, password FROM users WHERE username = ?', (username,))
    user = c.fetchone()
    conn.close()

    if user and bcrypt.checkpw(password, user[1]):
        session['user_id'] = user[0]  # Store user session
        return jsonify({'message': 'Login successful', 'user_id': user[0]})
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

# Logout Endpoint
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)  # Remove user session
    return jsonify({'message': 'Logged out successfully'})

# Check onboarding status
@app.route('/get_onboarding_status', methods=['GET'])
def get_onboarding_status():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 403

    user_id = session['user_id']
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('SELECT * FROM onboarding WHERE user_id = ?', (user_id,))
    onboarding_data = c.fetchone()
    conn.close()

    if onboarding_data:
        return jsonify({"onboarding_complete": True})
    else:
        return jsonify({"onboarding_complete": False})

# Save onboarding information after registration
@app.route('/save_onboarding', methods=['POST'])
def save_onboarding():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 403

    data = request.json
    user_id = session['user_id']
    experience = data['experience']
    languages = data['languages']

    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    
    c.execute('''INSERT INTO onboarding (user_id, experience, languages)
                 VALUES (?, ?, ?)''', (user_id, experience, languages))
    conn.commit()
    conn.close()

    return jsonify({"message": "Onboarding information saved successfully"})

# Detect Technologies from GitHub Commits
def detect_technologies_from_commit(commit_message, file_extensions):
    technologies = {
        "py": "Python", "js": "JavaScript", "jsx": "React",
        "ts": "TypeScript", "html": "HTML", "css": "CSS",
        "scss": "SCSS", "less": "LESS", "sh": "Shell Scripting",
        "yml": "YAML", "json": "JSON", "tf": "Terraform"
    }

    detected_technologies = [
        tech for tech in technologies.values() if tech.lower() in commit_message.lower()
    ]

    for ext in file_extensions:
        if ext in technologies:
            detected_technologies.append(technologies[ext])

    return list(set(detected_technologies))  # Remove duplicates

# Build Skill Graph for Recommendations
def build_skill_graph():
    G = nx.DiGraph()
    G.add_edge("Python", "Python")
    G.add_edge("Python", "Django")
    G.add_edge("Python", "Flask")
    G.add_edge("JavaScript", "Javascript")
    G.add_edge("JavaScript", "React")
    G.add_edge("JavaScript", "Node.js")
    G.add_edge("AWS", "Terraform")
    G.add_edge("HTML", "CSS")
    G.add_edge("HTML", "HTML")
    
    return G

def recommend_skills(commits):
    G = build_skill_graph()
    detected_skills = set()

    for commit in commits:
        message = commit.get("commit", {}).get("message", "")
        file_extensions = commit.get("file_extensions", [])
        technologies = detect_technologies_from_commit(message, file_extensions)
        detected_skills.update(technologies)

    recommendations = set()
    for skill in detected_skills:
        if skill in G:
            recommendations.update(G.successors(skill))

    return list(recommendations)

# Fetch GitHub Repositories
def fetch_repos(username, token):
    url = f"https://api.github.com/users/{username}/repos"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        return []

# Fetch Commit History from GitHub
def fetch_commit_history(username, repo_name, token):
    url = f"https://api.github.com/repos/{username}/{repo_name}/commits"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return []

    commits = response.json()

    for commit in commits:
        sha = commit["sha"]
        commit_url = f"https://api.github.com/repos/{username}/{repo_name}/commits/{sha}"
        commit_response = requests.get(commit_url, headers=headers)

        if commit_response.status_code == 200:
            commit_data = commit_response.json()
            files = commit_data.get("files", [])

            file_extensions = set()
            for file in files:
                if "filename" in file:
                    ext = file["filename"].split(".")[-1]
                    file_extensions.add(ext)

            commit["file_extensions"] = list(file_extensions)

    return commits

# Analyze GitHub Profile and Recommend Skills
@app.route('/analyze_github', methods=['POST'])
def analyze_github():
    data = request.json
    github_username = data['githubUsername']
    github_token = data['githubToken']

    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 403

    repos = fetch_repos(github_username, github_token)
    if not repos:
        return jsonify({"error": "No repositories found or authentication issue."})

    all_commits = []
    for repo in repos:  
        commits = fetch_commit_history(github_username, repo['name'], github_token)
        all_commits.extend(commits)

    recommended_skills = recommend_skills(all_commits)
    return jsonify({"recommended_skills": recommended_skills})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
