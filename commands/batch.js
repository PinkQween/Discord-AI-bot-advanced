const { automatic1111, positivePrompt, negativePrompt } = require('../env')
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const fs = require('fs');
const saveToDatabase = require('../utils/saveToDatabase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('batch')
        .setDescription('Generates multiple AI image')
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of images to generate')
                .setRequired(true)
        )
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
        const count = interaction.options.getInteger('count');
        const width = interaction.options.getInteger('width');
        const height = interaction.options.getInteger('height');

        // Check if both width and height are provided or both are absent
        if ((width && !height) || (!width && height)) {
            return interaction.reply('Please provide both width and height or none.');
        }

        await interaction.reply('Generating images...');

        try {
            for (let i = 0; i < count; i++) {
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
                const filename = `output_${i}.png`;

                saveToDatabase(prompt, imageBuffer, err => {
                    if (err) throw err;
                });

                fs.writeFileSync(filename, imageBuffer);

                await interaction.channel.send({
                    files: [{
                        attachment: filename,
                        name: filename
                    }]
                });

                fs.unlinkSync(filename);
            }
        } catch (error) {
            console.error('Error generating images:', error);
            fs.writeFile('error.log', `Error generating images: ${error}\n`, { flag: 'a' }, (err) => {
                // if (err) throw err;
                console.error('Error generating images:', error);
            });
            interaction.editReply('Sorry, Google Colab isn\'t running.');
        }
    },
};