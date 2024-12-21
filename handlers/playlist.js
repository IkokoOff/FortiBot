const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");

module.exports.run = async (client, interaction) => {
  try {
    const id = await interaction.options.getString("playlist-id");

    const response = await axios.get(`https://fortnite-api.com/v1/playlists/${id}`);

    if (response.status !== 200 || !response.data || !response.data.data) {
      throw new Error(`Invalid playlist ID or API response`);
    }

    const playlistData = response.data.data;

    const embed = new Discord.MessageEmbed()
      .setColor("GREEN")
      .setTitle(`Playlist Information for **${id.toUpperCase()}**`)
      .addField("ID:", playlistData.id || "N/A", true)
      .addField("Name:", playlistData.name || "N/A", true)
      .addField("Game Type:", playlistData.gameType || "N/A", true)
      .addField("Minimum Players:", playlistData.minPlayers?.toString() || "N/A", true)
      .addField("Maximum Players:", playlistData.maxPlayers?.toString() || "N/A", true)
      .addField("Max Teams:", playlistData.maxTeams?.toString() || "N/A", true)
      .addField("Max Team Size:", playlistData.maxTeamSize?.toString() || "N/A", true)
      .addField("Gameplay Tags:", playlistData.gameplayTags.join(", ") || "N/A", false)
      .addField("Path:", playlistData.path || "N/A", false)
      .setFooter(`Playlist added on ${new Date(playlistData.added).toLocaleDateString()}`);

    interaction.reply({ embeds: [embed] });

  } catch (error) {
    console.error(chalk.red("Error in Fortnite playlist command:", error.message));

    const errorEmbed = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle("Error: Playlist Not Found")
      .setDescription("The playlist ID is invalid or could not be found. Please verify the ID and try again.")
      .setFooter("Ensure the playlist ID is correct or exists in the Fortnite API.");

    interaction.reply({ embeds: [errorEmbed] });
  }
};
