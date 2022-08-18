const { SlashCommandBuilder, Client, CommandInteraction } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("github")
    .setDescription("find user data on github api"),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
  async execute(interaction, client) {
    
    
    
  },
};
