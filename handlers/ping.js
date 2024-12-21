module.exports.run = async (client, interaction) => {
  try {
    // Répondre à l'interaction avec la latence du bot
    const pingEmbed = {
      color: "GREEN",
      title: "Pong! 🏓",
      description: `Latency: **${Date.now() - interaction.createdTimestamp}ms**\nAPI Latency: **${Math.round(client.ws.ping)}ms**`,
      footer: {
        text: `Requested by ${interaction.user.tag}`,
        icon_url: interaction.user.displayAvatarURL()
      }
    };

    await interaction.reply({ embeds: [pingEmbed] });

  } catch (error) {
    console.error("Error in /ping command:", error.message);

    // Création d'un embed pour l'erreur
    const errorEmbed = {
      color: "RED",
      title: "<a:denyanimated:1318915250627678269> Error",
      description: `An error occurred while processing your request:\n\n**${error.message}**`,
      footer: {
        text: `Requested by ${interaction.user.tag}`,
        icon_url: interaction.user.displayAvatarURL()
      }
    };

    // Répondre avec un embed d'erreur
    interaction.reply({
      embeds: [errorEmbed],
      ephemeral: true // Rendre l'erreur visible uniquement pour l'utilisateur
    });
  }
};
