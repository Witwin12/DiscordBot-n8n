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
        GatewayIntentBits.MessageContent
    ]
});
// ประกาศตัวแปร player ไว้รอรับค่า
let player;

client.once('clientReady', async() => {
  player = await setupPlayer(client);
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'help') {
    return interaction.reply(
      "📌 **คำสั่งทั้งหมด**\n" +
      "• `/askbot <prompt>` – ส่งข้อความไป n8n\n" +
      "• `/help` – แสดงรายการคำสั่ง\n" +
      "• `/roll` – สุ่มตัวเลข 1-10\n"
    );
  }

if (interaction.commandName === 'askbot') {
    await interaction.deferReply();
    const prompt = interaction.options.getString('prompt');

    const payload = {
      userId: interaction.user.id,
      username: interaction.user.username,
      channelId: interaction.channel.id,
      prompt,
      rawMessage: prompt,
      serverId: interaction.guild ? interaction.guild.id : 'DM',
    };

    try {
      await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      await interaction.editReply(`ส่งข้อมูลไปที่ n8n เรียบร้อยแล้ว: "${prompt}"`);

    } catch (err) {
      console.error(err);
      await interaction.editReply(" เกิดข้อผิดพลาดในการเชื่อมต่อกับ n8n");
    }
  }

  if (interaction.commandName === 'roll') {
    const random_output = Math.floor(Math.random() * 10) + 1;
    return interaction.reply(random_output.toString());
  }

if (interaction.commandName === 'play') {
    await interaction.deferReply();
    const query = interaction.options.getString('query');
    const channel = interaction.member?.voice.channel;

    if (!channel) return interaction.editReply('เข้าห้องเสียงก่อนเร็ว!');

    try {
        // 1. เช็กว่าเป็นลิงก์หรือไม่
        const isUrl = query.startsWith('http');
        
        // 2. กำหนด Search Engine
        // ถ้าเป็นลิงก์ (Spotify/YouTube/ฯลฯ) ให้ใช้ 'auto' เพื่อให้มันเลือก Extractor ตามลิงก์เอง
        // ถ้าไม่ใช่ลิงก์ (พิมพ์ชื่อเพลง) ให้ใช้ 'soundcloudSearch' เพื่อหนีการโดน YouTube บล็อก
        const searchEngine = isUrl ? 'auto' : 'soundcloudSearch';

        const { track } = await player.play(channel, query, {
            nodeOptions: {
                metadata: interaction.channel,
                bufferingTimeout: 15000,
                leaveOnEmpty: true,
                leaveOnEnd: true,
            },
            searchEngine: searchEngine
        });

        return interaction.editReply(`🎶 เพิ่มเพลง **${track.title}** เข้าคิวแล้ว!`);

    } catch (e) {
        console.error(e);
        // ถ้าเล่นไม่ได้ และเป็นลิงก์ YouTube ให้เดาว่าโดนบล็อก
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            return interaction.editReply('❌ YouTube บล็อกการดึงเสียงครับ แนะนำให้พิมพ์แค่ **ชื่อเพลง** แทนการแปะลิงก์นะครับ');
        }
        return interaction.editReply(`❌ เล่นไม่ได้จ้า: ${e.message}`);
    }
}
});

client.login(DISCORD_TOKEN);