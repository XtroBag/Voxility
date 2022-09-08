const chalk = require('chalk')
const config = require('../../../config.json');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        if (config.Settings.ActivityStatus === true) {
        setInterval(client.pickPresence, 10 * 1000);
        } else {
            return;
        } 
        console.log(chalk.red('[CLIENT]:'), chalk.white("is"), chalk.green("online!"))

    }
}