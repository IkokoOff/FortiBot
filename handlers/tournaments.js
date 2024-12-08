const { Client, MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const axios = require("axios");

module.exports.run = async (client, interaction) => {
  try {
    await interaction.deferReply();

    const region = interaction.options.getString("region");

    const req = await axios.get("https://fortniteapi.io/v1/events/list", {
      params: { lang: "en", region: region },
      headers: { Authorization: process.env.FNAPIIO },
    });

    if (req.status === 200) {
      const events = req.data.events;

      if (events.length) {
        const upcomingEvents = events.filter(event => new Date(event.endTime) > new Date());

        if (upcomingEvents.length) {
          const chunkedEvents = [];
          for (let i = 0; i < upcomingEvents.length; i += 10) {
            chunkedEvents.push(upcomingEvents.slice(i, i + 10));
          }

          let currentPage = 0;

          const generateEmbed = (page) => {
            const eventsOnPage = chunkedEvents[page];
            const embed = new MessageEmbed()
              .setColor("RANDOM")
              .setTitle(`Upcoming Events for ${region}`)
              .setDescription(`Page ${page + 1} of ${chunkedEvents.length}`)
              .setFooter({ text: `Use the buttons to navigate or close.` });

            eventsOnPage.forEach(event => {
              const beginTimestamp = Math.floor(new Date(event.beginTime).getTime() / 1000);
              const endTimestamp = Math.floor(new Date(event.endTime).getTime() / 1000);

              const scheduleText = event.schedule && event.schedule.trim() !== "" ? event.schedule : "N/A";
              const description = event.short_description || "No description available";

              embed.addField(
                `${event.name_line1} - ${event.name_line2} (${scheduleText})`,
                `Start: <t:${beginTimestamp}> (<t:${beginTimestamp}:R>)\nEnd: <t:${endTimestamp}> (<t:${endTimestamp}:R>)\nDescription: ${description}`,
                false
              );
            });

            return embed;
          };

          const row = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setCustomId('previous')
                .setLabel('⬅️ Previous') // Ajout d'une flèche
                .setStyle('PRIMARY')
                .setDisabled(currentPage === 0),
              new MessageButton()
                .setCustomId('next')
                .setLabel('Next ➡️') // Ajout d'une flèche
                .setStyle('PRIMARY')
                .setDisabled(currentPage === chunkedEvents.length - 1),
              new MessageButton()
                .setCustomId('close')
                .setLabel('❌ Close') // Ajout d'une croix
                .setStyle('DANGER')
            );

          const message = await interaction.editReply({
            embeds: [generateEmbed(currentPage)],
            components: [row],
          });

          const filter = (i) => i.user.id === interaction.user.id;
          const collector = message.createMessageComponentCollector({ filter, time: 120000 });

          collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId === 'next') {
              currentPage++;
            } else if (buttonInteraction.customId === 'previous') {
              currentPage--;
            } else if (buttonInteraction.customId === 'close') {
              await buttonInteraction.update({
                content: "Message closed by the user.",
                embeds: [],
                components: [],
              });
              collector.stop("closed");
              return;
            }

            const newEmbed = generateEmbed(currentPage);
            const newRow = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setCustomId('previous')
                  .setLabel('⬅️ Previous')
                  .setStyle('PRIMARY')
                  .setDisabled(currentPage === 0),
                new MessageButton()
                  .setCustomId('next')
                  .setLabel('Next ➡️')
                  .setStyle('PRIMARY')
                  .setDisabled(currentPage === chunkedEvents.length - 1),
                new MessageButton()
                  .setCustomId('close')
                  .setLabel('✕ Close')
                  .setStyle('DANGER')
              );

            await buttonInteraction.update({
              embeds: [newEmbed],
              components: [newRow],
            });
          });

          collector.on('end', (collected, reason) => {
            if (reason !== "closed") {
              message.delete().catch(console.error);
            }
          });

        } else {
          await interaction.editReply({
            embeds: [
              new MessageEmbed().setTitle("No upcoming events").setColor("RED").setDescription("There are no upcoming events for this region."),
            ],
          });
        }
      } else {
        await interaction.editReply({
          embeds: [
            new MessageEmbed().setTitle("No events found").setColor("RED").setDescription("There are no events available for this region."),
          ],
        });
      }
    } else {
      throw new Error("Non-200 status code from Fortnite API");
    }
  } catch (error) {
    console.error(error);
    await interaction.editReply({
      embeds: [
        new MessageEmbed().setColor("RED").setTitle("API ERROR. Please try later :)"),
      ],
    });
  }
};
