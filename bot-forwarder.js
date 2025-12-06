import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const N8N_WEBHOOK = process.env.N8N_WEBHOOK; 
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.on('ready', () => {
  console.log('Bot ready as', client.user.tag);
});

client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  const prefix = '!askbot ';
  if (!message.content.startsWith(prefix)) return;

  const prompt = message.content.slice(prefix.length);

  const guildId = message.guild ? message.guild.id : 'DM';

  const payload = {
    userId: message.author.id,
    username: message.author.username,
    channelId: message.channel.id,
    prompt,
    rawMessage: message.content,
    serverId: guildId,
  };

  try {
    await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('Forwarded prompt to n8n:', prompt);
  } catch (err) {
    console.error('Failed to forward to n8n', err);
  }
});

client.login(DISCORD_TOKEN);
