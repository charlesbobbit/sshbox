
# SSHBox

SSHBox is a simple and interactive CLI tool for managing and connecting to SSH sessions. It allows you to easily create, list, connect, and delete SSH sessions from the command line.

## Installation

To get started with SSHBox:

1. **Install the package globally:**

   ```bash
   npm install -g sshbox
   ```

2. **Start using SSHBox:**

   ```bash
   sshbox
   ```

## Commands

- **Create a new session:**

  ```bash
  sshbox new
  ```

  Use this command to create a new SSH session by providing details like the host, port, username, and authentication method.

- **List all available sessions:**

  ```bash
  sshbox list
  ```

  This command displays a list of all saved SSH sessions.

- **Connect to a session:**

  ```bash
  sshbox connect
  ```

  Opens an interactive list of all saved sessions. Use the arrow keys to select a session and connect to it. Add the session name as an argumkent to directly connect to the session.

- **Delete a session:**

  ```bash
  sshbox delete
  ```

  Opens an interactive list of all saved sessions. Use the arrow keys to select a session and delete it.


