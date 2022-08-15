const { Guild } = require('../../schemas/Guild')
const mongoose = require('mongoose')
const { fetch } = require("undici");
const name = "Voxility"

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        let guildProfile = await Guild.findOne({ guildId: message.guild.id })

        if (message.author.bot) return;
        if (message.channel.id === guildProfile.ChatBotChannel) {
            return await fetch(`https://api.udit.tk/api/chatbot?message=${message.content}[&name=${name}&user=${message.author.id}&gender=male]`)
                .then(response => response.json())
                .then(data => {
                    message.reply(data.message)
                })     
        }
    }
}