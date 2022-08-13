const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require("discord.js");
const { setupWarning } = require("../../embeds/SetupEmbeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("✅ setup stuff for the server")
        .addStringOption((option) =>
            option
                .setName("settings")
                .setDescription("pick the setting choice you would like to setup.")
                .setRequired(true)
                .addChoices(
                { name: 'Logging System', value: 'Logging' },
                    { name: 'Staff System', value: 'Staff' },
        )),
    async execute(interaction, client) {
    const choice = interaction.options.getString('settings')


        switch(choice) {
            case('Logging') : {
                interaction.reply({ content: "You picked logging!"})
            }
            break;
            case('Staff') : {

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('Confirmed')
                            .setLabel('Confirm')
                            .setStyle(ButtonStyle.Success)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('cancelled')
                            .setLabel('Cancel')
                            .setStyle(ButtonStyle.Danger)
                    )

                    interaction.reply({ embeds: [setupWarning], components: [row], fetchReply: true});

            }
            break;
        }

    },
};
