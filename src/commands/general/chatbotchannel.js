const { SlashCommandBuilder } = require("discord.js");
const { Guild } = require('../../schemas/Guild')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("chatbotchannel")
        .setDescription("Set the channel for the chatbot")
        .addChannelOption(option => option.setName('channel').setDescription('Select a channel')),
    async execute(interaction, client) {

        const channel = interaction.options.getChannel('channel').id;
        const profile = await Guild.updateOne({ "guildId": interaction.guild.id }, { $set: { "ChatBotChannel": channel } })


        interaction.reply({ content: `chatbot channel has been set to: <#${channel}>`})

        
    },
};