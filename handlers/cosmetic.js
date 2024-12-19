
const Discord = require("discord.js");
const axios = require("axios").default;

module.exports.run = async (client, interaction) => {
  try {
    const name = interaction.options.getString("name");

    const req = await axios.get("https://fortnite-api.com/v2/cosmetics/br/search", {
      params: {
        name: name,
      },
    });

    if (req.status === 200 && req.data.data) {
      const item = req.data.data;

      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setThumbnail(item.images.icon) // Image sur le côté
        .setTitle("Cosmetic Info:")
        .addFields(
          { name: "Name:", value: item.name, inline: true },
          { name: "Description:", value: item.description || "No description", inline: true },
          { name: "Cosmetic ID:", value: item.id, inline: true },
          { name: "Cosmetic Type:", value: item.type.displayValue, inline: true },
          { name: "Rarity:", value: item.rarity.displayValue, inline: true },
          { name: "Set:", value: item.set?.text || "No set information", inline: true },
          { name: "Introduction:", value: item.introduction?.text || "Unknown", inline: true },
          { name: "Video:", value: item.showcaseVideo ? `[Watch Video](https://youtu.be/${item.showcaseVideo})` : "No video available", inline: true }
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
