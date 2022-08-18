const { SlashCommandBuilder, Client, CommandInteraction } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { Guild } = require("../../schemas/Guild");
const mongoose = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("database")
    .setDescription("returns information from the database about a guild"),
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  async execute(interaction, client) {
    let guildProfile = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildProfile)
      guildProfile = await new Guild({
        _id: mongoose.Types.ObjectId(),
        guildId: interaction.guild.id,
        guildName: interaction.guild.name,
        guildIcon: interaction.guild.iconURL()
          ? interaction.guild.iconURL()
          : "No icon",
      });

    await guildProfile.save().catch(console.error);

    interaction.reply({ content: codeBlock("js", guildProfile) });
  },
};
