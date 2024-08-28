const { input, confirm, password } = require('@inquirer/prompts');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function createNewSession() {
    try {
        // To Get the user's home directory
        const homeDir = os.homedir();
        const sshboxDir = path.join(homeDir, '.sshbox');
        const sessionsFilePath = path.join(sshboxDir, 'session.json');

        // To Ensure the .sshbox directory exists
        if (!fs.existsSync(sshboxDir)) {
            fs.mkdirSync(sshboxDir);
        }

        // Ti Ensure the session.json file exists
        let sessions = [];
        if (fs.existsSync(sessionsFilePath)) {
            // Read the existing sessions
            const fileContent = fs.readFileSync(sessionsFilePath);
            sessions = JSON.parse(fileContent);
        }

        // To Coolect user inputs
        const name = await input({ message: 'What would you like to call your session: '});
        const host = await input({ message: 'Enter the SSH host (e.g., ...@host):' });
        const port = await input({ message: 'Enter the SSH port:', default: '22' });
        const username = await input({ message: 'Enter the host username (e.g., username@...):' });

        // Ask if the user wants to use a key file or a password
        const useKeyFile = await confirm({ message: 'Do you want to use a key file for authentication?', default: true });

        let credential;
        if (useKeyFile) {
            credential = await input({ message: 'Enter the path to the SSH key file: (Use an absolute path e.g. /home/..)', default: '~/.ssh/id_rsa' });
        } else {
            credential = await password({ message: 'Enter your SSH password:', mask: '*' });
        }

        // Display the collected information
        console.log(`Session: ${name}`);
        console.log(`Host: ${host}`);
        console.log(`Username: ${username}`);
        console.log(`Port: ${port}`);
        console.log(useKeyFile ? `Key Path: ${credential}` : `Password: ${'*'.repeat(credential.length)}`);

        // Create the session object
        const session = {
            name,
            host,
            username,
            port,
            credentialType: useKeyFile ? 'keyPath' : 'password',
            credential
        };

        // Add the new session
        sessions.push(session);

        // To Write the updated sessions array back to the file
        fs.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 2));

        console.log('SSH session details saved successfully!');
    } catch (error) {
        console.error('Error creating SSH session:', error);
    }
}

module.exports = createNewSession;
