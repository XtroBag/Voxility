require("dotenv").config()
const { Token, Database } = process.env;
const { Client, Collection, GatewayIntentBits, Guild, ActivityType } = require("discord.js");
const fs = require("fs");
const emojis = require('../emojis.json')
const { connect } = require('mongoose');
const config = require("../config.json");

// the [client] and the Collections
const client = new Client({ intents: ["Guilds", "MessageContent", "GuildMessages", "GuildPresences"] });
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.commandArray = [];

// handles the funcions folder files
const functionFolder = fs.readdirSync(`./src/functions`);
for (const folder of functionFolder) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles)
    require(`./functions/${folder}/${file}`)(client);
}


// the command handler calls
client.handleEvents();
client.handleCommands();
client.handleComponents();


(async () => {
  try {
      connect(Database)
  } catch (err) {
      console.log(err) 
  }

})(); 


// the bot emojis handler
client.Check = emojis.Check;
client.Cross = emojis.Cross;
client.Owner = emojis.Owner;
client.Developer = emojis.Developer;
client.Designer = emojis.Designer;
client.Artist = emojis.Artist;
client.Invite = emojis.Invite;

// the bot loggin 
client.login(Token);