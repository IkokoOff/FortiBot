const Discord = require("discord.js");
const axios = require("axios").default;

module.exports.run = async (client, interaction) => {
  try {
    const name = interaction.options.getString("name");

    // Requête vers l'API fortnite-api.com
    const req = await axios.get(`https://fortnite-api.com/v2/cosmetics/br/search`, {
      params: { name: name },
    });

    if (req.status === 200 && req.data.data) {
      const item = req.data.data;

      // Créer un embed avec les informations du skin
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setThumbnail(item.images.icon) // Icone sur le côté
        .setTitle(`Cosmetic Info for: ${item.name}`)
        .addFields([
          { name: "Name", value: item.name || "N/A", inline: true },
          { name: "Description", value: item.description || "N/A", inline: true },
          { name: "Cosmetic ID", value: item.id || "N/A", inline: true },
          { name: "Cosmetic Type", value: item.type.value || "N/A", inline: true },
          { name: "Rarity", value: item.rarity ? item.rarity.displayValue : "N/A", inline: true },
          { name: "Set", value: item.set ? item.set.value : "N/A", inline: true },
          { 
            name: "Introduction", 
            value: item.introduction ? item.introduction.text : "N/A", 
            inline: true 
          },
          { 
            name: "Tags", 
            value: item.gameplayTags ? item.gameplayTags.join(", ") : "No tags available.", 
            inline: false 
          },
          { name: "Path", value: item.path || "N/A", inline: true },
          { 
            name: "Video", 
            value: item.showcaseVideo ? `[Watch here](https://www.youtube.com/watch?v=${item.showcaseVideo})` : "No video available.", 
            inline: true 
          },
          { 
            name: "Shop History", 
            value: item.shopHistory && item.shopHistory.length > 0
              ? item.shopHistory.join(", ")
              : "No shop history available.", 
            inline: false 
          },
        ])
        .setImage(item.images.featured || item.images.icon); // Grande image du skin

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
          .setTitle("API ERROR. Please try later :)")
          .setDescription(error.message || "Unknown error occurred."),
      ],
    });
  }
};
