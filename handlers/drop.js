const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');

module.exports = async (interaction) => {
  // Appeler l'API Fortnite
  try {
    const { data } = await axios.get('https://fortnite-api.com/v1/map');
    const mapData = data.data;
    const pois = mapData.pois;

    // Choisir un POI aléatoire
    const randomPOI = pois[Math.floor(Math.random() * pois.length)];
    const { name, location } = randomPOI;
    const { x, y } = location;

    // Convertir les coordonnées Fortnite en pixels pour l'image
    const mapWidth = 2048; // Largeur de l'image
    const mapHeight = 2048; // Hauteur de l'image
    const mapX = Math.round((x + 175000) / 350000 * mapWidth);
    const mapY = Math.round((175000 - y) / 350000 * mapHeight);

    // Charger l'image et dessiner le pin
    const canvas = createCanvas(mapWidth, mapHeight);
    const ctx = canvas.getContext('2d');
    const mapImage = await loadImage(mapData.images.blank);
    const pinImage = await loadImage('../assets/pin/pin.png'); // Exemple d'un pin rouge

    ctx.drawImage(mapImage, 0, 0, mapWidth, mapHeight);
    ctx.drawImage(pinImage, mapX - 15, mapY - 30, 30, 30); // Ajuster le positionnement du pin

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
    console.error(error);
    interaction.reply({ content: 'Une erreur est survenue en récupérant les données de la carte.', ephemeral: true });
  }
};
