const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  SelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const config = require("../../../config.json");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("🔎 Shows Help menu"),
  async execute(interaction, client) {
    // The Variables
    const CommandFolders = fs.readdirSync("./src/commands");
    const folders = CommandFolders.join("\n");
    const invite = "https://discord.gg/ybKaGNZa4e";

    let commandFiles = {};
    CommandFolders.forEach((cmdfldr) => {
      fs.readdir(`./src/commands/${cmdfldr}`, (err, data) => {
        commandFiles[cmdfldr] = [];
        data.forEach((specFile) => {
          commandFiles[cmdfldr].push(
            specFile.substring(0, specFile.lastIndexOf(".")) || specFile
          );
        });
      });
    });

    try {
      // The select menu with the choices
      const SelectMenu = new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId("help_menu")
          .setPlaceholder("Select a category")
          .addOptions(
            CommandFolders.map((cat) => {
              return {
                label: `${cat[0].toLocaleUpperCase() + cat.slice(1)}`,
                value: cat,
                description: `Click to see the commands of ${cat}`,
              };
            })
          )
      );

      // the first main embed page
      const MainPage = new EmbedBuilder()
        .setTitle("Help Menu")
        .setDescription(
          "Welcome to the help menu of Voxility! In this menu you can find\neverything you need to use."
        )
        .addFields(
          {
            name: `Information:`,
            value:
              "``•`` This will show you all command information.\n``•`` You are able to select a category you want.\n``•`` It will list you all the commands inside a directory",
            inline: true,
          },
          {
            name: `Developer Team:`,
            value: `${client.Owner} Owner: ${config.Users.Owner.Name}
             ${client.Developer} Developer: ${config.Users.Developer.Name}
             ${client.Designer} Designer: ${config.Users.Designer.Name}
             ${client.Artist} Artist: ${config.Users.Artist.Name}`,
            inline: false,
          },
          {
            name: `Support Server:`,
            value: `${client.Invite} Invite: [Server Invite](${invite})`,
            inline: false,
          }
        )
        .setColor("#36393e")
        .setFooter({ text: `Created by: ${config.Users.Owner.Name}` })
        .setTimestamp();

      interaction
        .reply({
          embeds: [MainPage],
          components: [SelectMenu],
          fetchReply: true,
        })
        .then(async (msg) => {
          let filter = (i) => i.user.id === interaction.user.id;
          let collector = await msg.createMessageComponentCollector({
            filter: filter,
          });

          collector.on("collect", async (interaction) => {
            if (interaction.isSelectMenu()) {
              if (interaction.customId === "help_menu") {
                console.log;
                await interaction.deferUpdate().catch((e) => {
                  console.log(e);
                });
                let [directory] = interaction.values;

                let aa = new EmbedBuilder()
                  .setColor("#36393e")
                  .setTitle(`All commands of: ${directory}`)
                  .setDescription(
                    `>>> \`\`${
                      commandFiles[directory].join("`` ``") ||
                      "No files in directory"
                    }\`\``
                  );

                msg.edit({ embeds: [aa] });
              }
            }
          });
        });
    } catch (err) {
      console.log(err);
    }
  },
};
