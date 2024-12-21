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

    // Envoi initial de l'embed
    const message = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: [generateButtons(currentPage)],
      fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
      componentType: 'BUTTON',
      time: 120000
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
        await i.message.delete().catch(console.error);
        collector.stop();
        return;
      }

      await i.update({
        embeds: [generateEmbed(currentPage)],
        components: [generateButtons(currentPage)]
      });
    });

    collector.on('end', async () => {
      try {
        const fetchedMessage = await interaction.channel.messages.fetch(message.id);
        if (fetchedMessage) {
          await fetchedMessage.edit({
            components: [
              new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setCustomId('previous')
                    .setLabel('⬅️ Previous')
                    .setStyle('PRIMARY')
                    .setDisabled(true),
                  new MessageButton()
                    .setCustomId('next')
                    .setLabel('➡️ Next')
                    .setStyle('PRIMARY')
                    .setDisabled(true),
                  new MessageButton()
                    .setCustomId('close')
                    .setLabel('<:denystatic:1320033866328838155> Close')
                    .setStyle('DANGER')
                    .setDisabled(true)
                )
            ]
          });
          setTimeout(() => {
            fetchedMessage.delete().catch(console.error);
          }, 2000);
        }
      } catch (error) {
        console.error("Error fetching or deleting the message:", error.message);
      }
    });

  } catch (error) {
    console.error("Error in help command:", error.message);
    interaction.reply({
      content: "An error occurred! Please try again later.",
      ephemeral: true
    });
  }
};
