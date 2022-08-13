const { EmbedBuilder } = require('discord.js')
const { setup, beginSetup} = require("../../embeds/SetupEmbeds");

module.exports = {
    data: {
        name: "Confirmed",
    },
    async execute(interaction, client) {
        
        interaction.reply({ embeds: [beginSetup], fetchReply: true }).then(() => { // to send the default first embed.
            setTimeout(function () { // timeout function to update the reply.
                interaction.editReply({ embeds: [setup] }) // getting my update embed from another file.
            }, 2000) // the timeout
        })

       
    },
};
