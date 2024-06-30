const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const { token } = require('./env');
const checkAIStatus = require('./utils/checkAIStatus');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); 

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Notification handler
const notificationFiles = fs.readdirSync('./notifications').filter(file => file.endsWith('.js'));
for (const file of notificationFiles) {
    const notification = require(`./notifications/${file}`);
    notification.run(client); // Assuming notifications have a run function
}

client.once('ready', async () => {
    console.log('Bot is online!');

    const commands = [];
    client.commands.forEach(command => {
        commands.push(command.data.toJSON());
    });

    try {
        await client.application.commands.set(commands);
        console.log('Slash commands registered globally!');
    } catch (error) {
        console.error('Failed to register slash commands globally:', error);
    }
});

client.login(token)
    .catch(error => {
        console.error('Error logging in:', error);
    });

setInterval(checkAIStatus, 1000);

const api = express();
const port = 3000;

// Use CORS to allow cross-origin requests
api.use(cors());

// Connect to SQLite database
const db = new sqlite3.Database('./image_database.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Define a route to fetch all users
api.get('/', (req, res) => {
    const tables = ['images']; // Add more table names if you have multiple tables
    let results = {};

    const fetchTableData = (table, callback) => {
        const sql = `SELECT * FROM ${table}`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                callback(err);
            } else {
                results[table] = rows;
                callback(null);
            }
        });
    };

    const fetchData = (tables, index, callback) => {
        if (index >= tables.length) {
            callback(null);
        } else {
            fetchTableData(tables[index], (err) => {
                if (err) {
                    callback(err);
                } else {
                    fetchData(tables, index + 1, callback);
                }
            });
        }
    };

    fetchData(tables, 0, (err) => {
        if (err) {
            res.status(400).json({ success: false, error: err.message });
        } else {
            res.json({
                success: true,
                data: results
            });
        }
    });
});

// Start the server
api.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});