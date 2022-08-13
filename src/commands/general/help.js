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
const {
  ChannelPagination,
  NextPageButton,
  PreviousPageButton,
} = require("djs-button-pages");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("🔎 Shows Help menu"),
  async execute(interaction, client) {
    
    // The Variables
    const CommandFolders = fs.readdirSync("./src/commands");
    const folders = CommandFolders.join("\n");

    try {
    // The select menu with the choices
    const SelectMenu = new ActionRowBuilder().addComponents(
      new SelectMenuBuilder()
        .setCustomId("help_menu")
        .setPlaceholder("Nothing selected")
        .addOptions(
          CommandFolders.map((cat) => {
            return {
              label: `${cat[0].toLocaleUpperCase() + cat.slice(1)}`,
              value: cat,
              description: `Click to see the commands of ${cat}`
            }
          })
          
      )
    );

    // the first main embed page
    const MainPage = new EmbedBuilder()
      .setTitle("Main Help Menu")
      .setDescription(
        "Welcome to the help menu this is where you can find anything!"
      )
      .addFields(
        {
          name: "Information",
          value:
            "``•`` This will show you all command information\n``•`` Your able to select a catagory",
          inline: true,
        },
      )
      .setColor("#282b30")
      .setFooter({ text: `Created by: ${config.Users.Owner.Name}`})
      .setTimestamp();

    interaction.reply({ embeds: [MainPage], components: [SelectMenu] }).then(async (msg) => {
      let filter = i => i.user.id === interaction.user.id;
      let collector = await msg.createMessageComponentCollector({ filter: filter, time: 5000 });

      collector.on('collect', async (interaction) => {
        if (interaction.isSelectMenu()) {
          if (interaction.setCustomId === "help_menu") {
            await i.deferUpdate().catch(e => {})
            let [ directory ] = interaction.values;
            console.log(directory)
          }
        }
      })   
    })


  } catch (err) {
    console.log(err)
  }

  },
};
