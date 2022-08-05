const { SlashCommandBuilder } = require("discord.js");
const Guild = require('../../schemas/Guild')
const mongoose = require('mongoose')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("database")
    .setDescription("returns information from the database about a guild"),
  async execute(interaction, client) {
    let guildProfile = await Guild.findOne({ guildId: interaction.guild.id })
    if (!guildProfile) guildProfile = await new Guild({
      _id: mongoose.Types.ObjectId(),
      guildId: interaction.guild.id,
      guildName: interaction.guild.name,
      guildIcon: interaction.guild.iconURL() ? interaction.guild.iconURL() : "No icon"
    });

    await guildProfile.save().catch(console.error)

    console.log(guildProfile)
    
    // make the command run instead of here inside "GUILDCREATE" event so when it joins a guild it creates it.

  },
};
