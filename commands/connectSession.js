const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Function to handle connecting to an SSH session
async function connectSession(sessionName) {
    const ssh = new NodeSSH();
    try {
        // Get the user's home directory and paths to necessary files
        const homeDir = os.homedir();
        const sshboxDir = path.join(homeDir, '.sshbox');
        const sessionsFilePath = path.join(sshboxDir, 'session.json');

        // Ensure the session.json file exists and read the session data
        if (!fs.existsSync(sessionsFilePath)) {
            console.log('No sessions found. Please create a session first.');
            return;
        }
        const sessions = JSON.parse(fs.readFileSync(sessionsFilePath));

        // Find the session by name
        const session = sessions.find(s => s.name === sessionName);
        if (!session) {
            console.log(`Session '${sessionName}' not found.`);
            return;
        }

        // Set up the connection options based on the session data
        const connectionOptions = {
            host: session.host,
            port: session.port,
            username: session.username, // Assuming session.username is provided separately
        };

        if (session.credentialType === 'keyPath') {
            connectionOptions.privateKey = session.credential;
        } else if (session.credentialType === 'password') {
            connectionOptions.password = session.credential;
        }

        // Connect to the remote server
        console.log(`Connecting to ${session.host}...`);
        await ssh.connect(connectionOptions);
        console.log(`Connected to ${session.host}.`);

        // Start an interactive SSH shell session
        ssh.connection.shell((err, stream) => {
            if (err) throw err;
            process.stdin.pipe(stream);
            stream.pipe(process.stdout);
            stream.stderr.pipe(process.stderr);
        });

    } catch (error) {
        console.error('Error connecting to SSH session:', error);
    }
}

module.exports = connectSession;
