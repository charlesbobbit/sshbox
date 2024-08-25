#!/usr/bin/env node

const newSession = require('./commands/newSession');
const listSessions = require('./commands/listSessions');
const connectSession = require('./commands/connectSession');
const reconnectSession = require('./commands/reconnectSession');
const deleteSession = require('./commands/deleteSession'); 

const command = process.argv[2];
const sessionName = process.argv[3]; // The name of the session for connect command

if (command === 'new') {
    newSession();
} else if (command === 'list') {
    listSessions();
} else if (command === 'delete') {
    deleteSession();
} else if (command === 'connect') {
    if (sessionName) {
        connectSession(sessionName);
    } else {
        reconnectSession(); // No session name provided, so show the list
    }
} else if (!command) { // Handle case with no command
    console.log('\x1b[34m%s\x1b[0m', 'SSH-BOX CLI Tool');
    console.log('\x1b[36m%s\x1b[0m', '------------------------');
    console.log('SSH-BOX is a command-line tool for managing SSH sessions.');
    console.log('');
    console.log('Commands:');
    console.log('  new            - Create a new SSH session.');
    console.log('  list           - List all existing SSH sessions.');
    console.log('  connect        - Connect to an existing SSH session. (Use without session name to select from a list)');
    console.log('');
    console.log('For more information, visit the SSH-BOX documentation.');
} else {
    console.log(`Unknown command: ${command}`);
    console.log('Available commands: new, list, connect [<session_name>]');
}
