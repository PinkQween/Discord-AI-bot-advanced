module.exports = {
    run: client => {
        client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;

            const { commandName, options } = interaction;

            if (!client.commands.has(commandName)) return;

            try {
                await client.commands.get(commandName).execute(interaction, options);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        });
    },
};