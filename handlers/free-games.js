const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");

module.exports.run = async (client, interaction) => {
  try {
    const response = await axios.get("https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions");

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    // Filter free games with a base price and discounted to zero
    const freeGames = response.data.data.Catalog.searchStore.elements.filter(game => {
      const { totalPrice } = game.price;
      return totalPrice.originalPrice > 0 && totalPrice.discountPrice === 0;
    });

    if (freeGames.length === 0) {
      return interaction.reply({
        content: "There are currently no free games available.",
      });
    }

    // Format the free games data into a single embed
    const gameEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle("Free Promotional Games")
      .setDescription(freeGames.map(gameData => {
        const { title, urlSlug, promotions } = gameData;

        // Extract promotion start and end dates
        const promo = promotions.promotionalOffers?.[0]?.promotionalOffers?.[0];
        const startDate = promo ? `<t:${Math.floor(new Date(promo.startDate).getTime() / 1000)}:F> (<t:${Math.floor(new Date(promo.startDate).getTime() / 1000)}:R>)` : "N/A";
        const endDate = promo ? `<t:${Math.floor(new Date(promo.endDate).getTime() / 1000)}:F> (<t:${Math.floor(new Date(promo.endDate).getTime() / 1000)}:R>)` : "N/A";
        const gameUrl = `https://www.epicgames.com/store/en-US/p/${urlSlug}`; // Link to the Epic Games product page

        // Return the game as a clickable link with timestamps
        return `**[${title}](${gameUrl})**\nStart date: **${startDate}**\nEnd date: **${endDate}**\n`;
      }).join("\n"));

    // Reply with the embed containing all the free games
    interaction.reply({ embeds: [gameEmbed] });
  } catch (error) {
    console.error(chalk.red("Error in Fortnite creatorcode command:", error.message));
    interaction.reply({
      content: "Unable to fetch free game information.",
    });
  }
};
