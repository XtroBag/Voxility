const { readdirSync } = require("fs");
const chalk = require('chalk')

module.exports = (client) => {
  client.handleComponents = async () => {
    const componentFolders = readdirSync(`./src/components`);
    for (const folder of componentFolders) {
      const componentFiles = readdirSync(`./src/components/${folder}`).filter(
        (file) => file.endsWith(".js")
      );

      const { buttons, selectMenus, modals } = client;

      switch (folder) {
        case "buttons":
          for (const file of componentFiles) {
            const button = require(`../../components/${folder}/${file}`);
            buttons.set(button.data.name, button);

            //console.log(`Button: ${button.data.name} has been loaded!`);
          }
          console.log(chalk.blue("[BUTTONS]:", chalk.white("Loaded", chalk.green("Successfully ✅"))))

          break;

        case "selectMenus":
          for (const file of componentFiles) {
            const menu = require(`../../components/${folder}/${file}`);
            selectMenus.set(menu.data.name, menu);

            //console.log(`Menu: ${menu.data.name} has been loaded!`);
          }
          console.log(chalk.magenta("[MENUS]:", chalk.white("Loaded", chalk.green("Successfully ✅"))))

          break;

          case "modals":
            for (const file of componentFiles) {
              const modal = require(`../../components/${folder}/${file}`)
              modals.set(modal.data.name, modal)

              //console.log(`Modal: ${modal.data.name} has been loaded!`);
            }
            console.log(chalk.yellow("[MODALS]:", chalk.white("Loaded", chalk.green("Successfully ✅"))))

            break;

        default:
          break;
      }
    }
  };
};
