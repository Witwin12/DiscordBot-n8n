import { Client, GatewayIntentBits } from 'discord.js';
import { config } from './config.js';
import { commandHandlers } from './commands.js';
import { setupPlayer } from './music.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let player;

client.once('ready', async () => {
  try {
    player = await setupPlayer(client);
    console.log(`✅ Bot logged in as ${client.user.tag}`);
  } catch (error) {
    console.error('❌ Failed to setup player:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const handler = commandHandlers[interaction.commandName];
  if (!handler) {
    return interaction.reply('คำสั่งนี้ยังไม่รองรับครับ');
  }

  try {
    // Inject dependencies into the handler
    await handler(interaction, { player, n8nWebhook: config.n8nWebhook });
  } catch (error) {
    console.error(`❌ command handler error (${interaction.commandName}):`, error);
    const errorMessage = `เกิดข้อผิดพลาดภายใน: ${error.message}`;
    
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(errorMessage);
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

client.login(config.discordToken);
