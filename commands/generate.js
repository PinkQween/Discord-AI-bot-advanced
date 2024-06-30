const { automatic1111, positivePrompt, negativePrompt } = require('../env')
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Generates an AI image')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('AI prompt')
                .setRequired(true)
        ),
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');

        interaction.deferReply()

        try {
            const response = await axios.post(automatic1111, {
                prompt: prompt + positivePrompt,
                negative_prompt: negativePrompt
            });

            const imageBuffer = Buffer.from(response.data.images[0], 'base64');

            fs.writeFileSync('output.png', imageBuffer);

            await interaction.editReply({
                files: [{
                    attachment: 'output.png',
                    name: 'output.png'
                }]
            });

            fs.unlinkSync('output.png');
        } catch (error) {
            console.error('Error generating image:', error);
            fs.writeFile('error.log', `Error generating image: ${error}\n`, { flag: 'a' }, (err) => {
                if (err) throw err;
                console.error('Error generating image:', error);
            });
            await interaction.editReply('Sorry, google collab isn\'t running.');
        }
    },
};