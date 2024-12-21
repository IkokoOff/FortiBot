const Discord = require("discord.js");
const chalk = require("chalk");
const path = require("path");

module.exports.run = async (client, interaction) => {
  try {
    // Defer the reply if it will take more than 3 seconds
    await interaction.deferReply();

    const shopImagePath = path.join(__dirname, '../shop/Temp/shopImage.png');

    // Create the attachment
    const attachment = new Discord.MessageAttachment(shopImagePath);

    // Get the current date
    const currentDate = new Date();
    const dayOfWeek = currentDate.toLocaleString('en-US', { weekday: 'long' });  // Day of the week in English (e.g., "Wednesday")
    const month = currentDate.toLocaleString('en-US', { month: 'long' });  // Month as text (e.g., "December")
    const day = currentDate.getDate();  // Day of the month (e.g., "4")
    const year = currentDate.getFullYear();  // Year (e.g., "2024")

    // Add an ordinal suffix to the day
    const suffix = (day) => {
      if (day >= 11 && day <= 13) return 'th';  // For days 11, 12, 13 (e.g., "11th")
      switch (day % 10) {
        case 1: return 'st';  // 1 -> "st"
        case 2: return 'nd';  // 2 -> "nd"
        case 3: return 'rd';  // 3 -> "rd"
        default: return 'th';  // Otherwise -> "th"
      }
    };
    const dayWithSuffix = day + suffix(day);  // Add the ordinal suffix to the day

    // Create the embed with the formatted date
    const embed = new Discord.MessageEmbed()
      .setColor("GREEN")
      .setTitle(`🛒 Fortnite Item Shop | ${dayOfWeek}, ${month} ${dayWithSuffix} ${year}`)
      .setImage('attachment://shopImage.png')
      .setFooter(client.user.username, client.user.displayAvatarURL());

    // Send the reply with the attachment
    await interaction.editReply({ embeds: [embed], files: [attachment] });
  } catch (error) {
    console.error(chalk.red("Error in Fortnite Shop command:", error.message));

    // Create an error embed
    const errorEmbed = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle("❌ Error")
      .setDescription("An error occurred while retrieving the Fortnite shop.")
      .addField("Error Message", error.message)
      .setFooter(client.user.username, client.user.displayAvatarURL());

    // Reply with the error embed
    await interaction.editReply({ embeds: [errorEmbed] });
  }
};
