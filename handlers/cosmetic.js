const Discord = require("discord.js");
const axios = require("axios").default;

module.exports.run = async (client, interaction) => {
  try {
    const name = interaction.options.getString("name");

    // Requête vers fortnite-api.io pour les informations principales
    const reqFortniteIO = await axios.get("https://fortniteapi.io/v2/items/list", {
      params: { lang: "en", name: name },
      headers: {
        Authorization: process.env.FNAPIIO, // Clé API fortnite-api.io
      },
    });

    if (reqFortniteIO.status === 200 && reqFortniteIO.data.items.length) {
      const item = reqFortniteIO.data.items[0]; // Premier objet trouvé

      // Requête vers fortnite-api.com pour la vidéo
      const reqFortniteAPI = await axios.get(
        `https://fortniteapi.io/v2/items/list?id=${item.id}`
      );

      const videoLink = reqFortniteAPI.data?.data?.showcaseVideo || "No video available";

      // Création de l'embed
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setThumbnail(item.images.icon_background) // Affiche l'icône du skin
        .setTitle(`Cosmetic Info: ${item.name}`)
        .addFields([
          { name: "Name", value: item.name || "N/A", inline: true },
          { name: "Description", value: item.description || "N/A", inline: true },
          { name: "Cosmetic ID", value: item.id || "N/A", inline: true },
          { name: "Cosmetic Type", value: item.type.name || "N/A", inline: true },
          { name: "Rarity", value: item.rarity.name || "N/A", inline: true },
          { name: "Set", value: item.set ? item.set.name : "N/A", inline: true },
          { 
            name: "Introduction", 
            value: item.added ? `Added: ${item.added.date}, Version: ${item.added.version}` : "N/A", 
            inline: false 
          },
          { 
            name: "Release Date", 
            value: item.releaseDate || "N/A", 
            inline: true 
          },
          { 
            name: "Last Appearance", 
            value: item.lastAppearance || "N/A", 
            inline: true 
          },
          { 
            name: "Tags", 
            value: item.gameplayTags ? item.gameplayTags.join(", ") : "No tags available.", 
            inline: false 
          },
          { 
            name: "Path", 
            value: item.path || "N/A", 
            inline: false 
          },
          { 
            name: "Video", 
            value: videoLink !== "No video available" ? `[Watch Video](${videoLink})` : "No video available.", 
            inline: true 
          },
        ]);

      return interaction.reply({ embeds: [embed] });
    } else {
      return interaction.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setTitle(`OOPS! Didn't find "${name}"`)
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
          .setTitle("API ERROR")
          .setDescription("An error occurred while fetching data. Please try again later."),
      ],
    });
  }
};
