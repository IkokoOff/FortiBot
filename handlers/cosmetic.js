const Discord = require("discord.js");
const axios = require("axios").default;

module.exports.run = async (client, interaction) => {
  try {
    const name = interaction.options.getString("name");

    // Requête vers la première API (https://fortnite-api.com)
    const fortniteApiReq = await axios.get("https://fortnite-api.com/v2/cosmetics/br/search", {
      params: {
        name: name,
      },
    });

    // Requête vers la deuxième API (https://fortniteapi.io)
    const fortniteApiIoReq = await axios.get("https://fortniteapi.io/v2/items/list", {
      params: { name: name },
      headers: {
        Authorization: process.env.FNAPIIO, // Votre clé d'API fortniteapi.io
      },
    });

    if (
      fortniteApiReq.status === 200 &&
      fortniteApiReq.data.data &&
      fortniteApiIoReq.status === 200 &&
      fortniteApiIoReq.data.items.length
    ) {
      const item1 = fortniteApiReq.data.data;
      const item2 = fortniteApiIoReq.data.items[0];

      // Gestion de l'historique du shop
      const shopHistory = item2.shopHistory || [];
      const firstAppearance = shopHistory.length ? `<t:${Math.floor(new Date(shopHistory[0]).getTime() / 1000)}>` : "N/A";
      const lastAppearance = shopHistory.length
        ? `<t:${Math.floor(new Date(shopHistory[shopHistory.length - 1]).getTime() / 1000)}>`
        : "N/A";
      const totalAppearances = shopHistory.length;

      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setThumbnail(item1.images.icon) // Image sur le côté
        .setTitle("Cosmetic Info:")
        .addFields(
          { name: "Name:", value: item1.name, inline: true },
          { name: "Description:", value: item1.description || "No description", inline: true },
          { name: "Cosmetic ID:", value: item1.id, inline: true },
          { name: "Cosmetic Type:", value: item1.type.displayValue, inline: true },
          { name: "Rarity:", value: item1.rarity.displayValue, inline: true },
          { name: "Set:", value: item1.set?.text || "No set information", inline: true },
          { name: "Introduction:", value: item1.introduction?.text || "Unknown", inline: true },
          { name: "Tags:", value: item2.gameplayTags?.join(", ") || "No tags available", inline: true },
          { name: "Path:", value: item2.path || "No path available", inline: true },
          { name: "Video:", value: item1.showcaseVideo ? `[Watch Video](https://youtu.be/${item1.showcaseVideo})` : "No video available", inline: true },
          {
            name: "Shop History",
            value: `First: ${firstAppearance}\nLast: ${lastAppearance}\nTotal: ${totalAppearances}`,
            inline: true
          }
        );

      return interaction.reply({ embeds: [embed] });
    } else {
      return interaction.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setTitle(`OOPS! Didn't find ${name}`)
            .setColor("RED")
            .setDescription("Please provide a correct name :)"),
        ],
      });
    }
  } catch (error) {
    console.error(error);

    return interaction.reply({
      embeds: [
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle("API ERROR. Please try later :)"),
      ],
    });
  }
};
