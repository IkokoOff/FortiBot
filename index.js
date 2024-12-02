require("dotenv").config();
const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");
const fs = require("fs/promises");
const cron = require("node-cron");
const keep_alive = require('./keep_alive.js');

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
});

async function runDailyScript() {
  try {
    const dailyScript = require("./shop/shop.js");
    await dailyScript();
    console.log(chalk.green("Le script quotidien a été exécuté avec succès à 2h du matin."));
  } catch (error) {
    console.error(chalk.red("Erreur lors de l'exécution du script quotidien:"), error);
  }
}

async function loadSlashCommands(client) {
  const jsondir = "slash-json";
  const cmds = await client.application.commands.fetch();
  const existingCommands = cmds.map((cmd) => cmd.name);

  for (const fileName of await fs.readdir(jsondir)) {
    const fileContent = require(`./${jsondir}/${fileName}`);
    client.commands.set(fileName.split(".")[0], fileContent);
    console.log(chalk.bold.green(`Loaded command ${fileName}`));

    if (existingCommands.includes(fileContent.name)) {
      console.log(chalk.bold.red(`Command ${fileContent.name} already exists!`));
    } else {
      try {
        const da = await client.application.commands.create(fileContent);
        console.log(chalk.green.bold(`Registered ${da.name} | ${da.id}`));
      } catch (error) {
        console.error(error);
      }
    }
  }
}

async function loadHandlers(client) {
  const cmdDir = "handlers";
  for (const fileName of await fs.readdir(cmdDir)) {
    const fileContent = require(`./${cmdDir}/${fileName}`);
    client.handlers.set(fileName.split(".")[0], fileContent);
    console.log(chalk.bold.green(`Loaded handler ${fileName}`));
  }
}

async function updateStatus() {
  const server_count = client.guilds.cache.size;
  client.user.setPresence({
    activities: [{ name: `${server_count} servers｜/help`, type: 'WATCHING' }],
    status: 'online',
  });
  console.log(chalk.blue(`Updated status: ${server_count} servers.`));
}

client.once("ready", async () => {
  console.log(chalk.bold.green(`Discord Bot ${client.user.tag} is online!`));

  client.commands = new Discord.Collection();
  client.handlers = new Discord.Collection();

  try {
    await loadSlashCommands(client);
    await loadHandlers(client);
  } catch (error) {
    console.error("Error during initialization:", error);
  }

  // Met à jour le statut dès que le bot est prêt
  await updateStatus();

  // Planifie l'exécution du script quotidien à 2h du matin tous les jours
  cron.schedule('0 2 * * *', runDailyScript, {
    timezone: "Europe/Paris",
  });
});

client.on("guildCreate", updateStatus);
client.on("guildDelete", updateStatus);

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const cmd = client.handlers.get(interaction.commandName);
    if (cmd) {
      try {
        await cmd.run(client, interaction);
        console.log(chalk.gray(`Executed command ${interaction.commandName} | ${interaction.guildId} | ${interaction.user.id}`));
      } catch (error) {
        console.error(chalk.red(`Erreur dans la commande ${interaction.commandName}:`), error);
        await interaction.reply({
          content: "Une erreur est survenue lors de l'exécution de la commande.",
          ephemeral: true,
        });
      }
    } else {
      await interaction.reply({
        content: "Commande non trouvée !",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.TOKEN);
