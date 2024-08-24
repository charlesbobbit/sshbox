#!/usr/bin/env node

const newSession = require('./commands/newSession');
const listSessions = require('./commands/listSessions');
const connectSession = require('./commands/connectSession');

const command = process.argv[2];
const sessionName = process.argv[3]; // The name of the session for connect command

if (command === 'new') {
    newSession();
} else if (command === 'list') {
    listSessions();
} else if (command === 'connect' && sessionName) {
    connectSession(sessionName);
} else {
    console.log(`Unknown command: ${command}`);
    console.log('Available commands: new, list, connect <session_name>');
}
