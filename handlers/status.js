const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");
const path = require("path");

module.exports.run = async (client, interaction) => {
  try {
    const response = await axios.get("https://api.nitestats.com/v1/epic/lightswitch");

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    const serviceData = response.data;
    if (!serviceData || serviceData.length === 0) {
      throw new Error("No data returned from the API");
    }

    const fortniteStatus = serviceData.find(service => service.serviceInstanceId === "fortnite");

    if (!fortniteStatus) {
      throw new Error("Fortnite service data not found");
    }

    // Déterminer l'image en fonction du statut
    const imagePath = fortniteStatus.status === "UP"
      ? path.join(__dirname, "../assets/UPimage.png") // Chemin local pour image UP
      : path.join(__dirname, "../assets/DOWNimage.png"); // Chemin local pour image DOWN

    // Créer un attachement Discord à partir de l'image locale
    const attachment = new Discord.MessageAttachment(imagePath);

    // Ajouter un emoji si le statut est "UP"
    const statusText = fortniteStatus.status === "UP"
      ? `> Up <a:checkmark:1317922241471840329>`
      : `> Down <a:deny:1318915250627678269>`

    // Créer l'embed avec les données de l'API et inclure l'image
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setImage(`attachment://${path.basename(imagePath)}`) // URL de l'image locale
      .addField("**Fortnite Status:**", statusText || "N/A", false)
      .addField("**Message:**", fortniteStatus.message || "N/A", false)
      .setFooter({
        text: client.user.username, // Nom du bot
        iconURL: client.user.displayAvatarURL(), // Icône du bot
      });

    // Envoyer la réponse avec l'embed et l'image attachée
    interaction.reply({ embeds: [embed], files: [attachment] });
  } catch (error) {
    console.error(chalk.red("Erreur lors de la commande de statut Fortnite:", error.message));
    interaction.reply({
      content: "Une erreur s'est produite lors de la récupération des données de l'API.",
    });
  }
};
