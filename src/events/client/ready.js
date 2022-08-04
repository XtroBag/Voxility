const { Client, GatewayIntentBits, ActivityType } = require('discord.js')
const chalk = require('chalk')

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        client.user.setPresence({
            activities: [{ name: `discord.js v14`, type: ActivityType.Watching }],
            status: 'idle',
          });

        console.log(chalk.red('[CLIENT]:'), chalk.white("is"), chalk.green("online!"))
    }
}