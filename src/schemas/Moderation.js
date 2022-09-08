const mongoose = require("mongoose")

const Mod = new mongoose.Schema({
    GuildID: { type: String },
    ModLogChannel: { type: String }
})

module.exports = { Mod: mongoose.model("Moderation", Mod) }