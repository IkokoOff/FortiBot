const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");

module.exports.run = async (client, interaction) => {
  try {
    const response = await axios.get("https://fortnite-api.com/v1/map");

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    const data = response.data.data;

    if (!data || !data.images || !data.images.pois) {
      throw new Error("Invalid response data from Fortnite API");
    }

    const embed = new Discord.MessageEmbed()
      .setColor("GREEN")
      .setTitle("Fortnite Map")
      .setImage(`${data.images.pois}?timestamp=${Date.now()}`) // Ajout du timestamp
      .setFooter(client.user.username, client.user.displayAvatarURL());

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error(chalk.red("Error in Fortnite Map command:", error.message));

    const errorEmbed = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle("Error")
      .setDescription(`An error occurred while fetching the Fortnite map: ${error.message}`)
      .setFooter("Please try again later");

    interaction.reply({
      embeds: [errorEmbed],
    });
  }
};
