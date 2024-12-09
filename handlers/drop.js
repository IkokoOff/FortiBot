const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports.run = async (client, interaction) => {
  try {
    // Appeler l'API Fortnite
    const { data } = await axios.get('https://fortnite-api.com/v1/map');
    const mapData = data.data;
    const pois = data.data.pois;

    // Choisir un POI aléatoire
    const randomPOI = pois[Math.floor(Math.random() * pois.length)];
    const { name, location } = randomPOI;
    const { x, y } = location;

    // Convertir les coordonnées Fortnite en pixels pour l'image
    const mapWidth = 2048;
    const mapHeight = 2048;
    const mapX = Math.round((x + 175000) / 350000 * mapWidth);
    const mapY = Math.round((175000 - y) / 350000 * mapHeight);

    // Charger l'image et dessiner le pin
    const canvas = createCanvas(mapWidth, mapHeight);
    const ctx = canvas.getContext('2d');
    const mapImage = await loadImage(mapData.images.pois);
    const pinImage = await loadImage(path.join(__dirname, '../assets/pin/pin.png'));

    ctx.drawImage(mapImage, 0, 0, mapWidth, mapHeight);
    ctx.drawImage(pinImage, mapX - 15, mapY - 30, 30, 30);

    // Convertir l'image en buffer
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'map-pin.png' });

    // Créer un embed avec les informations du POI
    const embed = new EmbedBuilder()
      .setTitle('Point d\'intérêt aléatoire')
      .setDescription(`**Nom :** ${name}\n**Coordonnées :** (${x}, ${y})`)
      .setImage('attachment://map-pin.png')
      .setColor(0x00AE86);

    // Répondre avec l'image et l'embed
    await interaction.reply({ embeds: [embed], files: [attachment] });

  } catch (error) {
    console.error(error.message, error.stack);
    interaction.reply({
      content: `Une erreur est survenue : ${error.message}`,
      ephemeral: true
    });
  }
};
