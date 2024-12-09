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
        const now = new Date(); // Date actuelle
        const activeDrops = drops.filter(drop => {
          const endDate = new Date(drop.endDate); // Convertir la fin en objet Date
          return endDate > now; // Garder seulement les drops encore valides
        });

        if (activeDrops.length > 0) {
          // Construction d'un embed Discord pour les drops actifs
          const embed = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setTitle("Twitch Drops Actifs pour Fortnite")
            .setDescription("Voici les Twitch Drops actuellement disponibles pour Fortnite.");

          activeDrops.forEach(drop => {
            const startTimestamp = Math.floor(new Date(drop.startDate).getTime() / 1000); // Convertir en timestamp UNIX
            const endTimestamp = Math.floor(new Date(drop.endDate).getTime() / 1000); // Convertir en timestamp UNIX

            embed.addField(
              `${drop.displayName}`,
              `**Description :** ${drop.description || "Aucune description"}\n` +
                `**Début :** <t:${startTimestamp}:F> (<t:${startTimestamp}:R>)\n` +
                `**Fin :** <t:${endTimestamp}:F> (<t:${endTimestamp}:R>)\n` +
                `[Détails](${drop.detailsURL})`,
              false
            );
          });

          return interaction.reply({ embeds: [embed] });
        } else {
          // Aucun drop actif
          return interaction.reply({
            embeds: [
              new Discord.MessageEmbed()
                .setTitle("Aucun drop actif")
                .setColor("YELLOW")
                .setDescription("Il n'y a actuellement aucun Twitch Drop actif pour Fortnite."),
            ],
          });
        }
      } else {
        // Aucun drop trouvé
        return interaction.reply({
          embeds: [
            new Discord.MessageEmbed()
              .setTitle("Aucun drop disponible")
              .setColor("YELLOW")
              .setDescription("Il n'y a actuellement aucun Twitch Drop enregistré."),
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
