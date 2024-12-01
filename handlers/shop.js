const Discord = require("discord.js");
const chalk = require("chalk");
const path = require("path");

module.exports.run = async (client, interaction) => {
  try {
    // Defer the reply if it will take more than 3 seconds
    await interaction.deferReply();

    const shopImagePath = path.join(__dirname, '../shop/Temp/shopImage.png');

    // Créer l'attachement
    const attachment = new Discord.MessageAttachment(shopImagePath);

    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle("SHOP")
      .setImage('attachment://shopImage.png')
      .setFooter(client.user.username, client.user.displayAvatarURL());

    // Send the reply with the attachment
    await interaction.editReply({ embeds: [embed], files: [attachment] });
  } catch (error) {
    console.error(chalk.red("Error in Fortnite Shop command:", error.message));
    interaction.reply({
      content: "Shop not working",
    });
  }
};
