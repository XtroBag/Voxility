const { ActivityType } = require("discord.js");
const config = require("../../../config.json");

module.exports = {
  name: "presenceUpdate",
  async execute(oldPresence, newPresence, client) {
    if (config.Settings.FollowingStatus === true) {
    try {
      switch (newPresence.status) {
        case "online":
          client.user.setPresence({
            activities: [{
                type: ActivityType.Listening,
                name: "commands",
              }],
            status: "online",
          });
          break;
        case "idle":
          client.user.setPresence({
            activities: [{
                type: ActivityType.Playing,
                name: "with code",
              }],
            status: "idle",
          });
          break;
        case "dnd":
          client.user.setPresence({ 
            activities: [{
                type: ActivityType.Watching,
                name: "code be made",
              }],
            status: "dnd",
          });
          break;
        default:
          return;
      }
    } catch (err) {
      console.log(err);
    }


  } else {
    return;
  }

  },
};
