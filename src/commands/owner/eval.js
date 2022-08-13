const { SlashCommandBuilder, EmbedBuilder, Embed } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const config = require('../../../config.json')
const { inspect } = require('util')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eval")
    .setDescription("⚙️ Eval some code")
    .addStringOption(option => 
        option
        .setName('code')
        .setDescription('The code you wanna run')
    ),
  async execute(interaction, client) {
        if (interaction.user.id !== config.Users.Owner.XtroBagID) {
            return interaction.reply({ content: "you cannot use this command!"})
        } else {
            const script = interaction.options.getString('code');

            try {
                const result = await eval(script);
                let output = result;

                if(typeof result !== 'string') {
                    output = inspect(result)
                }

                const embed = new EmbedBuilder()
                .setTitle('Eval command code')
                .setDescription(`this is the code that was just tested`)
                .addFields({ name: 'Script:', value: `${script}`, inline: true })
                .addFields({ name: 'Output:', value: ` \`\`\` ${output} \`\`\` `, inline: false })
                
                interaction.reply({ embeds: [embed] })
               
              } catch (err) {
                interaction.reply({ content: err})
              }
        }

  },
};
