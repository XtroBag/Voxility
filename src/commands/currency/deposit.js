const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder } = require("discord.js");
const { User } = require("../../schemas/Money");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("💵 deposit money to your bank")
    .addNumberOption(
      (option) =>
        option
          .setName("amount")
          .setDescription("Amount to deposit")
          .setRequired(true)
          .setMinValue(100) //should be more than 100 coins
    ),
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user = interaction.member.user,
      amount = interaction.options.getNumber("amount");
    userData =
      (await User.findOne({ id: user.id })) ||
      (await new User({ id: user.id }).save());
    embed = new EmbedBuilder();

    if (userData.wallet < amount)
      return interaction.reply({
        embeds: [
          embed
            .setDescription(
              `💰 You need \` ${
                amount - userData.wallet
              } 🪙 \` more in your wallet to deposit money`
            )
            .setColor("Yellow"),
        ],
        ephemeral: true,
      });

    userData.wallet -= amount;
    userData.bank += amount;
    userData.save();

    return interaction.reply({
      embeds: [
        embed
          .setDescription(
            `✅ You have deposited \` ${amount} 🪙 \` amount into your bank account`
          )
          .setColor("Yellow"),
      ],
    });
  },
};
