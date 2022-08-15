require("dotenv").config()
const { SlashCommandBuilder } = require("discord.js");
const { HypixelToken } = process.env;
const Hypixel = require('hypixel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hypixel")
    .setDescription("hypixel users information")
    .addStringOption(option => option.setName('username').setDescription('Enter a minecraft username')),
  async execute(interaction, client) {

const hypixel = new Hypixel({ key: process.env.HypixelToken });
const mcuser = interaction.options.getString('username')
 
// old school callbacks
hypixel.getPlayerByUsername(mcuser, (err, player) => {
    console.log(player.achievements)
  if (err) {
    return console.info('Nope!');
  }
  

});
  },
};
