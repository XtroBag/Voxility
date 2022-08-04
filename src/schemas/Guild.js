const mongoose = require("mongoose")

const Guild = new mongoose.Schema({
    _id: mongoose.SchemaTypes.ObjectId,
    guildId: String,
    guildName: String,
    guildIcon: { type: String, required: true}
})

module.exports = { User: mongoose.model("Guild", Guild, "guilds") }