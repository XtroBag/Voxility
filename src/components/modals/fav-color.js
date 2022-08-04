module.exports = {
    data: {
        name: "fav-color"
    },
    async execute(interaction, client) {
    await interaction.reply({ content: `you said your favorite color is: ${interaction.fields.getTextInputValue("fav-color")}` })

    }
}