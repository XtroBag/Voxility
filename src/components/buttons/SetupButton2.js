module.exports = {
    data: {
      name: "cancelled",
    },
    async execute(interaction, client) {
      await interaction.reply({ content: "You have clicked cancel" });
    },
  };
  