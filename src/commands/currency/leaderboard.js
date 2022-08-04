const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { User } = require("../../schemas/Money");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("🏅 shows the money leaderboard"),
  async execute(interaction, client) {

        const users = await User.find().then(users => {
            return users.filter(async user => await interaction.guild.members.fetch(user.id))
        })

        const sortedUsers = users.sort((a, b) => {
            return (b.wallet + b.bank) - (a.wallet + a.bank)
        }).slice(0, 10)

        return interaction.reply({ embeds: [
            new EmbedBuilder()
            .setAuthor({ name: `🏆 ${interaction.guild.name}'s leaderboard`})
            .setColor('Yellow')
            .setDescription(sortedUsers.map((user, index) => {
                return `**\`[ ${index + 1} ]\`** | **<@${user.id}>** : \` ${user.wallet + user.bank} 🪙 \``
            }).join("\n"))
        ]})

  },
};