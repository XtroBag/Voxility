const { ActivityType } = require('discord.js')

module.exports = (client) => {
    client.pickPresence = async () => {

        const options = [
            {
                type: ActivityType.Playing,
                text: "with slash cmds",
                status: "idle"
            },
            {
                type: ActivityType.Listening,
                text: "commands",
                status: "online"
            },
            {
                type: ActivityType.Watching,
                text: "development",
                status: "dnd"
            }
        ];

        const option = Math.floor(Math.random() * options.length);

        client.user.setPresence({
            activities: [{
                name: options[option].text,
                type: options[option].type
            }],
            status: options[option].status
        })
    }
}