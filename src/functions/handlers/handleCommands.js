const fs = require("fs");
const { Routes } = require("discord-api-types/v9");
const { REST } = require("@discordjs/rest");
const chalk = require("chalk");

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync("./src/commands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      const { commands, commandArray } = client;
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
       // to console log all commands inside console
       /* 
        console.log(
          chalk.blue("Command:"),
          chalk.cyan(`${command.data.name}`, chalk.white("has been loaded!"))
        );

        */

      }
    }

    console.log(chalk.cyan("[COMMANDS]:", chalk.white("Loaded", chalk.green("Successfully ✅"))))

    const clientID = "1002407126188179527";
    //const guildID = '1002414283113640036';

    const rest = new REST({ version: "9" }).setToken(process.env.Token);
    try {
      //console.log("Started Refreshing application (/) commands");

      await rest.put(Routes.applicationCommands(clientID), {
        body: client.commandArray,
      });

      //console.log("Successfully reloaded application (/) commands");
    } catch (error) {
      console.error(error);
    }
  };
};
