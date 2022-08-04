const chalk = require('chalk')

module.exports = {
    name: "connected",
    execute() {
        console.log(chalk.gray("[DATABASE]:", chalk.green("Connected")))
    }
}