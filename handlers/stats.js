const Discord = require("discord.js");
const axios = require("axios").default;
const chalk = require("chalk");
const fs = require("fs");

module.exports.run = async (client, interaction) => {
  await interaction.deferReply();
  let player = await interaction.options.getString('player');
  
  try {
    // Fetch account info
    let req = await axios.get("https://fortniteapi.io/v1/lookup", {
      params: {
        username: player
      },
      headers: {
        Authorization: process.env.FNAPIIO
      }
    });
    
    if (!req || !req.data || !req.data.result) {
      return interaction.editReply({ content: "An error occurred. Please try again later." });
    }

    let cache = req.data;
    let accountId = cache.account_id;

    // Fetch stats using account_id
    let statsReq = await axios.get("https://fortniteapi.io/v1/stats", {
      params: {
        account: accountId
      },
      headers: {
        Authorization: process.env.FNAPIIO
      }
    });
    
    if (!statsReq || !statsReq.data || !statsReq.data.global_stats) {
      return interaction.editReply({ content: "Your profile is private. Please set it to public in the settings." });
    }

    let global = statsReq.data.global_stats;

    // Check if squad, duo, and solo stats are available
    if (!global.squad || !global.duo || !global.solo) {
      return interaction.editReply({ content: "Stats not available for some modes." });
    }

    // Calculate average K.D. and victories
    let averageKD = Math.round((global.squad.kd + global.duo.kd + global.solo.kd) / 3);
    let victories = (global.squad.placetop1 + global.duo.placetop1 + global.solo.placetop1).toString();
    let totalKills = (global.squad.kills + global.duo.kills + global.solo.kills).toString();

    // Create embed with player stats
    let embed = new Discord.MessageEmbed()
      .setTitle(`Stats for ${statsReq.data.name}`)
      .setColor("RANDOM")
      .addField("Battlepass Level", statsReq.data.account.level.toString(), true)
      .addField("Victories", victories, true)
      .addField("Average K.D", averageKD.toString(), true)
      .addField("Total Kills", totalKills, true);

    interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('Error fetching Fortnite stats:', error);
    interaction.editReply({ content: "An error occurred. Please try again later." });
  }
}
