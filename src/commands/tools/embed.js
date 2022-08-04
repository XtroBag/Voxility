const { SlashCommandBuilder, EmbedBuilder, Embed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("📃 Returns an embed"),
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
    .setTitle('this is the title')
    .setDescription('this is a description')
    .setColor(0x18e1ee)
    .setThumbnail(interaction.user.displayAvatarURL())
    .setTimestamp(Date.now())

   await interaction.reply({ embeds: [embed] })
  },
};
