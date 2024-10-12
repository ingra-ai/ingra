import os
import sys
import json
import logging
import subprocess
import tempfile
import shlex
from flask import Flask, request, jsonify
from flask_httpauth import HTTPTokenAuth

app = Flask(__name__)
auth = HTTPTokenAuth(scheme='Bearer')

# Default log file path
DEFAULT_LOG_FILE = 'command_execution.log'

def setup_logging(log_file_path):
    """Set up logging configuration."""
    logging.basicConfig(
        filename=log_file_path,
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    logging.info(f'Logging is set up. Log file path: {log_file_path}')

def load_config():
    """Load configuration from a temporary file."""
    config_path = os.path.join(tempfile.gettempdir(), 'server_config.tmp')
    config = {}
    if os.path.exists(config_path):
        try:
            with open(config_path, 'r') as file:
                config = json.load(file)
                logging.info(f"Configuration loaded from temp file: {config_path}")
        except Exception as e:
            logging.error(f'Failed to load configuration: {e}')
    return config

def save_config(config):
    """Save configuration to a temporary file."""
    config_path = os.path.join(tempfile.gettempdir(), 'server_config.tmp')
    try:
        with open(config_path, 'w') as file:
            json.dump(config, file)
            logging.info(f"Configuration saved to temp file: {config_path}")
    except Exception as e:
        logging.error(f'Failed to save configuration: {e}')

def prompt_user_for_config(existing_config):
    """Prompt the user for configuration, using existing values as defaults."""
    print("Press Enter to keep the previous value shown in brackets.")

    # Bearer token
    bearer_token = input(
        f"Please enter a bearer token for server authentication [{existing_config.get('BEARER_TOKEN', '')}]: "
    ).strip()
    if not bearer_token:
        bearer_token = existing_config.get('BEARER_TOKEN', '')
    if not bearer_token:
        print("Error: Bearer token cannot be empty.")
        sys.exit(1)

    # Working directory
    working_directory = input(
        f"Please enter the working directory for the API [{existing_config.get('WORKING_DIRECTORY', '')}]: "
    ).strip()
    if not working_directory:
        working_directory = existing_config.get('WORKING_DIRECTORY', '')
    if not working_directory or not os.path.isdir(working_directory):
        print("Error: Invalid working directory.")
        sys.exit(1)

    # Log file path
    log_file_path = input(
        f"Please enter the log file path [{existing_config.get('LOG_FILE_PATH', DEFAULT_LOG_FILE)}]: "
    ).strip()
    if not log_file_path:
        log_file_path = existing_config.get('LOG_FILE_PATH', DEFAULT_LOG_FILE)

    # Save configuration
    config = {
        'BEARER_TOKEN': bearer_token,
        'WORKING_DIRECTORY': working_directory,
        'LOG_FILE_PATH': log_file_path
    }
    save_config(config)
    return config

def change_working_directory(directory):
    """Change the current working directory."""
    try:
        os.chdir(directory)
        logging.info(f'Changed working directory to: {directory}')
    except Exception as e:
        logging.error(f'Failed to change working directory: {e}')
        sys.exit(1)

# Load existing configuration or prompt the user
config = load_config()
config = prompt_user_for_config(config)

# Set up logging
setup_logging(config['LOG_FILE_PATH'])

# Change working directory
change_working_directory(config['WORKING_DIRECTORY'])

# Set bearer token
BEARER_TOKEN = config['BEARER_TOKEN']

# Verify Bearer token
@auth.verify_token
def verify_token(token):
    """Verify the provided bearer token."""
    is_valid = token == BEARER_TOKEN
    if not is_valid:
        logging.warning('Invalid bearer token provided.')
    return is_valid

# Log server start
logging.info('Server started. Listening for command executions.')

@app.route('/execute', methods=['POST'])
@auth.login_required
def execute_command():
    """Execute a whitelisted command."""
    data = request.json
    if not data:
        error_message = 'No data provided in request.'
        logging.error(error_message)
        return jsonify({"error": error_message}), 400

    command = data.get('command')
    if not command:
        error_message = 'No command provided in request data.'
        logging.error(error_message)
        return jsonify({"error": error_message}), 400

    # Log the received command
    logging.info(f'Received command request: {command}')

    # Split the command into arguments
    try:
        # Avoid using shell=True for security reasons
        command_args = shlex.split(command)
    except Exception as e:
        error_message = f'Error parsing command: {e}'
        logging.error(error_message)
        return jsonify({"error": error_message}), 400


    # Execute the command
    try:
        result = subprocess.check_output(
            command_args,
            stderr=subprocess.STDOUT,
            text=True
        )
        # Log the command output (truncated for safety)
        logging.info(f'Command output: {result[:1000]}')  # Limit output length
        return jsonify({"output": result}), 200
    except subprocess.CalledProcessError as e:
        error_message = f'Error executing command "{command_name}": {e.output}'
        logging.error(error_message)
        return jsonify({"error": e.output}), 500
    except Exception as e:
        error_message = f'Unexpected error: {e}'
        logging.error(error_message)
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Run the app on localhost to limit exposure
    app.run(host='127.0.0.1', port=5000)
