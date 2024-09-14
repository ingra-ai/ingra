# Local Scripts

This directory contains scripts and tools that were developed and executed using a combination of the Ingra platform and `ngrok`. The primary purpose is to remotely execute shell commands in a secure and controlled environment.

## Overview

The scripts in this directory allow you to:
- Run shell commands on a remote server securely.
- Manage files and directories.
- Integrate these capabilities into an automated workflow using Ingra functions.

## Key Components

### 1. `flask_server.py`
A Flask server that:
- Accepts shell commands via an HTTP API.
- Uses a Bearer token for authentication.
- Logs all commands and outputs to `command_execution.log`.
- Sets a working directory for all command executions to ensure a controlled environment.

### 2. Command Execution and Logging
- Commands are sent to the Flask server using a POST request.
- The server executes the command, logs the input and output to `command_execution.log`, and returns the result.
- The current working directory is set dynamically at server startup, ensuring commands are executed in a specified context.

### 3. Security
- `ngrok` is used to expose the local Flask server to the internet securely.
- A Bearer token (`LOCAL_NGROK_BEARER`) is required to authenticate API requests, preventing unauthorized access.
- Commands are executed on the remote server using the Ingra platform, which invokes the secure endpoint provided by `ngrok`.


## How It Works

### Setting Up the Flask Server
1. **Start the Flask Server**:
   - Run `flask_server.py`.
   - Enter the Bearer token and working directory when prompted.

2. **Expose with `ngrok`**:
   - Start `ngrok` to expose the Flask server to the internet.
   - Set the `LOCAL_NGROK_URL` environment variable with the `ngrok` URL.

### Using Ingra to Execute Commands
1. **Create Ingra Function**:
   - The `executeRemoteShellCommand` function on the Ingra platform uses `fetch` to send commands to the Flask server.
   - Environment variables `LOCAL_NGROK_URL` and `LOCAL_NGROK_BEARER` are used for the server URL and authentication.


2. **Execute Commands**:
   - Use the Ingra function to send commands (e.g., `ls -la`, `git status`).
   - Commands are executed remotely, and results are returned for review.

## Example Workflow

1. **Start the Flask Server**:
   ```bash
   python3 flask_server.py
   ```
   Enter the Bearer token and working directory when prompted.

2. **Start `ngrok`**:
   ```bash
   ngrok http 5000
   ```
   Update the `LOCAL_NGROK_URL` environment variable with the `ngrok` URL.

3. **Execute Remote Commands**:
   - Use the Ingra function `executeRemoteShellCommand` to run commands like `ls -la` or `git status`.
   - Review outputs and logs to ensure everything is running correctly.


## Git Management

- Files and directories managed here include:
  - `flask_server.py`
  - `.gitignore` to exclude unnecessary files like `command_execution.log` and the virtual environment directory `.venv/`.
- **Git Operations**:
  - We used `git` commands to add, commit, and push changes using Ingra functions.

## Security Considerations

- **Authentication**: Always use a strong, unique Bearer token.
- **Secure Connections**: Use ngrok HTTPS URL to ensure secure communication.

## Conclusion

This setup demonstrates how to securely execute and manage scripts on a remote server using a combination of Ingra functions and `ngrok`. The flexibility of this setup allows for powerful automation capabilities while maintaining security and control over the environment.

---

*This `README.md` was created based on a conversation using Ingra functions and `ngrok` for remote shell command execution.*
