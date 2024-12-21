const Discord = require("discord.js");
const axios = require("axios").default;

module.exports.run = async (client, interaction) => {
  try {
    // Fetch data from the Fortnite Twitch Drops API
    const req = await axios.get("https://fortniteapi.io/v1/twitch/drops", {
      headers: {
        Authorization: process.env.FNAPIIO, // API key
      },
    });

    if (req.status === 200) {
      const drops = req.data.drops;

      if (drops && drops.length > 0) {
        const now = new Date(); // Current date
        const activeDrops = drops.filter(drop => {
          const endDate = new Date(drop.endDate); // Convert end date to Date object
          return endDate > now; // Keep only valid drops
        });

        if (activeDrops.length > 0) {
          // Build a Discord embed for active drops
          const embed = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setTitle("Active Twitch Drops for Fortnite")
            .setDescription("Here are the currently available Twitch Drops for Fortnite.");

          activeDrops.forEach(drop => {
            const startTimestamp = Math.floor(new Date(drop.startDate).getTime() / 1000); // Convert to UNIX timestamp
            const endTimestamp = Math.floor(new Date(drop.endDate).getTime() / 1000); // Convert to UNIX timestamp

            embed.addField(
              `${drop.displayName}`,
              `**Description:** ${drop.description || "No description"}\n` +
                `**Start:** <t:${startTimestamp}:F> (<t:${startTimestamp}:R>)\n` +
                `**End:** <t:${endTimestamp}:F> (<t:${endTimestamp}:R>)\n` +
                `[Details](${drop.detailsURL})`,
              false
            );
          });

          return interaction.reply({ embeds: [embed] });
        } else {
          // No active drops
          return interaction.reply({
            embeds: [
              new Discord.MessageEmbed()
                .setTitle("No Active Drops")
                .setColor("RED")
                .setDescription("There are currently no active Twitch Drops for Fortnite."),
            ],
          });
        }
      } else {
        // No drops found
        return interaction.reply({
          embeds: [
            new Discord.MessageEmbed()
              .setTitle("No Drops Available")
              .setColor("RED")
              .setDescription("There are currently no registered Twitch Drops."),
          ],
        });
      }
    } else {
      throw new Error("Error while calling the Fortnite Twitch Drops API");
    }
  } catch (error) {
    console.error(error);

    // Handle errors
    return interaction.reply({
      embeds: [
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle("API Error")
          .setDescription("An error occurred while fetching the data. Please try again later."),
      ],
    });
  }
};
