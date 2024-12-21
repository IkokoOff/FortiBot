const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");

module.exports.run = async (client, interaction) => {
  try {
    const gamemode = await interaction.options.getString("gamemode");

    const response = await axios.get(`https://fortnite-api.com/v2/news/${gamemode}`);

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    const data = response.data.data;

    if (!data || !data.image) {
      throw new Error("Invalid response data from Fortnite API");
    }

    const embed = new Discord.MessageEmbed()
      .setColor("GREEN")
      .setTitle(`Fortnite News for ${gamemode.toUpperCase()}`)
      .setImage(data.image)
      .setFooter(client.user.username, client.user.displayAvatarURL());

    interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error(chalk.red("Error in Fortnite News command:", error.message));

    // Création de l'embed d'erreur
    const errorEmbed = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle("Error occurred")
      .setDescription(`An error occurred while fetching Fortnite news.\n\n**Details**: ${error.message}`)
      .setFooter(client.user.username, client.user.displayAvatarURL());

    // Répondre avec l'embed d'erreur
    interaction.reply({ embeds: [errorEmbed] });
  }
};
