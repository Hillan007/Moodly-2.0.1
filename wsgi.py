# WSGI file for PythonAnywhere
import sys
import os

# Add your project directory to sys.path
project_home = '/home/yourusername/moodly-app'  # Replace 'yourusername' with your PA username
if project_home not in sys.path:
    sys.path = [project_home] + sys.path

from app import app as application

if __name__ == "__main__":
    application.run()