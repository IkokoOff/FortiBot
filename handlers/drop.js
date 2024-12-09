const { MessageAttachment, MessageEmbed } = require('discord.js');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports.run = async (client, interaction) => {
  try {
    // Appeler l'API Fortnite pour récupérer les données de la carte
    const { data } = await axios.get('https://fortnite-api.com/v1/map');
    const mapData = data.data;
    const pois = data.data.pois;

    // Choisir un POI aléatoire
    const randomPOI = pois[Math.floor(Math.random() * pois.length)];
    const { name, location } = randomPOI;
    const { x, y } = location;

    // Convertir les coordonnées Fortnite en pixels pour l'image
    const mapWidth = 2048; // Largeur de l'image de la carte
    const mapHeight = 2048; // Hauteur de l'image de la carte
    const mapX = Math.round(((x + 175000) / 350000) * mapWidth); // Conversion X
    const mapY = Math.round(((175000 - y) / 350000) * mapHeight); // Conversion Y

    // Charger l'image de la carte et dessiner le pin
    const canvas = createCanvas(mapWidth, mapHeight);
    const ctx = canvas.getContext('2d');
    const mapImage = await loadImage(mapData.images.pois); // Carte sans points
    const pinImage = await loadImage(path.join(__dirname, '../assets/pin/pin.png')); // Pin rouge

    ctx.drawImage(mapImage, 0, 0, mapWidth, mapHeight);
    ctx.drawImage(pinImage, mapX - 15, mapY - 30, 30, 30); // Ajuster la position du pin

    // Convertir l'image en buffer pour Discord
    const attachment = new MessageAttachment(canvas.toBuffer(), 'map-pin.png');

    // Créer un embed avec les informations du POI
    const embed = new MessageEmbed()
      .setTitle('Point d\'intérêt aléatoire')
      .setDescription(`**Nom :** ${name}\n**Coordonnées :** (${x.toFixed(2)}, ${y.toFixed(2)})`)
      .setImage('attachment://map-pin.png')
      .setColor('#00AE86');

    // Répondre avec l'embed et l'image
    await interaction.reply({ embeds: [embed], files: [attachment] });

  } catch (error) {
    console.error(error);
    // Répondre uniquement en cas d'erreur
    if (!interaction.replied) {
      await interaction.reply({
        content: `Une erreur est survenue : ${error.message}`,
        ephemeral: true,
      });
    }
  }
};
