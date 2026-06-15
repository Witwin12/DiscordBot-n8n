import { test, describe } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';

describe('Config', () => {
  test('throws error when DISCORD_TOKEN is missing', () => {
    try {
      execSync('node -e "import(\'./config.js\')" --env-file=.env.example', {
        env: { ...process.env, DISCORD_TOKEN: '' },
        stdio: 'pipe'
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.ok(error.stderr.toString().includes('Missing required environment variable: DISCORD_TOKEN'));
    }
  });

  test('successfully loads config when variables are present', () => {
    const code = `
      process.env.DISCORD_TOKEN = 'test-token';
      process.env.N8N_WEBHOOK = 'http://test-webhook';
      import(\'../config.js\').then(({ config }) => {
        if (config.discordToken === 'test-token') {
          process.exit(0);
        } else {
          process.exit(1);
        }
      });
    `;
    assert.doesNotThrow(() => {
      execSync(`node --input-type=module -e "${code}"`);
    });
  });
});
