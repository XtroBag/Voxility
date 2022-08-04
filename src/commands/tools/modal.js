const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modal")
    .setDescription("📒 Return a modal"),
  async execute(interaction, client) {
    const modal = new ModalBuilder()
    .setCustomId('fav-color')
    .setTitle('Favorite Color?')

    const textInput = new TextInputBuilder()
    .setCustomId("fav-color")
    .setLabel('Why is this your favorite color?')
    .setRequired()
    .setStyle(TextInputStyle.Short);

    modal.addComponents(new ActionRowBuilder().addComponents(textInput))

    await interaction.showModal(modal)
  },
};
