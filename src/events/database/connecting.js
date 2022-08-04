const chalk = require('chalk')

module.exports = {
    name: "connecting",
    execute() {
        console.log(chalk.gray("[DATABASE]:", chalk.white("Trying Connection...")))
        
    }
}