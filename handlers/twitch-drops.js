const Discord = require("discord.js");
const axios = require("axios").default;

module.exports.run = async (client, interaction) => {
  try {
    // Récupérer les données depuis l'API Fortnite Twitch Drops
    const req = await axios.get("https://fortniteapi.io/v1/twitch/drops", {
      headers: {
        Authorization: process.env.FNAPIIO, // Clé API
      },
    });

    if (req.status === 200) {
      const drops = req.data.drops;

      if (drops && drops.length > 0) {
        // Construction d'un embed Discord pour afficher les drops
        const embed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle("Twitch Drops disponibles pour Fortnite")
          .setDescription("Voici les informations sur les drops Twitch actifs ou passés.");

        drops.forEach((drop) => {
          embed.addField(
            `${drop.displayName} (${drop.status})`,
            `**Description:** ${drop.description || "Aucune description"}\n` +
              `**Début:** ${new Date(drop.startDate).toLocaleString()}\n` +
              `**Fin:** ${new Date(drop.endDate).toLocaleString()}\n` +
              `[Détails](${drop.detailsURL})`,
            false
          );
        });

        return interaction.reply({ embeds: [embed] });
      } else {
        // Aucun drop trouvé
        return interaction.reply({
          embeds: [
            new Discord.MessageEmbed()
              .setTitle("Aucun drop disponible")
              .setColor("YELLOW")
              .setDescription("Il n'y a actuellement aucun Twitch Drop actif."),
          ],
        });
      }
    } else {
      throw new Error("Erreur lors de l'appel à l'API Fortnite Twitch Drops");
    }
  } catch (error) {
    console.error(error);

    // Gestion des erreurs
    return interaction.reply({
      embeds: [
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle("Erreur API")
          .setDescription("Une erreur est survenue lors de la récupération des données. Veuillez réessayer plus tard."),
      ],
    });
  }
};
