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

      // Gestion du shop (lastAppearance, releaseDate et total appearances)
      const releaseDate = item2.releaseDate ? `<t:${Math.floor(new Date(item2.releaseDate).getTime() / 1000)}>` : "N/A";
      const lastAppearance = item2.lastAppearance
        ? `<t:${Math.floor(new Date(item2.lastAppearance).getTime() / 1000)}>`
        : "N/A";
      const totalAppearances = item2.shopHistory ? item2.shopHistory.length : 0;

      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setThumbnail(item1.images.icon) // Image sur le côté
        .setTitle(`Information on: ${item1.name}`)
        .addFields(
          { name: "Name", value: item1.name, inline: true },
          { name: "Description", value: item1.description || "No description", inline: true },
          { name: "Cosmetic ID", value: item1.id, inline: true },
          { name: "Cosmetic Type", value: item1.type.displayValue, inline: true },
          { name: "Rarity", value: item1.rarity.displayValue, inline: true },
          { name: "Set", value: item1.set?.text || "No set information", inline: true },
          { name: "Introduction", value: item1.introduction?.text || "Unknown", inline: true },
          { name: "Tags", value: item2.gameplayTags?.length ? "```json\n" + item2.gameplayTags.join("\n") + "\n```" : "No tags available", inline: false },
          { name: "Path", value: `\`${item2.path}\``, inline: false },
          { name: "Video", value: item1.showcaseVideo ? `[Watch Video](https://youtu.be/${item1.showcaseVideo})` : "No video available", inline: true },
          {
            name: "Shop History",
            value: `Release Date: ${releaseDate}\nLast Appearance: ${lastAppearance}\nTotal: ${totalAppearances}`,
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
