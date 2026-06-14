import { REST, Routes } from 'discord.js';
import { config } from './config.js';

const commands = [
  {
    name: 'askbot',
    description: 'ส่งข้อความไปยัง n8n เพื่อให้ AI ตอบกลับ',
    options: [
      {
        name: 'prompt',
        description: 'ข้อความที่ต้องการถาม',
        type: 3, // STRING
        required: true,
      }
    ]
  },
  {
    name: 'help',
    description: 'แสดงคำสั่งทั้งหมด'
  },
  {
    name: 'roll',
    description: 'สุ่มตัวเลข 1-10',
  },
  {
    name: 'play',
    description: 'เล่นเพลง',
    options: [
      {
        name: 'query', // เปลี่ยนให้จำง่าย
        description: 'ชื่อเพลงหรือลิงก์ YouTube',
        type: 3, 
        required: true,
      }
    ]
  },
  {
        name: 'skip',
        description: 'ข้ามเพลงที่กำลังเล่นอยู่',
  },
  {
    name: 'queue',
    description: 'แสดงคิวเพลงปัจจุบัน',
  },
];

const rest = new REST({ version: '10' }).setToken(config.discordToken);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(config.applicationId),
      { body: commands }
    );
    console.log('Slash commands registered!');
  } catch (error) {
    console.error(error);
  }
})();
