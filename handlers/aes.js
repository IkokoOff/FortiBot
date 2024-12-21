const Discord = require("discord.js");
const axios = require("axios").default;

module.exports.run = async (client, interaction) => {
  try {
    const { data } = await axios.get("https://fortnite-api.com/v2/aes");

    if (!data || !data.data) {
      throw new Error("Invalid response from Fortnite API");
    }

    const { build, mainKey, dynamicKeys } = data.data;

    // Split dynamicKeys into pages (25 fields max per page)
    const chunkSize = 25;
    const pages = [];
    for (let i = 0; i < dynamicKeys.length; i += chunkSize) {
      const chunk = dynamicKeys.slice(i, i + chunkSize);
      const embed = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setTitle(`Current AES Keys for ${build} (Page ${Math.floor(i / chunkSize) + 1})`)
        .setDescription(`The main AES Key for this build is: **${mainKey}**`);

      chunk.forEach((element) => {
        if (element.pakFilename.includes(".pak")) {
          embed.addField(`${element.pakFilename}`, `${element.key}`);
        }
      });

      pages.push(embed);
    }

    let currentPage = 0;

    // Create navigation buttons
    const row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setCustomId("previous")
        .setLabel("◀️ Previous")
        .setStyle("PRIMARY")
        .setDisabled(true),
      new Discord.MessageButton()
        .setCustomId("next")
        .setLabel("▶️ Next")
        .setStyle("PRIMARY")
        .setDisabled(pages.length === 1), // Disable "Next" if there's only one page
      new Discord.MessageButton()
        .setCustomId("close")
        .setLabel("Close")
        .setEmoji('<:denystatic:1320033866328838155>')
        .setStyle("DANGER")
    );

    // Send the initial embed
    const message = await interaction.reply({
      embeds: [pages[currentPage]],
      components: [row],
      fetchReply: true,
    });

    // Create a collector for button interactions
    const filter = (btnInteraction) =>
      btnInteraction.user.id === interaction.user.id; // Ensure only the command user can interact
    const collector = message.createMessageComponentCollector({
      filter,
      time: 120000, // 2 minutes timeout
    });

    collector.on("collect", async (btnInteraction) => {
      if (btnInteraction.customId === "previous") {
        currentPage = Math.max(currentPage - 1, 0);
      } else if (btnInteraction.customId === "next") {
        currentPage = Math.min(currentPage + 1, pages.length - 1);
      } else if (btnInteraction.customId === "close") {
        collector.stop(); // Stop the collector manually
        return btnInteraction.update({
          content: "Interaction closed by the user.",
          embeds: [],
          components: [],
        });
      }

      // Update buttons
      row.components[0].setDisabled(currentPage === 0);
      row.components[1].setDisabled(currentPage === pages.length - 1);

      // Update the embed
      await btnInteraction.update({
        embeds: [pages[currentPage]],
        components: [row],
      });
    });

    collector.on("end", () => {
      // Disable buttons after timeout
      row.components.forEach((button) => button.setDisabled(true));
      message.edit({ components: [row] }).catch(console.error);
    });
  } catch (error) {
    console.error(error);

    const errorEmbed = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle("Error Fetching AES Keys")
      .setDescription("Unable to retrieve AES keys from the Fortnite API. Please try again later.")
      .setFooter({
        text: client.user.username, // Bot's name
        iconURL: client.user.displayAvatarURL(), // Bot's icon
      });

    interaction.reply({ embeds: [errorEmbed] });
  }
};
