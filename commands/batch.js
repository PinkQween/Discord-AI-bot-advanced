const { automatic1111, positivePrompt, negativePrompt } = require('../env')
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const fs = require('fs');

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
        ),
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const count = interaction.options.getInteger('count');

        await interaction.reply('Generating images...');

        try {
            for (let i = 0; i < count; i++) {
                const response = await axios.post(automatic1111, {
                    prompt: prompt + positivePrompt,
                    negative_prompt: negativePrompt
                });

                const imageBuffer = Buffer.from(response.data.images[0], 'base64');
                const filename = `output_${i}.png`;

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
                if (err) throw err;
                console.error('Error generating images:', error);
            });
            interaction.editReply('Sorry, Google Colab isn\'t running.');
        }
    },
};