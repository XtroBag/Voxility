const { SlashCommandBuilder, EmbedBuilder, CommandInteraction, Client } = require("discord.js");
const { User } = require("../../schemas/Money");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("💸 Withdraw money from the bank")
    .addNumberOption(
      (option) =>
        option
          .setName("amount")
          .setDescription("Amount to withdraw")
          .setRequired(true)
          .setMinValue(100) //should be more than 100 coins
    ),
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user = interaction.options.getUser("user") || interaction.member.user;
    amount = interaction.options.getNumber("amount");
    const userData =
      (await User.findOne({ id: user.id })) ||
      (await new User({ id: user.id }).save());
    embed = new EmbedBuilder();

    if (userData.bank < amount)
      return interaction.reply({
        embeds: [
          embed.setDescription(
            `💰 You need \` ${
              amount - userData.bank
            } 🪙 \` more in your bank account to withdraw money`
          ),
        ],
        ephemeral: true,
      });

    userData.bank -= amount;
    userData.wallet += amount;
    userData.save();

    return interaction.reply({
      embeds: [
        embed.setDescription(
          `✅ You have withdrawn \` ${amount} 🪙 \` amount from your bank account`
        ),
      ],
    });
  },
};
