const Guild = require('../../schemas/Guild')
const mongoose = require('mongoose')

module.exports = {
    name: 'guildCreate',
    once: true,
    async execute(interaction, client) {
      let guildProfile = await Guild.findOne({ guildId: interaction.guild.id })
      if (!guildProfile) guildProfile = await new Guild({
        _id: mongoose.Types.ObjectId(),
        guildId: interaction.guild.id,
        guildName: interaction.guild.name,
        guildIcon: interaction.guild.iconURL() ? interaction.guild.iconURL() : "No icon"
      });

      await guildProfile.save().catch(console.error)
      
      console.log("Bot has joined a guild!")
    }
}