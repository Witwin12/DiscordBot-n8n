import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['DISCORD_TOKEN', 'N8N_WEBHOOK'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  discordToken: process.env.DISCORD_TOKEN,
  n8nWebhook: process.env.N8N_WEBHOOK,
  applicationId: process.env.APPLICATION_ID,
};
