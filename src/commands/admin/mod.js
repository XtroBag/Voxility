/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
const {
  SlashCommandBuilder,
  Client,
  CommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  SelectMenuBuilder,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
} = require("discord.js");
const ms = require("millisecond");
const { Mod } = require("../../schemas/Moderation");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mod")
    .setDescription("admin moderation commands all in one")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("logchannel")
        .setDescription("Set the moderation logging channel.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("set the logging channel")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("member")
        .setDescription("pick the moderation action")
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Select the action you would like to do.")
            .addChoices(
              {
                name: "Ban",
                value: "ban",
              },
              {
                name: "Kick",
                value: "kick",
              },
              {
                name: "Timeout",
                value: "timeout",
              },
              {
                name: "Warn",
                value: "warn",
              },
              {
                name: "Unban",
                value: "unban",
              },
              {
                name: "Mute",
                value: "mute",
              }
            )
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("mention a user or id")
            .setRequired(true)
        )
    ),

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  async execute(interaction, client) {
    // requirment slash cmd args
    const sub = interaction.options.getString("action");
    const logChannel = interaction.options.getChannel("channel");
    const member = interaction.options.getMember("user");
    const subCommand = interaction.options.getSubcommand();

    // database search function - creates new document if one doesn't exist - also finds and replaces it if you change channel ID
    async function merge() {
      const channel = interaction.options.getChannel("channel");
      const find = await Mod.findOne({
        GuildID: interaction.guildId,
      });

      if (!find) {
        // insert
        await new Mod({
          GuildID: interaction.guildId,
          ModLogChannel: channel.id,
        })
          .save()
          .catch((err) => console.log(err));

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Channel Set")
              .setColor("#2F3136")
              .addFields({
                name: "<:information:1017198737870827550> Information:",
                value: `<:Blank:1017189918285496432> <:chat:1017192773625073674> ${logChannel}\n<:Blank:1017189918285496432> <:moderator:1017447397665808506> Moderator: ${
                  interaction.user.username
                }\n <:Blank:1017189918285496432> <:time:1017198113246683208> Timestamp: <t:${parseInt(
                  interaction.createdTimestamp / 1000
                )}:t>`,
                inline: true,
              }),
          ],
        });
      } else {
        // update
        await Mod.findOneAndReplace(
          {
            GuildID: interaction.guildId,
          },
          {
            ModLogChannel: channel.id,
            GuildID: interaction.guildId,
          }
        );

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Channel Updated")
              .setColor("#2F3136")
              .addFields(
                {
                  name: "<:alert:1017192166696702042> Changes:",
                  value: `<:Blank:1017189918285496432> <:chat:1017192773625073674> Before: <#${find.ModLogChannel}>\n <:Blank:1017189918285496432> <:chat:1017192773625073674> After: ${logChannel}`,
                },
                {
                  name: "<:information:1017198737870827550> Information:",
                  value: `<:Blank:1017189918285496432> <:moderator:1017447397665808506> Moderator: ${
                    interaction.user.username
                  }\n <:Blank:1017189918285496432> <:time:1017198113246683208> Timestamp: <t:${parseInt(
                    interaction.createdTimestamp / 1000
                  )}:t>`,
                  inline: true,
                }
              ),
          ],
        });
      }
    }

    // The choice command handler for the subcommand
    if (subCommand === "logchannel") {
      merge();
    } else if (subCommand === "member") {
      // Get information from the database and be able to use it from anywhere inside the file from below this point
      const database = await Mod.findOne({
        GuildID: interaction.guildId,
      });
      const moglogs = client.channels.cache.get(database.ModLogChannel);
      // if the database modlog channel is not found it will return with a message
      if (database) {
        if (sub === "ban") {
          // check if the interaction user has ban permissions
          if (
            !interaction.member.permissions.has(
              PermissionsBitField.Flags.BanMembers
            )
          ) {
            return await interaction.reply({
              content: "You do not have permission to ban users",
            });
          }
          // the confirm embed thats above the select menu
          const banWarning = new EmbedBuilder()
            .setTitle(`Please confirm that you wanna ban this user permanently`)
            .setColor("#2F3136");

          // the row with the select menu that it contains
          const row = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
              .setCustomId("select")
              .setPlaceholder("Select a choice to continue")
              .addOptions(
                {
                  label: "Yes",
                  description: "Yes to continue banning the user",
                  value: "first_option",
                  emoji: "<:check:1017458594276450304>",
                },
                {
                  label: "No",
                  description: "No to keep the user in the server",
                  value: "second_option",
                  emoji: "<:cancel:1017458592921698305>",
                }
              )
          );

          // fetch the interaction of the main message
          const message = await interaction.reply({
            components: [row],
            embeds: [banWarning],
            fetchReply: true,
          });

          // the collector of the main collector that catches the interactions
          const collector = message.createMessageComponentCollector({
            time: 15000, // take one 0 off
            componentType: ComponentType.SelectMenu,
          });

          // try's the collect event and if fails at all returns to console the error
          try {
            collector.on("collect", async (int) => {
              if (int.user.id === interaction.user.id) {
                if (int.customId === "select") {
                  if (int.values[0] === "first_option") {
                    let choice;
                    if (int.values[0] === "first_option") {
                      choice = "Complete";
                    } else {
                      choice = "Failed";
                    }

                    // handles the banning by ID or MENTION inside the / command
                    interaction.guild.members.ban(member.id)

                    await message.edit({
                        embeds: [
                          new EmbedBuilder()
                            .setTitle("Ban results")
                            .setColor("#2F3136")
                            .addFields(
                              {
                                name: "Information:",
                                value: `<:Blank:1017189918285496432> <:moderator:1017447397665808506> Moderator: ${
                                  interaction.user.username
                                }\n <:Blank:1017189918285496432> <:time:1017198113246683208> Timestamp: <t:${parseInt(
                                  interaction.createdTimestamp / 1000
                                )}:t>\n<:Blank:1017189918285496432> <:status:1017451089567682662> Status: ${choice}`,
                                inline: true,
                              },
                              {
                                name: "Banned:",
                                value: `<:Blank:1017189918285496432> <:check:1017458594276450304> Member: ${member.user.tag} [||${member.id}||]`,
                              }
                            ),
                        ],
                        components: [],
                      });
                      
                  } else if (int.values[0] === "second_option") {
                    let choice;
                    if (int.values[0] === "first_option") {
                      choice = "Complete";
                    } else {
                      choice = "Failed";
                    }
                    await message.edit({
                      embeds: [
                        new EmbedBuilder()
                          .setTitle("Ban results")
                          .setColor("#2F3136")
                          .addFields(
                            {
                              name: "Information:",
                              value: `<:Blank:1017189918285496432> <:moderator:1017447397665808506> Moderator: ${
                                interaction.user.username
                              }\n <:Blank:1017189918285496432> <:time:1017198113246683208> Timestamp: <t:${parseInt(
                                interaction.createdTimestamp / 1000
                              )}:t>\n<:Blank:1017189918285496432> <:status:1017451089567682662> Status: ${choice}`,
                              inline: true,
                            },
                            {
                              name: "Ban failed:",
                              value: `<:Blank:1017189918285496432> <:cancel:1017458592921698305> Member: ${member.user.tag} [||${member.id}||]\n <:Blank:1017189918285496432> <:Blank:1017189918285496432> <:reason:1017471155071889448> Reason: Ban was prevented by moderator`,
                            }
                          ),
                      ],
                      components: [],
                    });
                  }
                }
              }

              moglogs.send("Setup the information to send here");
            });
          } catch (err) {
            console.log(err);
          }
        } else if (sub === "kick") {
        } else if (sub === "timeout") {
        } else if (sub === "warn") {
        } else if (sub === "mute") {
        }
        // the part of the database code where it returns with a message if document doesn't find a modlog channel
      } else {
        interaction.reply({
          content:
            "Please setup the logging channel before using moderation commands",
        });
      }
    }
  },
};
