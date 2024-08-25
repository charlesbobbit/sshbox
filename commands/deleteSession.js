const { select } = require('@inquirer/prompts');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function deleteSession() {
    try {
        const homeDir = os.homedir();
        const sshboxDir = path.join(homeDir, '.sshbox');
        const sessionsFilePath = path.join(sshboxDir, 'session.json');

        if (!fs.existsSync(sessionsFilePath)) {
            console.log('No sessions found to delete.');
            return;
        }

        const sessions = JSON.parse(fs.readFileSync(sessionsFilePath));
        if (sessions.length === 0) {
            console.log('No sessions available to delete.');
            return;
        }

        // Ensure that we don't enter a loop or repeat the choices
        const uniqueSessions = [...new Set(sessions.map(session => session.name))];

        const sessionName = await select({
            message: 'Select a session to delete:',
            choices: uniqueSessions.map(name => ({ name, value: name }))
        });

        // Filter out the selected session
        const updatedSessions = sessions.filter(session => session.name !== sessionName);

        // Write the updated sessions back to the session.json file
        fs.writeFileSync(sessionsFilePath, JSON.stringify(updatedSessions, null, 2));

        console.log(`Session '${sessionName}' has been deleted.`);

    } catch (error) {
        console.error('Error deleting SSH session:', error);
    }
}

module.exports = deleteSession;
