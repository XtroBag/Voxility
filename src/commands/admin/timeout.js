const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const ms = require('ms')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("timeout a member in the server")
    .addUserOption(option => option
      .setName("member")
      .setDescription('pick the user you wanna timeout')
      .setRequired(true))
    .addStringOption(option => option
      .setName('time')
      .setDescription('the amount of time to set')
      .setRequired(true))
    .addStringOption(option => option
      .setName('reason')
      .setDescription('the reason for this timeout')),
  async execute(interaction, client) {

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: "You do not have permission to use this command."})

    const member = interaction.options.getMember('member');
    const time = ms(interaction.options.getString('time'));
    const reason = interaction.options.getString('reason');

    if (!time) return interaction.reply({ content: 'The given time is not valid or is not accepted'})
    const response = await member.timeout(time, reason)

  if (!response) return interaction.reply({ content: `I was unable to timeout the user <@${member}>`})
    return interaction.reply({ content: `${member} has been timed out for ${ms(time, { long: true })} `})


    
  },
};
