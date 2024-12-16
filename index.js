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

// Cooldowns Map pour suivre les utilisateurs et leurs délais
const cooldowns = new Map();

async function runDailyScript() {
  try {
    const dailyScript = require("./shop/shop.js");
    await dailyScript();
    console.log(chalk.green("Daily script has been executed"));
  } catch (error) {
    console.error(chalk.red("Error running daily script:"), error);
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
  cron.schedule('5 1 * * *', runDailyScript, {
    timezone: "Europe/Paris",
  });
});

client.on("guildCreate", updateStatus);
client.on("guildDelete", updateStatus);

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const cmd = client.handlers.get(interaction.commandName);
    if (!cmd) {
      await interaction.reply({
        content: "Commande non trouvée !",
        ephemeral: true,
      });
      return;
    }

    const userId = interaction.user.id; // ID de l'utilisateur qui a exécuté la commande
    const now = Date.now();  // Timestamp actuel
    const cooldownAmount = 3000;  // Cooldown de 3 secondes (3000 ms)

    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = ((expirationTime - now) / 1000).toFixed(1); // Temps restant en secondes
        return interaction.reply({
          content: `⏳ Please wait ${timeLeft} more second(s) before using this command again.`,
          ephemeral: true,
        });
      }
    }

    // Si le cooldown est expiré, on met à jour le timestamp et on exécute la commande
    cooldowns.set(userId, now);

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
  }
});

client.login(process.env.TOKEN);
