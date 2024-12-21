const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");

module.exports.run = async (client, interaction) => {
  try {
    const response = await axios.get("https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions");

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    // Filter free games and exclude "Mystery Game"
    const freeGames = response.data.data.Catalog.searchStore.elements.filter(game => {
      return game.price.totalPrice.discountPrice === 0 && !game.title.includes("Mystery Game");
    });

    if (freeGames.length === 0) {
      const noGamesEmbed = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("No Free Games Available")
        .setDescription("There are currently no free games available on the Epic Games Store.")
        .setFooter({
          text: client.user.username, // Bot's name
          iconURL: client.user.displayAvatarURL() // Bot's icon
        });

      return interaction.reply({ embeds: [noGamesEmbed] });
    }

    // Format the free games data into a single embed
    const gameEmbed = new Discord.MessageEmbed()
      .setColor("GREEN")
      .setTitle("Free Promotional Games")
      .setDescription(freeGames.map(gameData => {
        const { title, productSlug, promotions, status } = gameData;

        // Extract promotion start and end dates
        const promo = promotions.promotionalOffers?.[0]?.promotionalOffers?.[0];
        const startDate = promo ? `<t:${Math.floor(new Date(promo.startDate).getTime() / 1000)}:D> (<t:${Math.floor(new Date(promo.startDate).getTime() / 1000)}:R>)` : "N/A";
        const endDate = promo ? `<t:${Math.floor(new Date(promo.endDate).getTime() / 1000)}:D> (<t:${Math.floor(new Date(promo.endDate).getTime() / 1000)}:R>)` : "N/A";
        const gameUrl = `https://www.epicgames.com/store/en-US/p/${productSlug}`; // Link to the Epic Games product page

        // Return the game as a clickable link with timestamps
        return `**${status}**\n**[${title}](${gameUrl})**\nStart date: **${startDate}**\nEnd date: **${endDate}**\n`;
      }).join("\n"))
      .setFooter({
        text: client.user.username, // Bot's name
        iconURL: client.user.displayAvatarURL() // Bot's icon
      });

    // Reply with the embed containing all the free games
    interaction.reply({ embeds: [gameEmbed] });
  } catch (error) {
    console.error(chalk.red("Error in Fortnite free-games command:", error.message));

    const errorEmbed = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle("Error Fetching Free Games")
      .setDescription("Unable to fetch free game information from the Epic Games Store. Please try again later.")
      .setFooter({
        text: client.user.username, // Bot's name
        iconURL: client.user.displayAvatarURL() // Bot's icon
      });

    interaction.reply({ embeds: [errorEmbed] });
  }
};
