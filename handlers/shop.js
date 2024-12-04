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

    // Obtenir la date actuelle
    const currentDate = new Date();
    const dayOfWeek = currentDate.toLocaleString('en-US', { weekday: 'long' });  // Jour de la semaine en anglais (ex: "Wednesday")
    const month = currentDate.toLocaleString('en-US', { month: 'long' });  // Mois en texte (ex: "December")
    const day = currentDate.getDate();  // Jour du mois (ex: "4")
    const year = currentDate.getFullYear();  // Année (ex: "2024")

    // Ajouter un suffixe ordinal au jour
    const suffix = (day) => {
      if (day >= 11 && day <= 13) return 'th';  // Pour les jours 11, 12, 13 (ex: "11th")
      switch (day % 10) {
        case 1: return 'st';  // 1 -> "st"
        case 2: return 'nd';  // 2 -> "nd"
        case 3: return 'rd';  // 3 -> "rd"
        default: return 'th';  // Sinon -> "th"
      }
    };
    const dayWithSuffix = day + suffix(day);  // Ajouter le suffixe ordinal au jour

    // Créer l'embed avec la date formatée
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle(`🛒 Fortnite Item Shop | ${dayOfWeek}, ${month} ${dayWithSuffix} ${year}`)
      .setImage('attachment://shopImage.png')
      .setFooter(client.user.username, client.user.displayAvatarURL());

    // Send the reply with the attachment
    await interaction.editReply({ embeds: [embed], files: [attachment] });
  } catch (error) {
    console.error(chalk.red("Error in Fortnite Shop command:", error.message));
    interaction.reply({
      content: "Shop not working",
      ephemeral: true,
    });
  }
};
