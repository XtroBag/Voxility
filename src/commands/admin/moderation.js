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
    .setName("moderate")
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
              { name: "Ban", value: "ban" },
              { name: "Kick", value: "kick" },
              { name: "Timeout", value: "timeout" },
              { name: "Warn", value: "warn" },
              { name: "Unban", value: "unban" }
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("id").setDescription("the users id").setRequired(true)
        )
    ),

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  async execute(interaction, client) {
    // permission check
    const canBan = interaction.memberPermissions.has("BanMembers");
    const canKick = interaction.memberPermissions.has("KickMembers");
    const canTimeout = interaction.memberPermissions.has("ModerateMembers");

    // requirment slash cmd args
    const sub = interaction.options.getString("action");
    const logChannel = interaction.options.getChannel("channel");
    const id = interaction.options.getString("id");
    const subCommand = interaction.options.getSubcommand();

    // database search function - creates new document if one doesn't exist - also finds and replaces it if you change channel ID
    async function merge() {
      const channel = interaction.options.getChannel("channel");
      const find = await Mod.findOne({ GuildID: interaction.guildId });

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
                value: `<:Blank:1017189918285496432> <:chat:1017192773625073674> ${logChannel}\n<:Blank:1017189918285496432> <:user:1017197903158182039> Moderator: ${
                  interaction.user.username
                }\n <:Blank:1017189918285496432> <:time:1017198113246683208> Timestamp: <t:${parseInt(
                  interaction.createdTimestamp / 1000
                )}:t>`,
                inline: true,
              })
              .setTimestamp(),
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
                  value: `<:Blank:1017189918285496432> <:user:1017197903158182039> Moderator: ${
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

    // search for the database information
    const database = await Mod.findOne({ GuildID: interaction.guildId });

    // define the modlog channel to send stuff to it
    const log = client.channels.cache.get(database.ModLogChannel); // code has a problem when no database document is created
    // i think because bot is trying to find channel that isn't created
    // maybe need to set timeout or something

    // The choice command handler for the subcommand
    if (subCommand === "logchannel") {
      merge();
    } else if (subCommand === "member") {
      if (sub === "ban") {
        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.BanMembers
          )
        ) {
          return interaction.reply({
            content:
              "<:remove:1015760763148836975> You do not have permission to ban users",
          });
        }

        const member = interaction.guild.members.cache.get(id);

        if (member.roles.highest >= interaction.member.roles.highest) {
          return interaction.reply({
            content:
              "You cannot ban this user as their role is higher then yours",
          });
        }

        let guild = interaction.guild;
        if (guild.members.cache.get(id)) {
          const banWarning = new EmbedBuilder()
            .setTitle(`Please confirm that you wanna ban this user permanently`)
            .setColor("#2F3136");

          const row = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
              .setCustomId("select")
              .setPlaceholder("Select a choice to continue")
              .addOptions(
                {
                  label: "Yes",
                  description: "Yes to continue banning the user",
                  value: "first_option",
                  emoji: "<:check:1015760761592742059>",
                },
                {
                  label: "No",
                  description: "No to keep the user in the server",
                  value: "second_option",
                  emoji: "<:remove:1015760763148836975>",
                }
              )
          );

          const message = await interaction.reply({
            components: [row],
            embeds: [banWarning],
            fetchReply: true,
          });

          const collector = message.createMessageComponentCollector({
            time: 15000, // take one 0 off
            componentType: ComponentType.SelectMenu,
          });

          const member = interaction.guild.members.cache.get(id);
          try {
            collector.on("collect", async (int) => {
              if (int.user.id === interaction.user.id) {
                if (int.customId === "select") {
                  if (int.values[0] === "first_option") {
                    try {
                      await message.edit({
                        embeds: [
                          new EmbedBuilder()
                            .setTitle("Ban completed")
                            .setColor("#2F3136")
                            .addFields({
                              name: "Banned:",
                              value: `**\`🧔🏻\`**|  ${member.displayName}`,
                              inline: false,
                            })
                            .setTimestamp(),
                        ],
                        components: [],
                      });
                    } catch (error) {
                      console.log(error);
                    }

                    interaction.guild.members.ban(id, {
                      reason: "[Moderation System]: Banned by a moderator",
                    });
                  } else if (int.values[0] === "second_option") {
                    try {
                      await message.edit({
                        embeds: [
                          new EmbedBuilder()
                            .setTitle("Ban prevented")
                            .setColor("#b32424")
                            .setDescription("This ban has been cancelled")
                            .setTimestamp(),
                        ],
                        components: [],
                      });
                    } catch (error) {
                      console.log(error);
                    }
                  }
                }
              } else {
                int.reply({
                  content: "This menu is not for you.",
                  ephemeral: true,
                });
              }

              let choice;
              if (int.values[0] === "first_option") {
                choice = "yes";
              } else {
                choice = "no";
              }

              const logembed = new EmbedBuilder().setTitle(
                `Member was banned: ${choice}`
              );

              log.send({ embeds: [logembed] });
            });
          } catch (err) {
            console.log(err, "Problem banning user");
          }
        } else {
          await interaction.reply({
            content: "That member is not inside this guild", // this replies if nobody with that id is inside the server
          });
        }
      } else if (sub === "kick") {
        // KICK WORKS !!

        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.KickMembers
          )
        ) {
          return interaction.reply({
            content:
              "<:remove:1015760763148836975> You do not have permission to kick users",
          });
        }

        const member = interaction.guild.members.cache.get(id);

        if (member.roles.highest >= interaction.member.roles.highest) {
          return interaction.reply({
            content:
              "You cannot kick this user as their role is higher then yours",
          });
        }

        let guild = interaction.guild;
        if (guild.members.cache.get(id)) {
          const kickWarning = new EmbedBuilder()
            .setTitle(`Please confirm that you wanna kick this user`)
            .setColor("#2F3136");

          const row = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
              .setCustomId("select")
              .setPlaceholder("Select a choice to continue")
              .addOptions(
                {
                  label: "Yes",
                  description: "Yes to continue kicking the user",
                  value: "first_option",
                  emoji: "<:check:1015760761592742059>",
                },
                {
                  label: "No",
                  description: "No to keep the user in the server",
                  value: "second_option",
                  emoji: "<:remove:1015760763148836975>",
                }
              )
          );

          const message = await interaction.reply({
            components: [row],
            embeds: [kickWarning],
            fetchReply: true,
          });

          const collector = message.createMessageComponentCollector({
            time: 15000, // take one 0 off
            componentType: ComponentType.SelectMenu,
          });

          try {
            collector.on("collect", async (int) => {
              if (int.user.id === interaction.user.id) {
                if (int.customId === "select") {
                  if (int.values[0] === "first_option") {
                    try {
                      await message.edit({
                        embeds: [
                          new EmbedBuilder()
                            .setTitle("Kick completed")
                            .setColor("#2F3136") // #2C2F33
                            .addFields({
                              name: "Kicked:",
                              value: `**\`🧔🏻\`**|  ${member.displayName}`,
                              inline: false,
                            })
                            .setTimestamp(),
                        ],
                        components: [],
                      });
                    } catch (error) {
                      console.log(error);
                    }

                    interaction.guild.members.kick(id, {
                      reason: "[Moderation System]: Kicked by a moderator",
                    });
                  } else if (int.values[0] === "second_option") {
                    try {
                      await message.edit({
                        embeds: [
                          new EmbedBuilder()
                            .setTitle("Kick prevented")
                            .setColor("#b32424")
                            .setDescription("This kick has been cancelled")
                            .setTimestamp(),
                        ],
                        components: [],
                      });
                    } catch (error) {
                      console.log(error);
                    }
                  }
                }
              } else {
                int.reply({
                  content: "This menu is not for you.",
                  ephemeral: true,
                });
              }

              let choice;
              if (int.values[0] === "first_option") {
                choice = "yes";
              } else {
                choice = "no";
              }

              const logembed = new EmbedBuilder().setTitle(
                `Member was kicked: ${choice}`
              );

              log.send({ embeds: [logembed] });
            });
          } catch (err) {
            console.log(err, "Problem kicking user");
          }
        } else {
          await interaction.reply({
            content: "That member is not inside this guild", // this replies if nobody with that id is inside the server
          });
        }
      } else if (sub === "timeout") {
        // TIMEOUT WORKS !!

        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.ModerateMembers
          )
        ) {
          return interaction.reply({
            content:
              "<:remove:1015760763148836975> You do not have permission to timeout users",
          });
        }

        const member = interaction.guild.members.cache.get(id);

        if (member.roles.highest >= interaction.member.roles.highest) {
          return interaction.reply({
            content:
              "You cannot timeout this user as their role is higher then yours",
          });
        }

        const modal = new ModalBuilder()
          .setTitle("Timeout a user")
          .setCustomId(interaction.id)
          .setComponents(
            new ActionRowBuilder().setComponents(
              new TextInputBuilder()
                .setLabel("time")
                .setCustomId("time")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().setComponents(
              new TextInputBuilder()
                .setLabel("reason")
                .setCustomId("reason")
                .setStyle(TextInputStyle.Short)
            )
          );

        var intcustomid = interaction.id;
        const filter = (interaction) => interaction.customId === intcustomid;
        interaction
          .awaitModalSubmit({ filter, time: 25000 })
          .then((interaction) => {
            const time = ms(interaction.fields.getTextInputValue("time"));
            const reason = interaction.fields.getTextInputValue("reason");
            const timeoutEmbed = new EmbedBuilder()
              .setTitle("Member timeout")
              .setDescription("This member has been set on timeout")
              .setColor("#2F3136")
              .setTimestamp();

            interaction.reply({ embeds: [timeoutEmbed] });

            const member = interaction.guild.members.cache.get(id);
            member.timeout(time, reason);
          })
          .catch(console.error);

        await interaction.showModal(modal);

        // UNBANNING WORKS!!
      } else if (sub === "unban") {
        //===========================================================================================
        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.BanMembers
          )
        ) {
          return interaction.reply({
            content:
              "<:remove:1015760763148836975> You do not have permission to unban users",
          });
        }

        const member = client.users.cache.get(id);
        const banList = await interaction.guild.bans.fetch();
        const bannedUser = banList.find((user) => user.id === member.id);

        if (bannedUser) {
          return interaction.reply({
            content: `${bannedUser.tag} is banned already`, // this is the code here that is putting off an error // ------------------------
          });
        }

        let guild = interaction.guild;
        const unbanWarning = new EmbedBuilder()
          .setTitle(`Please confirm that you wanna ban this user permanently`)
          .setColor("#2F3136");

        const row = new ActionRowBuilder().addComponents(
          new SelectMenuBuilder()
            .setCustomId("select")
            .setPlaceholder("Select a choice to continue")
            .addOptions(
              {
                label: "Yes",
                description: "Yes to continue banning the user",
                value: "first_option",
                emoji: "<:check:1015760761592742059>",
              },
              {
                label: "No",
                description: "No to keep the user in the server",
                value: "second_option",
                emoji: "<:remove:1015760763148836975>",
              }
            )
        );

        const message = await interaction.reply({
          components: [row],
          embeds: [unbanWarning],
          fetchReply: true,
        });

        const collector = message.createMessageComponentCollector({
          time: 15000, // take one 0 off
          componentType: ComponentType.SelectMenu,
        });

        try {
          collector.on("collect", async (int) => {
            if (int.user.id === interaction.user.id) {
              if (int.customId === "select") {
                if (int.values[0] === "first_option") {
                  try {
                    await message.edit({
                      embeds: [
                        new EmbedBuilder()
                          .setTitle("Unban completed")
                          .setColor("#2F3136")
                          .addFields({
                            name: "Unbanned:",
                            value: `**\`🧔🏻\`**|  ${member}`,
                            inline: false,
                          })
                          .setTimestamp(),
                      ],
                      components: [],
                    });
                  } catch (error) {
                    console.log(error);
                  }

                  interaction.guild.members.unban(id, {
                    // change the member to the ID here
                    reason: "[Moderation System]: unbanned by a moderator",
                  });
                } else if (int.values[0] === "second_option") {
                  try {
                    await message.edit({
                      embeds: [
                        new EmbedBuilder()
                          .setTitle("Unban prevented")
                          .setColor("#b32424")
                          .setDescription("The unban has been stopped")
                          .setTimestamp(),
                      ],
                      components: [],
                    });
                  } catch (error) {
                    console.log(error);
                  }
                }
              }
            } else {
              int.reply({
                content: "This menu is not for you.",
                ephemeral: true,
              });
            }

            let choice;
            if (int.values[0] === "first_option") {
              choice = "yes";
            } else {
              choice = "no";
            }

            const logembed = new EmbedBuilder().setTitle(
              `Member was unbanned: ${choice}`
            );

            log.send({ embeds: [logembed] });
          });
        } catch (err) {
          console.log(err, "Problem unbanning user");
        }
      } else if (sub === "warn") {
        interaction.editReply({ content: "warn picked" });
      }
    }
  },
};
