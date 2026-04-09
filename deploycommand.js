import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

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
  
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.APPLICATION_ID),
      { body: commands }
    );
    console.log('Slash commands registered!');
  } catch (error) {
    console.error(error);
  }
})();
