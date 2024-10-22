const { select } = require('@inquirer/prompts');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { NodeSSH } = require('node-ssh');

async function reconnectSession() {
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
        if (sessions.length === 0) {
            console.log('No sessions available to connect. Please create a session first.');
            return;
        }

        const sessionName = await select({
            message: 'Select a session to connect:',
            choices: sessions.map(session => ({ name: session.name, value: session.name }))
        });

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
            // This is again to read t he keypath first
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

        // Again allocate PTY
        ssh.connection.shell({ term: 'xterm-color' }, (err, stream) => {
            if (err) throw err;

            // This step was necessary to nnable raw mode on stdin to handle character-by-character input
            process.stdin.setRawMode(true);
            process.stdin.resume();

            process.stdin.pipe(stream);
            stream.pipe(process.stdout);
            stream.stderr.pipe(process.stderr);

            // To handle the closing of the shell
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

module.exports = reconnectSession;
