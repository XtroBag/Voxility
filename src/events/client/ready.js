const { Client, ActivityType } = require('discord.js')
const chalk = require('chalk')

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
       // setInterval(client.pickPresence, 10 * 1000);
        console.log(chalk.red('[CLIENT]:'), chalk.white("is"), chalk.green("online!"))
    }
}