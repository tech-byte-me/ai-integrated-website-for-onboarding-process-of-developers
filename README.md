kindly download all the modules using command propmt for backend app.py.
To run this Flask application successfully, you need to install the required Python packages. Here's the requirements.txt file you should create:

txt
Copy
Edit
Flask
Flask-Cors
bcrypt
requests
networkx
sqlite3

Steps to Install Required Packages:
Create a requirements.txt file with the above content.

Install the dependencies using the following command:

pip install -r requirements.txt

Additional Notes:
sqlite3 is included in Python's standard library, so you don't need to install it separately.

Ensure you have Python 3 installed (python --version or python3 --version).

If you face any issues with bcrypt, you may need to install wheel and setuptools first:

pip install wheel setuptools
