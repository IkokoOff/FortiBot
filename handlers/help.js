const Discord = require("discord.js");

module.exports.run = async (client, interaction) => {
  try {
    // Liste des commandes que tu veux afficher
    const commandsList = [
      { name: '/news', description: 'Affiche les dernières actualités.' },
      { name: '/shop', description: 'Affiche les articles disponibles dans la boutique.' },
      { name: '/map', description: 'Affiche la carte actuelle de Fortnite.' },
    ];

    // Création de l'embed
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle("Liste des commandes disponibles")
      .setDescription("Voici les commandes que vous pouvez utiliser :")
      .setFooter(client.user.username, client.user.displayAvatarURL());

    // Ajout dynamique des commandes dans l'embed
    commandsList.forEach(command => {
      embed.addField(command.name, command.description, false);
    });

    // Envoie de l'embed en réponse
    interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error("Erreur dans la commande help :", error.message);
    interaction.reply({
      content: "Une erreur est survenue ! Veuillez réessayer plus tard.",
      ephemeral: true
    });
  }
};
