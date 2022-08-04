const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pfp")
        .setDescription("get the pfp of a user")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Person you wanna check the balance of.")
        ),
    async execute(interaction, client) {
        const user = interaction.options.getUser("user") || interaction.member.user;

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}`)
            .setImage(user.displayAvatarURL())
            .setTimestamp(Date.now())

        await interaction.reply({ embeds: [embed] })
    },
};
