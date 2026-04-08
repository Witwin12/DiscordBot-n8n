import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const N8N_WEBHOOK = process.env.N8N_WEBHOOK;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('clientReady', () => {
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
});

client.login(DISCORD_TOKEN);