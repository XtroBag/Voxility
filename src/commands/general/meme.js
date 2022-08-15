const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { fetch } = require("undici");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("meme")
        .setDescription("shows a random meme"),
    async execute(interaction, client) {
        return await fetch(`https://api.imgflip.com/get_memes`)
            .then(response => response.json())
            .then(body => {
                var items = body.data.memes;
                let value = items[Math.floor(Math.random() * items.length)];

                const embed = new EmbedBuilder()
                    .setTitle(`${value.name}`)
                    .setImage(`${value.url}`)
                    .setFooter({ text: `width: ${value.width} height: ${value.height}` })
                    .setTimestamp()

                interaction.reply({ embeds: [embed] });
                console.log(value)
            })
    },
};