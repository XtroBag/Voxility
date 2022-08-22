const config = require("../../../config.json");

module.exports = {
  name: "presenceUpdate",
  async execute(oldPresence, newPresence, client) {
      try {
        switch (newPresence.status) {
          case "online":
            client.user.setStatus("online");
            break;
          case "idle":
            client.user.setStatus("idle");
            break;
          case "dnd":
            client.user.setStatus("dnd");
            break;
          default:
            console.log("Owner has gone invisible mode or bot has not been updated");
        }
      } catch (err) {
        console.log(err);
      }

  },
};
