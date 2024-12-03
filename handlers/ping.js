module.exports.run = async (client, interaction) => {
  try {
    // Répondre à l'interaction avec la latence du bot
    const pingEmbed = {
      color: "RANDOM",
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
    interaction.reply({
      content: "An error occurred while processing your request. Please try again later.",
      ephemeral: true
    });
  }
};
