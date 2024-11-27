const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");

module.exports.run = async (client, interaction) => {
  try {
    const code = await interaction.options.getString("code");

    const response = await axios.get(`https://fortnite-api.com/v2/creatorcode?name=${code}`);

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    const creatorData = response.data.data;
    const account = creatorData.account || {};

    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle(`Data of a creator ${code.toUpperCase()} :`)
      .addField("Code:", creatorData.code || "N/A")
      .addField("Account ID:", account.id || "N/A")
      .addField("Name:", account.name || "N/A")
      .addField("status:", creatorData.status || "N/A")

    interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error(chalk.red("Error in Fortnite creatorcode command:", error.message));
    interaction.reply({
      content: "Invalid creator code",
    });
  }
};
