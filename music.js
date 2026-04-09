import { Player } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
import { YoutubeiExtractor } from 'discord-player-youtubei'; 
import ffmpeg from 'ffmpeg-static';

process.env.FFMPEG_PATH = ffmpeg;

export async function setupPlayer(client) {
    const player = new Player(client, {
        skipFFmpeg: false,
    });

    // โหลดตัวมาตรฐานทั้งหมด (รวม SoundCloud, Spotify)
    await player.extractors.loadMulti(DefaultExtractors);
    
    // ลงทะเบียน YouTube (ใช้สำหรับดึงข้อมูลเพลง/ปก)
    await player.extractors.register(YoutubeiExtractor, {
        streamOptions: {
            useClient: 'IOS'
        }
    });
    
    console.log('✅ ระบบเสียงพร้อมทำงาน! (YouTube/Spotify/SoundCloud)');

    player.events.on('playerStart', (queue, track) => {
        if (queue.metadata) queue.metadata.send(`▶️ **${track.title}** ลุยเลยจ้า!`);
    });

    player.events.on('playerError', (queue, error) => {
        console.error(`❌ [Player Error]: ${error.message}`);
    });
    
    player.on('debug', (m) => {
        if (m.includes('bridge') || m.includes('stream')) {
            console.log(`🔍 [STREAM-DEBUG]: ${m}`);
        }
    });

    return player;
}