
module.exports = {
  data: {
    name: "button",
  },
  async execute(interaction, client) {
    await interaction.reply({ content: "This button has worked!" });
  },
};
