from flask import Flask, render_template, request
from flask_cors import CORS  # Import CORS
import subprocess

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def index():
    return render_template('pythonSnake.html')

@app.route('/run_script', methods=['POST'])
def run_script():
    try:
        result = subprocess.run(['python3', 'main.py'], capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"Script failed with error:\n{e.stderr}", 500
    except Exception as e:
        return f"An unexpected error occurred:\n{str(e)}", 500

if __name__ == '__main__':
    app.run(debug=True)
