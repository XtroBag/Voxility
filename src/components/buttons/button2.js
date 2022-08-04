module.exports = {
    data: {
      name: "button2",
    },
    async execute(interaction, client) {
      await interaction.reply({ content: "This button has worked!" });
    },
  };
  