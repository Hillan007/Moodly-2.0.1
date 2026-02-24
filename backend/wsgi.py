# WSGI file for PythonAnywhere
import sys
import os

# Add your project directory to sys.path
project_home = 'https://www.pythonanywhere.com/user/Hillan007/webapps/#tab_id_hillan007_pythonanywhere_com'  # Replace 'yourusername' with your PA username
if project_home not in sys.path:
    sys.path = [project_home] + sys.path

from app import app as application

if __name__ == "__main__":
    application.run()