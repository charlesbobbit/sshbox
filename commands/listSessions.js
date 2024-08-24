const fs = require('fs');
const path = require('path');
const os = require('os');

// Function to list all SSH sessions
async function listSessions() {
    try {
        // Get the user's home directory
        const homeDir = os.homedir();
        const sshboxDir = path.join(homeDir, '.sshbox');
        const sessionsFilePath = path.join(sshboxDir, 'session.json');

        // Check if the session.json file exists
        if (!fs.existsSync(sessionsFilePath)) {
            console.log('No SSH sessions found.');
            return;
        }

        // Read the existing sessions
        const fileContent = fs.readFileSync(sessionsFilePath);
        const sessions = JSON.parse(fileContent);

        // Display the list of session names
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

// Export the function for use in other modules
module.exports = listSessions;
