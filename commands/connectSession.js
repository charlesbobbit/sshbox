const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function connectSession(sessionName) {
    const ssh = new NodeSSH();
    try {
        const homeDir = os.homedir();
        const sshboxDir = path.join(homeDir, '.sshbox');
        const sessionsFilePath = path.join(sshboxDir, 'session.json');

        if (!fs.existsSync(sessionsFilePath)) {
            console.log('No sessions found. Please create a session first.');
            return;
        }
        const sessions = JSON.parse(fs.readFileSync(sessionsFilePath));

        const session = sessions.find(s => s.name === sessionName);
        if (!session) {
            console.log(`Session '${sessionName}' not found.`);
            return;
        }

        const connectionOptions = {
            host: session.host,
            port: session.port,
            username: session.username,
        };

        if (session.credentialType === 'keyPath') {
            // Read the private key file content
            const privateKeyPath = path.resolve(session.credential); // Ensure it's an absolute path
            if (fs.existsSync(privateKeyPath)) {
                connectionOptions.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
            } else {
                throw new Error(`Private key file not found: ${privateKeyPath}`);
            }
        } else if (session.credentialType === 'password') {
            connectionOptions.password = session.credential;
        }

        console.log(`Connecting to ${session.host}...`);
        await ssh.connect(connectionOptions);
        console.log(`Connected to ${session.host}.`);

        // Allocate a pseudo-terminal (PTY) to ensure proper terminal behavior
        ssh.connection.shell({ term: 'xterm-color' }, (err, stream) => {
            if (err) throw err;

            process.stdin.setRawMode(true);

            // Listen for data input and send it directly to the SSH stream
            process.stdin.on('data', (data) => {
                // Write the data to the SSH stream to avoid duplication
                stream.write(data);
            });

            // Pipe the output from the SSH stream back to the terminal
            stream.pipe(process.stdout);
            stream.stderr.pipe(process.stderr);

            // Handle proper signal transmission for CTRL-C
            stream.on('close', () => {
                process.stdin.setRawMode(false);
                ssh.dispose();
                console.log('Connection closed.');
            });

            // Handle the 'end' event to properly end the session
            stream.on('end', () => {
                console.log('Session ended.');
            });
        });

    } catch (error) {
        console.error('Error connecting to SSH session:', error);
    }
}

module.exports = connectSession;
