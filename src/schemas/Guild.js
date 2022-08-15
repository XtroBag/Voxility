const mongoose = require("mongoose")

const Guild = new mongoose.Schema({
    _id: mongoose.SchemaTypes.ObjectId,
    guildId: String,
    guildName: String,
    guildIcon: { type: String, required: true },
    ChatBotChannel: { type: String, default: "Channel Not Set" }
})

module.exports = { Guild: mongoose.model("Guild", Guild, "guilds") }