const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder } = require("discord.js");
const { User } = require("../../schemas/Money");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("💰 Check a users balance")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Person you wanna check the balance of.")
    ),
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user = interaction.options.getUser("user") || interaction.member.user;
    const userData =
      (await User.findOne({ id: user.id })) ||
      (await new User({ id: user.id }).save());

    const balanceEmbed = new EmbedBuilder()
      .setTitle(`${user.username}'s balance`)
      .setDescription("Wallet and Bank information for this user")
      .setColor("Yellow")
      .setThumbnail(user.displayAvatarURL())
      .addFields({ name: "• Wallet", value: `**\` ${userData.wallet} 💵 \`**` })
      .addFields({ name: "• Bank", value: `**\` ${userData.bank} 🪙 \`**` });

    await interaction.reply({ embeds: [balanceEmbed] });
  },
};
