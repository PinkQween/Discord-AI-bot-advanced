const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');

const { token } = require('./env')

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