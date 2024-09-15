from flask import Flask, request, jsonify
import subprocess
import logging
import os

app = Flask(__name__)

# Set up logging
log_file_path = 'command_execution.log'
logging.basicConfig(
    filename=log_file_path,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Prompt the user to enter a bearer token and working directory
BEARER_TOKEN = input('Please enter a bearer token for server authentication: ').strip()
WORKING_DIRECTORY = input('Please enter the working directory for the API: ').strip()

# Change the current working directory
try:
    os.chdir(WORKING_DIRECTORY)
    logging.info(f'Changed working directory to: {WORKING_DIRECTORY}')
except Exception as e:
    logging.error(f'Failed to change working directory: {e}')
    raise

# Log the server start
logging.info('Server started. Listening for command executions.')

@app.route('/execute', methods=['POST'])
def execute_command():
    # Check for the authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or auth_header.split(' ')[1] != BEARER_TOKEN:
        logging.warning('Unauthorized access attempt.')
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    command = data.get('command')

    if not command:
        error_message = 'No command provided.'
        logging.error(error_message)
        return jsonify({"error": error_message}), 400

    # Log the received command
    logging.info(f'Received command: {command}')

    # Run the shell command
    try:
        result = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT, text=True)
        # Log the command output
        logging.info(f'Command output: {result}')
        return jsonify({"output": result}), 200
    except subprocess.CalledProcessError as e:
        # Log the error
        logging.error(f'Error executing command: {e.output}')
        return jsonify({"error": e.output}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
