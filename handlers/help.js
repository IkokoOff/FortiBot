const Discord = require("discord.js");

module.exports.run = async (client, interaction) => {
  try {
    // List of commands to display
    const commandsList = [
      { name: '/news', description: 'Displays the latest news.' },
      { name: '/shop', description: 'Displays the available items in the shop.' },
      { name: '/map', description: 'Displays the current Fortnite map.' },
      { name: '/stats', description: 'Shows your statistics.' },
      { name: '/invite', description: 'Provides a link to invite the bot.' },
      { name: '/ping', description: 'Displays the current latency.' },
    ];

    // Number of commands per page
    const commandsPerPage = 10;

    // Calculate the total number of pages
    const totalPages = Math.ceil(commandsList.length / commandsPerPage);

    // Function to create the embed for a specific page
    const generateEmbed = (page) => {
      const start = page * commandsPerPage;
      const end = start + commandsPerPage;
      const currentCommands = commandsList.slice(start, end);

      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Available Commands")
        .setDescription("Here are the commands you can use:")
        .setFooter(`Page ${page + 1} of ${totalPages}`, client.user.displayAvatarURL());

      currentCommands.forEach(command => {
        embed.addField(command.name, command.description, false);
      });

      return embed;
    };

    // Initial page
    let currentPage = 0;

    // Create the buttons
    const buttons = () => new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageButton()
          .setCustomId('previous')
          .setLabel('⬅️ Previous')
          .setStyle('PRIMARY')
          .setDisabled(currentPage === 0),
        new Discord.MessageButton()
          .setCustomId('next')
          .setLabel('➡️ Next')
          .setStyle('PRIMARY')
          .setDisabled(currentPage === totalPages - 1),
        new Discord.MessageButton()
          .setCustomId('close')
          .setLabel('❌ Close')
          .setStyle('DANGER')
      );

    // Send the initial embed (visible to everyone)
    const message = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: [buttons()],
      fetchReply: true
    });

    // Create a collector for button interactions with a 2-minute duration
    const collector = message.createMessageComponentCollector({
      componentType: 'BUTTON',
      time: 120000 // 2 minutes
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "You cannot use these buttons.", ephemeral: true });
      }

      if (i.customId === 'previous' && currentPage > 0) {
        currentPage--;
      } else if (i.customId === 'next' && currentPage < totalPages - 1) {
        currentPage++;
      } else if (i.customId === 'close') {
        // Delete the message if the "Close" button is pressed
        await message.delete().catch(console.error);
        collector.stop(); // Stop the collector after closing
        return;
      }

      // Update the embed and buttons
      await i.update({
        embeds: [generateEmbed(currentPage)],
        components: [buttons()]
      });
    });

    collector.on('end', async () => {
      // Disable buttons after the collector ends
      await message.edit({
        components: [
          new Discord.MessageActionRow()
            .addComponents(
              new Discord.MessageButton()
                .setCustomId('previous')
                .setLabel('⬅️ Previous')
                .setStyle('PRIMARY')
                .setDisabled(true),
              new Discord.MessageButton()
                .setCustomId('next')
                .setLabel('➡️ Next')
                .setStyle('PRIMARY')
                .setDisabled(true),
              new Discord.MessageButton()
                .setCustomId('close')
                .setLabel('❌ Close')
                .setStyle('DANGER')
                .setDisabled(true)
            )
        ]
      });

      // Automatically delete the message 2 seconds after disabling the buttons
      setTimeout(() => {
        message.delete().catch(console.error);
      }, 2000);
    });
  } catch (error) {
    console.error("Error in help command:", error.message);
    interaction.reply({
      content: "An error occurred! Please try again later.",
      ephemeral: true
    });
  }
};
