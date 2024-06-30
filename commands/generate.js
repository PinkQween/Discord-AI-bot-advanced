const { automatic1111, positivePrompt, negativePrompt } = require('../env')
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const fs = require('fs');
const saveToDatabase = require('../utils/saveToDatabase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Generates an AI image')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('AI prompt')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('width')
                .setDescription('Image width (optional)')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('height')
                .setDescription('Image height (optional)')
                .setRequired(false)
        ),
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const width = interaction.options.getInteger('width');
        const height = interaction.options.getInteger('height');

        // Check if both width and height are provided or both are absent
        if ((width && !height) || (!width && height)) {
            return interaction.reply('Please provide both width and height or none.');
        }

        if (width == height != 512) {
            return interaction.reply('Sorry, API is only willing to do 512x512.');
        }

        interaction.deferReply()

        try {
            const response = await axios.post(automatic1111, width ? {
                prompt: prompt + positivePrompt,
                negative_prompt: negativePrompt,
                width,
                height,
            } : {
                prompt: prompt + positivePrompt,
                negative_prompt: negativePrompt,
            });

            const imageBuffer = Buffer.from(response.data.images[0], 'base64');

            saveToDatabase(prompt, imageBuffer, err => {
                if (err) throw err;
            });

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
                // if (err) throw err;
                console.error('Error generating image:', error);
            });
            await interaction.editReply('Sorry, google collab isn\'t running.');
        }
    },
};