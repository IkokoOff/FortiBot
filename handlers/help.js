const Discord = require("discord.js");

module.exports.run = async (client, interaction) => {
  try {
    // Liste des commandes que tu veux afficher
    const commandsList = [
      { name: '/news', description: 'Affiche les dernières actualités.' },
      { name: '/shop', description: 'Affiche les articles disponibles dans la boutique.' },
      { name: '/map', description: 'Affiche la carte actuelle de Fortnite.' },
      { name: '/stats', description: 'Affiche vos statistiques.' },
      { name: '/invite', description: 'Donne un lien pour inviter le bot.' },
      { name: '/ping', description: 'Affiche la latence actuelle.' },
    ];

    // Constante pour le nombre de commandes par page
    const commandsPerPage = 3;

    // Calcul du nombre de pages
    const totalPages = Math.ceil(commandsList.length / commandsPerPage);

    // Fonction pour créer l'embed d'une page donnée
    const generateEmbed = (page) => {
      const start = page * commandsPerPage;
      const end = start + commandsPerPage;
      const currentCommands = commandsList.slice(start, end);

      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Liste des commandes disponibles")
        .setDescription("Voici les commandes que vous pouvez utiliser :")
        .setFooter(`Page ${page + 1} sur ${totalPages}`, client.user.displayAvatarURL());

      currentCommands.forEach(command => {
        embed.addField(command.name, command.description, false);
      });

      return embed;
    };

    // Page de départ
    let currentPage = 0;

    // Créer les boutons
    const buttons = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageButton()
          .setCustomId('previous')
          .setLabel('⬅️ Précédent')
          .setStyle('PRIMARY')
          .setDisabled(currentPage === 0),
        new Discord.MessageButton()
          .setCustomId('next')
          .setLabel('➡️ Suivant')
          .setStyle('PRIMARY')
          .setDisabled(currentPage === totalPages - 1)
      );

    // Envoie de l'embed initial
    const message = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: [buttons],
      ephemeral: true,
      fetchReply: true
    });

    // Création d'un collecteur d'interactions pour les boutons
    const collector = message.createMessageComponentCollector({
      componentType: 'BUTTON',
      time: 60000 // Le collecteur dure 60 secondes
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "Vous ne pouvez pas utiliser ces boutons.", ephemeral: true });
      }

      // Mise à jour de la page actuelle en fonction du bouton cliqué
      if (i.customId === 'previous' && currentPage > 0) {
        currentPage--;
      } else if (i.customId === 'next' && currentPage < totalPages - 1) {
        currentPage++;
      }

      // Mise à jour de l'embed et des boutons
      await i.update({
        embeds: [generateEmbed(currentPage)],
        components: [
          new Discord.MessageActionRow()
            .addComponents(
              new Discord.MessageButton()
                .setCustomId('previous')
                .setLabel('⬅️ Précédent')
                .setStyle('PRIMARY')
                .setDisabled(currentPage === 0),
              new Discord.MessageButton()
                .setCustomId('next')
                .setLabel('➡️ Suivant')
                .setStyle('PRIMARY')
                .setDisabled(currentPage === totalPages - 1)
            )
        ]
      });
    });

    collector.on('end', () => {
      // Désactivation des boutons après la fin du temps
      message.edit({
        components: [
          new Discord.MessageActionRow()
            .addComponents(
              new Discord.MessageButton()
                .setCustomId('previous')
                .setLabel('⬅️ Précédent')
                .setStyle('PRIMARY')
                .setDisabled(true),
              new Discord.MessageButton()
                .setCustomId('next')
                .setLabel('➡️ Suivant')
                .setStyle('PRIMARY')
                .setDisabled(true)
            )
        ]
      });
    });
  } catch (error) {
    console.error("Erreur dans la commande help :", error.message);
    interaction.reply({
      content: "Une erreur est survenue ! Veuillez réessayer plus tard.",
      ephemeral: true
    });
  }
};
