const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("🔎 Shows Help menu"),
  async execute(interaction, client) {
  
      
  },
};
