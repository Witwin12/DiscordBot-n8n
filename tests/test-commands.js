import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { handleHelp, handleRoll, handleAskbot, handleQueue, handleSkip } from '../commands.js';

// Mock interaction object
const createMockInteraction = (options = {}) => {
  const interaction = {
    replied: false,
    deferred: false,
    replyData: null,
    editReplyData: null,
    options: {
      getString: (name) => options.options?.[name] || null,
    },
    user: { id: '123', username: 'testuser' },
    channelId: '456',
    guild: { id: '789' },
    member: {
      voice: {
        channel: options.voiceChannel || null,
      },
      voiceChannelId: options.voiceChannelId || null,
    },
    guildId: '789',
    reply: async (content) => {
      interaction.replied = true;
      interaction.replyData = content;
      return content;
    },
    deferReply: async () => {
      interaction.deferred = true;
    },
    editReply: async (content) => {
      interaction.editReplyData = content;
      return content;
    },
  };
  return interaction;
};

describe('Command Handlers', () => {
  test('handleHelp returns help message', async () => {
    const interaction = createMockInteraction();
    await handleHelp(interaction);
    assert.strictEqual(interaction.replied, true);
    assert.match(interaction.replyData, /คำสั่งทั้งหมด/);
  });

  test('handleRoll returns a number between 1 and 10', async () => {
    const interaction = createMockInteraction();
    await handleRoll(interaction);
    assert.strictEqual(interaction.replied, true);
    const result = parseInt(interaction.replyData);
    assert.ok(result >= 1 && result <= 10);
  });

  test('handleAskbot sends payload to webhook', async () => {
    const interaction = createMockInteraction({
      options: { prompt: 'hello n8n' }
    });
    
    // Mock global fetch
    const originalFetch = global.fetch;
    let fetchCalled = false;
    global.fetch = async (url, options) => {
      fetchCalled = true;
      assert.strictEqual(url, 'http://mock-webhook');
      const body = JSON.parse(options.body);
      assert.strictEqual(body.prompt, 'hello n8n');
      return { ok: true };
    };

    await handleAskbot(interaction, { n8nWebhook: 'http://mock-webhook' });
    
    assert.strictEqual(interaction.deferred, true);
    assert.match(interaction.editReplyData, /ส่งข้อมูลไปที่ n8n เรียบร้อยแล้ว/);
    assert.strictEqual(fetchCalled, true);

    global.fetch = originalFetch;
  });

  test('handleAskbot handles missing prompt', async () => {
    const interaction = createMockInteraction({
      options: { prompt: '' }
    });
    await handleAskbot(interaction, { n8nWebhook: 'http://mock-webhook' });
    assert.match(interaction.editReplyData, /โปรดระบุข้อความ/);
  });

  test('handleQueue handles empty queue', async () => {
    const interaction = createMockInteraction();
    const mockPlayer = {
      nodes: {
        get: () => null
      }
    };
    await handleQueue(interaction, { player: mockPlayer });
    assert.match(interaction.editReplyData, /ไม่มีเพลงในคิว/);
  });

  test('handleSkip handles no playing track', async () => {
    const interaction = createMockInteraction();
    const mockPlayer = {
      nodes: {
        get: () => ({
          isPlaying: () => false
        })
      }
    };
    await handleSkip(interaction, { player: mockPlayer });
    assert.match(interaction.editReplyData, /ไม่มีเพลงกำลังเล่นอยู่/);
  });
});
