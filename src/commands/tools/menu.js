const { SlashCommandBuilder, SelectMenuBuilder, ActionRowBuilder, SelectMenuOptionBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("menu")
    .setDescription("📲 Return a select menu"),
  async execute(interaction, client) {
    const menu = new SelectMenuBuilder()
    .setCustomId('test-menu')
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions(new SelectMenuOptionBuilder({
        label: 'Option #1',
        value: 'https://youtube.com'
    }));

    await interaction.reply({
        components: [new ActionRowBuilder().addComponents(menu)]
    })
  },
};
