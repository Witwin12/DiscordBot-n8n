import { Player } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
import ffmpegStatic from 'ffmpeg-static';

const DEFAULT_FFMPEG_PATH = ffmpegStatic;

function configureFfmpeg() {
  if (!process.env.FFMPEG_PATH) {
    process.env.FFMPEG_PATH = DEFAULT_FFMPEG_PATH;
  }
}

function onPlayerStart(queue, track) {
  if (queue.metadata) {
    queue.metadata.send(`▶️ **${track.title}** ลุยเลยจ้า!`);
  }
}

function onPlayerError(_queue, error) {
  console.error(`❌ [Player Error]: ${error.message}`);
}

function onDebug(message) {
  if (message.includes('bridge') || message.includes('stream')) {
    console.log(`🔍 [STREAM-DEBUG]: ${message}`);
  }
}

function registerPlayerEvents(player) {
  player.events.on('playerStart', onPlayerStart);
  player.events.on('playerError', onPlayerError);
  player.on('debug', onDebug);
}

export async function setupPlayer(client) {
  configureFfmpeg();

  const player = new Player(client);
  await player.extractors.loadMulti(DefaultExtractors);

  registerPlayerEvents(player);

  return player;
}
