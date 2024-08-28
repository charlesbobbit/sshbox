const fs = require('fs');
const path = require('path');
const os = require('os');

async function listSessions() {
    try {
        // This is to get the user's home directory again
        const homeDir = os.homedir();
        const sshboxDir = path.join(homeDir, '.sshbox');
        const sessionsFilePath = path.join(sshboxDir, 'session.json');

        
        if (!fs.existsSync(sessionsFilePath)) {
            console.log('No SSH sessions found.');
            return;
        }

        // Read the existing sessions
        const fileContent = fs.readFileSync(sessionsFilePath);
        const sessions = JSON.parse(fileContent);

        // To Display the list of session names
        if (sessions.length === 0) {
            console.log('No SSH sessions found.');
        } else {
            console.log('Available SSH sessions:');
            sessions.forEach(session => {
                console.log(`- ${session.name}`);
            });
        }
    } catch (error) {
        console.error('Error listing SSH sessions:', error);
    }
}

module.exports = listSessions;
