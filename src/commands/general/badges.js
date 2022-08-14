const { SlashCommandBuilder, UserFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("badges")
    .setDescription("shows the users badges")
    .addUserOption((option) =>
    option
        .setName("user")
        .setDescription("Person you wanna check the balance of.")
),
  async execute(interaction, client) {

    const user = interaction.options.getUser('user');
    
   
        
        interaction.reply({ content: `${user}'s badges: ${userFlags.join(', ')}`})
    }
}