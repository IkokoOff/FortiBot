const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports.run = async (client, interaction) => {
  try {
    const supportServerURL = "https://discord.gg/zZStXYa8Pu";
    const developerName = "Ikoko";
    const inviteURL = "https://discord.com/oauth2/authorize?client_id=1311574867992248340&permissions=8&integration_type=0&scope=bot+applications.commands";

    const commandsList = [
      { name: '/news', description: 'Displays the latest news.' },
      { name: '/shop', description: 'Displays the available items in the shop.' },
      { name: '/map', description: 'Displays the current Fortnite map.' },
      { name: '/stats', description: 'Shows your statistics.' },
      { name: '/invite', description: 'Provides a link to invite the bot.' },
      { name: '/ping', description: 'Displays the current latency.' },
    ];

    const commandsPerPage = 10;
    const totalPages = Math.ceil(commandsList.length / commandsPerPage);
    let currentPage = 0;

    const generateEmbed = (page) => {
      const start = page * commandsPerPage;
      const end = start + commandsPerPage;
      const currentCommands = commandsList.slice(start, end);

      const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Available Commands")
        .setDescription(
          `📞 **Support Server**: [Join here](${supportServerURL})\n` +
          `👨‍💻 **Developer**: ${developerName}\n` +
          `🤖 **Invite the Bot**: [Click here](${inviteURL})\n\n` +
          `There are **${commandsList.length} commands** available. Here are the commands you can use:`
        )
        .setFooter(`Page ${page + 1} of ${totalPages}`, client.user.displayAvatarURL());

      currentCommands.forEach(command => {
        embed.addField(command.name, command.description, false);
      });

      return embed;
    };

    const generateButtons = (page) => new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('previous')
          .setLabel('⬅️ Previous')
          .setStyle('PRIMARY')
          .setDisabled(page === 0),
        new MessageButton()
          .setCustomId('next')
          .setLabel('➡️ Next')
          .setStyle('PRIMARY')
          .setDisabled(page === totalPages - 1),
        new MessageButton()
          .setCustomId('close')
          .setLabel('<:denystatic:1320033866328838155> Close')
          .setStyle('DANGER')
      );

    // Send the initial embed
    const message = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: [generateButtons(currentPage)],
      fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
      componentType: 'BUTTON',
      time: 120000 // 2 minutes timeout
    });

    collector.on('collect', async (btnInteraction) => {
      // Ensure only the user who initiated the interaction can interact
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({ content: "You cannot use these buttons.", ephemeral: true });
      }

      if (btnInteraction.customId === 'previous') {
        currentPage = Math.max(currentPage - 1, 0);
      } else if (btnInteraction.customId === 'next') {
        currentPage = Math.min(currentPage + 1, totalPages - 1);
      } else if (btnInteraction.customId === 'close') {
        // Stop the collector and modify the message
        collector.stop();
        return btnInteraction.update({
          content: "Interaction closed by the user.",
          embeds: [],
          components: []
        });
      }

      // Update the buttons and embed
      const row = generateButtons(currentPage);
      await btnInteraction.update({
        embeds: [generateEmbed(currentPage)],
        components: [row]
      });
    });

    collector.on('end', async () => {
      // Disable buttons after timeout
      const row = generateButtons(currentPage);
      row.components.forEach((button) => button.setDisabled(true));

      await message.edit({ components: [row] }).catch(console.error);
    });

  } catch (error) {
    console.error("Error in help command:", error.message);

    // Send error embed
    const errorEmbed = new MessageEmbed()
      .setColor('RED')
      .setTitle('<a:denyanimated:1318915250627678269> An Error Occurred')
      .setDescription('There was an error while processing your request. Please try again later.')
      .addField('Error Message:', error.message)
      .setFooter('If the issue persists, please contact support.');

    interaction.reply({
      embeds: [errorEmbed],
      ephemeral: true
    });
  }
};
