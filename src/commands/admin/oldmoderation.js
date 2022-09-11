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
                { name: "Unban", value: "unban" },
                { name: "Mute", value: "mute" }
              )
              .setRequired(true)
          )
          .addUserOption((option) =>
            option.setName("user").setDescription("mention a user or id").setRequired(true)
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
      const member = interaction.options.getMember("user");
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
        // search for the database information
        const database = await Mod.findOne({ GuildID: interaction.guildId }); // ===============================================================
        if (database) {
          const log = client.channels.cache.get(database.ModLogChannel);
          if (sub === "ban") {
            if (
              !interaction.member.permissions.has(
                PermissionsBitField.Flags.BanMembers
              )
            ) {
              const nobanperms = new EmbedBuilder()
                .setDescription(
                  "<:alert:1017192166696702042> You do not have permission to ban users"
                )
                .setColor("#2F3136");
  
              return interaction.reply({
                embeds: [nobanperms],
              });
            }
  
            try {
              if (member.roles.highest >= interaction.member.roles.highest) {
                const roleishigher = new EmbedBuilder()
                  .setDescription(
                    "<:alert:1017192166696702042> You cannot ban this user as their role is higher then yours"
                  )
                  .setColor("#2F3136");
                return interaction.reply({
                  embeds: [roleishigher],
                });
              }
            } catch (err) {
             // interaction.reply({ content: "Member that was mentioned is not inside the guild so this triggered the role check"})
            }
  
              const banWarning = new EmbedBuilder()
                .setTitle(
                  `Please confirm that you wanna ban this user permanently`
                )
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
  
              const message = await interaction.reply({
                components: [row],
                embeds: [banWarning],
                fetchReply: true,
              });
  
              const collector = message.createMessageComponentCollector({
                time: 15000, // take one 0 off
                componentType: ComponentType.SelectMenu,
              });
  
              // const member = interaction.guild.members.cache.get(id);
              try {
                collector.on("collect", async (int) => {
                  if (int.user.id === interaction.user.id) {
                    if (int.customId === "select") {
                      if (int.values[0] === "first_option") {
                        try {
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
                                    name: "Banned:",
                                    value: `<:Blank:1017189918285496432> <:check:1017458594276450304> Member: ${member.user.tag} [||${member.id}||]`,
                                  }
                                ),
                            ],
                            components: [],
                          });
  
                          const logembed = new EmbedBuilder().setTitle(
                            `Member was banned: ${choice}`
                          );
  
                          log.send({ embeds: [logembed] });
                        } catch (error) {
                          console.log(error);
                        }
  
                        interaction.guild.members.ban(member, {
                          reason: "[Moderation System]: Banned by a moderator",
                        });
                      } else if (int.values[0] === "second_option") {
                        try {
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
                        } catch (error) {
                          console.log(error);
                        }
                      }
                    }
                  } else {
                    const notforu = new EmbedBuilder()
                      .setDescription(
                        "<:alert:1017192166696702042> This menu is not for you"
                      )
                      .setColor("#2F3136");
                    int.reply({
                      embeds: [notforu],
                      ephemeral: true,
                    });
                  }
                });
              } catch (err) {
                const errorhappened = new EmbedBuilder()
                  .setDescription(
                    "<:alert:1017192166696702042> Problem banning this user from the server"
                  )
                  .setColor("#2F3136");
                interaction.reply({ embeds: [errorhappened] });
              }
            
  
          } else if (sub === "kick") {
            if (
              !interaction.member.permissions.has(
                PermissionsBitField.Flags.KickMembers
              )
            ) {
              return interaction.reply({
                content:
                  "<:cancel:1017458592921698305> You do not have permission to kick users",
              });
            }
  
            let guild = interaction.guild;
            if (guild.members.cache.get(id)) {
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
                            let choice;
                            if (int.values[0] === "first_option") {
                              choice = "Complete";
                            } else {
                              choice = "Failed";
                            }
                            await message.edit({
                              embeds: [
                                new EmbedBuilder()
                                  .setTitle("Kick results")
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
                                      name: "Kicked:",
                                      value: `<:Blank:1017189918285496432> <:check:1017458594276450304> Member: ${member.user.tag} [||${member.id}||]`,
                                    }
                                  ),
                              ],
                              components: [],
                            });
  
                            const logembed = new EmbedBuilder().setTitle(
                              `Member was kicked: ${choice}`
                            );
  
                            log.send({ embeds: [logembed] });
                          } catch (error) {
                            console.log(error);
                          }
  
                          interaction.guild.members.kick(id, {
                            reason: "[Moderation System]: Kicked by a moderator",
                          });
                        } else if (int.values[0] === "second_option") {
                          try {
                            let choice;
                            if (int.values[0] === "first_option") {
                              choice = "Complete";
                            } else {
                              choice = "Failed";
                            }
                            await message.edit({
                              embeds: [
                                new EmbedBuilder()
                                  .setTitle("Kick results")
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
                                      name: "Kick failed:",
                                      value: `<:Blank:1017189918285496432> <:cancel:1017458592921698305> Member: ${member.user.tag} [||${member.id}||]\n <:Blank:1017189918285496432> <:Blank:1017189918285496432> <:reason:1017471155071889448> Reason: Kick was prevented by moderator`,
                                    }
                                  ),
                              ],
                              components: [],
                            });
                          } catch (error) {
                            console.log(error);
                          }
                        }
                      }
                    } else {
                      const notforu = new EmbedBuilder()
                        .setDescription(
                          "<:alert:1017192166696702042> This menu is not for you"
                        )
                        .setColor("#2F3136");
                      int.reply({
                        embeds: [notforu],
                        ephemeral: true,
                      });
                    }
                  });
                } catch (err) {
                  const errorhappened = new EmbedBuilder()
                    .setDescription(
                      "<:alert:1017192166696702042> Problem kicking this user from the server"
                    )
                    .setColor("#2F3136");
                  interaction.reply({ embeds: [errorhappened] });
                }
              }
            } else {
              const nothere = new EmbedBuilder()
                .setDescription(
                  "<:alert:1017192166696702042> That member is not inside this guild"
                )
                .setColor("#2F3136");
              await interaction.reply({
                embeds: [nothere],
              });
            }
          } else if (sub === "timeout") {
            //=====================================================================================================================================
            //=====================================================================================================================================
  
            if (
              !interaction.member.permissions.has(
                PermissionsBitField.Flags.ModerateMembers
              )
            ) {
              return interaction.reply({
                content:
                  "<:cancel:1017458592921698305> You do not have permission to timeout users",
              });
            }
  
            let guild = interaction.guild;
            if (guild.members.cache.get(id)) {
              const member = interaction.guild.members.cache.get(id);
  
              if (member.roles.highest >= interaction.member.roles.highest) {
                return interaction.reply({
                  content:
                    "You cannot kick this user as their role is higher then yours",
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
  
              // eslint-disable-next-line no-inner-declarations
              function padTo2Digits(num) {
                return num.toString().padStart(2, "0");
              }
  
              // eslint-disable-next-line no-inner-declarations
              function convertMsToMinutesSeconds(milliseconds) {
                const minutes = Math.floor(milliseconds / 60000);
                const seconds = Math.round((milliseconds % 60000) / 1000);
  
                return seconds === 60
                  ? `${minutes + 1}:00`
                  : `${minutes}:${padTo2Digits(seconds)}`;
              }
  
              var intcustomid = interaction.id;
              const filter = (interaction) =>
                interaction.customId === intcustomid;
              interaction
                .awaitModalSubmit({ filter, time: 25000 })
                .then((interaction) => {
                  const time = ms(interaction.fields.getTextInputValue("time"));
                  const reason = interaction.fields.getTextInputValue("reason");
                  const member = interaction.guild.members.cache.get(id);
  
                  if (typeof reason === "number") {
                    const timeoutEmbed = new EmbedBuilder()
                      .setTitle("Member timeout")
                      .setFields(
                        {
                          name: "Information:",
                          value: `<:Blank:1017189918285496432> <:moderator:1017447397665808506> Moderator: ${
                            interaction.user.username
                          }\n <:Blank:1017189918285496432> <:time:1017198113246683208> Timestamp: <t:${parseInt(
                            interaction.createdTimestamp / 1000
                          )}:t>\n<:Blank:1017189918285496432> <:reason:1017471155071889448> Reason: ${reason}\n<:Blank:1017189918285496432> <:time:1017198113246683208> Time: ${convertMsToMinutesSeconds(
                            time
                          )}`,
                        },
                        {
                          name: "Timeout:",
                          value: `<:Blank:1017189918285496432> <:check:1017458594276450304> Member: ${member.user.tag} [||${member.id}||]`,
                        }
                      )
                      .setColor("#2F3136");
  
                    const logembed = new EmbedBuilder().setTitle(
                      `Member was set on timeout: yes`
                    );
  
                    log.send({ embeds: [logembed] });
  
                    interaction.reply({ embeds: [timeoutEmbed] });
                    member.timeout(time, reason);
                  } else {
                    interaction.reply({
                      content: "The reason provided wasnt a word",
                    });
                  }
                })
                .catch(console.error);
  
              await interaction.showModal(modal);
            } else {
              const nothere = new EmbedBuilder()
                .setDescription(
                  "<:alert:1017192166696702042> That member is not inside this guild"
                )
                .setColor("#2F3136");
              await interaction.reply({
                embeds: [nothere],
              });
            }
  
            //=====================================================================================================================================
            //=====================================================================================================================================
          } else if (sub === "unban") {
            if (
              !interaction.member.permissions.has(
                PermissionsBitField.Flags.BanMembers
              )
            ) {
              return interaction.reply({
                content:
                  "<:cancel:1017458592921698305> You do not have permission to unban users",
              });
            }
  
  
            // put back here the code i copied if don't work
            const member = client.users.cache.get(id);
  
            let guild = interaction.guild;
            const unbanWarning = new EmbedBuilder()
              .setTitle(
                `Please confirm that you wanna unban this user permanently`
              )
              .setColor("#2F3136");
  
            const row = new ActionRowBuilder().addComponents(
              new SelectMenuBuilder()
                .setCustomId("select")
                .setPlaceholder("Select a choice to continue")
                .addOptions(
                  {
                    label: "Yes",
                    description: "Yes to continue unbanning the user",
                    value: "first_option",
                    emoji: "<:check:1017458594276450304>",
                  },
                  {
                    label: "No",
                    description: "No to keep the user banned from the server",
                    value: "second_option",
                    emoji: "<:cancel:1017458592921698305>",
                  }
                )
            );
  
            const message = await interaction.reply({  // this sends the first reply with the select menu and embed
              components: [row],
              embeds: [unbanWarning],
              fetchReply: true,
            });
  
            const collector = message.createMessageComponentCollector({ // this is the message component collector
              time: 15000, // take one 0 off
              componentType: ComponentType.SelectMenu,
            });   
  
  
            collector.on("collect", async (int) => { // this is the component collector
                if (int.user.id === interaction.user.id) {
                  if (int.customId === 'select') {
                    if (int.values[0] === 'first_option') {
                      const member = interaction.guild.members.cache.get(id);
                      const banList = await interaction.guild.bans.fetch();
                      const bannedUser = banList.find((user) => user.id === member.id);
                      //console.log(bannedUser)
                      if (bannedUser) {
                        console.log('User is banned')
                      } else {
                        console.log('User is unbanned already')
                      }
  
  
  
  
                    } else if (int.values[0] === 'second_option') {
  
                    }
                  }
  
  
  
  
  
  
                } else {
                  const notforu = new EmbedBuilder()
                  .setDescription(
                    "<:alert:1017192166696702042> This menu is not for you"
                  )
                  .setColor("#2F3136");
                  int.reply({
                  embeds: [notforu],
                  ephemeral: true,
                });
                }
            })
  
  
  
    
                    
  
          } else if (sub === "warn") {
            interaction.reply({ content: "warn picked" });
          } else if (sub === "mute") {
            // make mute system create it's own mute role and check if it exists or not so it won't make another one
            interaction.reply({ content: "Mute picked" });
          }
  
  
        } else {
          const setupnotcomplete = new EmbedBuilder()
            .setDescription(
              "<:alert:1017192166696702042> Please setup the logging channel before using moderation commands"
            )
            .setColor("#2F3136");
  
          interaction.reply({
            embeds: [setupnotcomplete],
          });
        }
  
  
      }
    },
  };
  