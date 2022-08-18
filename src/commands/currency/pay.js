const { SlashCommandBuilder, CommandInteraction, Client, EmbedBuilder } = require("discord.js");
const { User } = require("../../schemas/Money");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("👤 Pay another user some money")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("The user to pay")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option.setName("amount").setDescription("Amount to pay").setRequired(true)
    ),
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user =
      interaction.options.getUser("member") || interaction.member.user;
    const amount = interaction.options.getNumber("amount");

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
            } 🪙 \` more in your bank account to pay this user money`
          ),
        ],
        ephemeral: true,
      });

    userData.bank -= amount; // money to take away from the person giving
    userData.bank += amount; // money to give other user  // fix this to be giving the user the money (CURRENTLY NOT GIVING IT)
    userData.save();

    return interaction.reply({
      embeds: [
        embed.setDescription(
          `✅ You have given ${user.username} \` ${amount} 🪙 \` from your bank account`
        ),
      ],
    });
  },
};
