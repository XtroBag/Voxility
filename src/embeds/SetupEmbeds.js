const { EmbedBuilder } = require("@discordjs/builders");

// embeds for [setup.js]

module.exports.setupWarning = new EmbedBuilder()
    .setTitle("Staff System Setup")
    .setDescription("Welcome to the Staff Setup! This system will create a staff ranks for you and configure them automatcally. Please read this information before continuing.\n\n``•`` Your server will be configured.\n``•`` The bot will create roles.")

module.exports.beginSetup = new EmbedBuilder()
    .setTitle("Setup is beginning...")

module.exports.setup = new EmbedBuilder()
    .setTitle("Setup working")
    .setDescription("`•`› Preparing...\n`•`› Creating ranks")