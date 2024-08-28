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
            // This part is to read the private key file content before passing
            const privateKeyPath = path.resolve(session.credential);
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

        // I added this to allocate a pseudo-terminal (PTY) to ensure proper terminal behavior & formatting
        ssh.connection.shell({ term: 'xterm-color' }, (err, stream) => {
            if (err) throw err;

            process.stdin.setRawMode(true);
            process.stdin.resume();
            
            process.stdin.pipe(stream);
            stream.pipe(process.stdout);
            stream.stderr.pipe(process.stderr);

            // This is to handle the closing of the shell
            stream.on('close', () => {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                ssh.dispose();
                console.log('Connection closed.');
            });

            // To handle the end of the stream
            stream.on('end', () => {
                console.log('Session ended.');
            });
        });

    } catch (error) {
        console.error('Error connecting to SSH session:', error);
    }
}

module.exports = connectSession;
