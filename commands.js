export const handleHelp = async (interaction) => {
  return interaction.reply(
    '📌 **คำสั่งทั้งหมด**\n' +
    '• `/askbot <prompt>` – ส่งข้อความไป n8n\n' +
    '• `/help` – แสดงรายการคำสั่ง\n' +
    '• `/roll` – สุ่มตัวเลข 1-10\n' +
    '• `/play <query>` – เล่นเพลงจากห้องเสียง\n' +
    '• `/skip` – ข้ามเพลงที่กำลังเล่นอยู่\n' +
    '• `/queue` – แสดงคิวเพลงปัจจุบัน\n'
  );
};

export const handleAskbot = async (interaction, { n8nWebhook }) => {
  await interaction.deferReply();

  const prompt = interaction.options.getString('prompt');
  if (!prompt?.trim()) {
    return interaction.editReply('โปรดระบุข้อความสำหรับส่งไป n8n ด้วยครับ');
  }

  const payload = {
    userId: interaction.user.id,
    username: interaction.user.username,
    channelId: interaction.channelId,
    prompt,
    rawMessage: prompt,
    serverId: interaction.guild?.id ?? 'DM',
  };

  try {
    await fetch(n8nWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return interaction.editReply(`ส่งข้อมูลไปที่ n8n เรียบร้อยแล้ว: "${prompt}"`);
  } catch (error) {
    console.error('❌ askbot error:', error);
    return interaction.editReply(`❌ เกิดข้อผิดพลาดในการเชื่อมต่อกับ n8n: ${error.message}`);
  }
};

export const handleRoll = async (interaction) => {
  const result = Math.floor(Math.random() * 10) + 1;
  return interaction.reply(result.toString());
};

export const handlePlay = async (interaction, { player }) => {
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
  // Use YouTube search by default if not a URL, as we now have YouTubei support
  const searchEngine = isUrl ? 'auto' : 'youtube';

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
    console.error('❌ play error:', error);
    return interaction.editReply(`❌ เล่นไม่ได้จ้า: ${error.message}`);
  }
};

export const handleSkip = async (interaction, { player }) => {
  await interaction.deferReply();
  const queue = player.nodes.get(interaction.guildId);
  if (!queue || !queue.isPlaying()) {
    return interaction.editReply('❌ ไม่มีเพลงกำลังเล่นอยู่จ้า จะให้ข้ามอะไรเอ่ย?');
  }

  if (interaction.member.voice.channelId !== queue.channel.id) {
    return interaction.editReply('❌ ต้องอยู่ห้องเสียงเดียวกับบอทถึงจะข้ามได้นะ!');
  }

  const currentTrack = queue.currentTrack;
  queue.node.skip();

  return interaction.editReply(`⏭️ ข้ามเพลง **${currentTrack.title}** ให้แล้วจ้า!`);
};

export const handleQueue = async (interaction, { player }) => {
  try {
    await interaction.deferReply();
    const queue = player.nodes.get(interaction.guildId);

    if (!queue || (!queue.isPlaying() && queue.tracks.size === 0)) {
      return interaction.editReply('❌ ไม่มีเพลงในคิวครับ');
    }

    const currentTrack = queue.currentTrack;
    const tracks = queue.tracks.toArray();

    let message = '';
    if (currentTrack) {
      message += `🎶 **เพลงที่กำลังเล่น:**\n▶️ **${currentTrack.title}**\n\n`;
    }

    if (tracks.length === 0) {
      message += '(ไม่มีเพลงถัดไปในคิว)';
    } else {
      const queueList = tracks
        .slice(0, 10)
        .map((track, i) => `${i + 1}. **${track.title}**`)
        .join('\n');
      
      message += `📌 **คิวเพลง:**\n${queueList}`;
      if (tracks.length > 10) {
        message += `\n...และอีก ${tracks.length - 10} เพลง`;
      }
    }

    return interaction.editReply(message);
  } catch (error) {
    console.error('❌ queue error:', error);
    return interaction.editReply(`❌ เกิดข้อผิดพลาดในการดึงคิวเพลง: ${error.message}`);
  }
};

export const commandHandlers = {
  help: handleHelp,
  askbot: handleAskbot,
  roll: handleRoll,
  play: handlePlay,
  skip: handleSkip,
  queue: handleQueue,
};
