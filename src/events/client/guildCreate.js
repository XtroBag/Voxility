const { Guild } = require('../../schemas/Guild')
const mongoose = require('mongoose')

module.exports = {
    name: 'guildCreate',
    async execute(guild, client) {

      let guildProfile = await Guild.findOne({ guildId: guild.id })
      if (!guildProfile) guildProfile = await new Guild({
        _id: mongoose.Types.ObjectId(),
        guildId: guild.id,
        guildName: guild.name,
        guildIcon: guild.iconURL() ? guild.iconURL() : "No icon"
      });

      await guildProfile.save().catch(console.error)

      console.log(guildProfile)
      console.log("Bot has joined a guild!")

      
    }
}