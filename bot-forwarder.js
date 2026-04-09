import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { setupPlayer } from './music.js';

dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const N8N_WEBHOOK = process.env.N8N_WEBHOOK;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let player;

function ensureEnvVariable(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

function getAskbotPayload(interaction, prompt) {
  return {
    userId: interaction.user.id,
    username: interaction.user.username,
    channelId: interaction.channelId,
    prompt,
    rawMessage: prompt,
    serverId: interaction.guild?.id ?? 'DM',
  };
}

async function replyHelp(interaction) {
  return interaction.reply(
    '📌 **คำสั่งทั้งหมด**\n' +
    '• `/askbot <prompt>` – ส่งข้อความไป n8n\n' +
    '• `/help` – แสดงรายการคำสั่ง\n' +
    '• `/roll` – สุ่มตัวเลข 1-10\n' +
    '• `/play <query>` – เล่นเพลงจากห้องเสียง\n'
  );
}

async function handleAskbot(interaction) {
  await interaction.deferReply();

  const prompt = interaction.options.getString('prompt');
  if (!prompt?.trim()) {
    return interaction.editReply('โปรดระบุข้อความสำหรับส่งไป n8n ด้วยครับ');
  }

  const payload = getAskbotPayload(interaction, prompt);

  try {
    await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return interaction.editReply(`ส่งข้อมูลไปที่ n8n เรียบร้อยแล้ว: "${prompt}"`);
  } catch (error) {
    console.error('askbot error:', error);
    return interaction.editReply('❌ เกิดข้อผิดพลาดในการเชื่อมต่อกับ n8n');
  }
}

async function handleRoll(interaction) {
  const result = Math.floor(Math.random() * 10) + 1;
  return interaction.reply(result.toString());
}

async function handlePlay(interaction) {
  await interaction.deferReply();

  const query = interaction.options.getString('query');
  const voiceChannel = interaction.member?.voice.channel;

  if (!query?.trim()) {
    return interaction.editReply('โปรดระบุชื่อเพลงหรือ URL ที่ต้องการเล่น');
  }

  if (!voiceChannel) {
    return interaction.editReply('เข้าห้องเสียงก่อนเร็ว!');
  }

  const isUrl = query.startsWith('http');
  const searchEngine = isUrl ? 'auto' : 'soundcloudSearch';

  try {
    const { track } = await player.play(voiceChannel, query, {
      nodeOptions: {
        metadata: interaction.channel,
        bufferingTimeout: 15000,
        leaveOnEmpty: true,
        leaveOnEnd: true,
      },
      searchEngine,
    });

    return interaction.editReply(`🎶 เพิ่มเพลง **${track.title}** เข้าคิวแล้ว!`);
  } catch (error) {
    console.error('play error:', error);

    if (query.includes('youtube.com') || query.includes('youtu.be')) {
      return interaction.editReply('❌ YouTube บล็อกการดึงเสียงครับ แนะนำให้พิมพ์แค่ **ชื่อเพลง** แทนการแปะลิงก์นะครับ');
    }

    return interaction.editReply(`❌ เล่นไม่ได้จ้า: ${error.message}`);
  }
}

const commandHandlers = {
  help: replyHelp,
  askbot: handleAskbot,
  roll: handleRoll,
  play: handlePlay,
};

client.once('ready', async () => {
  player = await setupPlayer(client);
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const handler = commandHandlers[interaction.commandName];
  if (!handler) {
    return interaction.reply('คำสั่งนี้ยังไม่รองรับครับ');
  }

  try {
    await handler(interaction);
  } catch (error) {
    console.error('command handler error:', error);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply('เกิดข้อผิดพลาดภายใน กรุณาลองอีกครั้ง');
    } else {
      await interaction.reply('เกิดข้อผิดพลาดภายใน กรุณาลองอีกครั้ง');
    }
  }
});

ensureEnvVariable('DISCORD_TOKEN', DISCORD_TOKEN);
ensureEnvVariable('N8N_WEBHOOK', N8N_WEBHOOK);

client.login(DISCORD_TOKEN);
