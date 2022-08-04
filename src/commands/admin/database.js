const { SlashCommandBuilder } = require("discord.js");
const Guild = require('../../schemas/Guild')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("database")
    .setDescription("returns information from the database about a guild"),
  async execute(interaction, client) {
    

    // make the command run instead of here inside "GUILDCREATE" event so when it joins a guild it creates it.

  },
};
