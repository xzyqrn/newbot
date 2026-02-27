import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  telegramBotToken: string;
  openrouterApiKey: string;
  openrouterModel: string;
  llmBaseUrl: string;
}

export const config: Config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openrouterModel: process.env.OPENROUTER_MODEL || 'stepfun/step-3.5-flash:free',
  llmBaseUrl: process.env.LLM_BASE_URL || 'https://openrouter.ai/api/v1',
};

export function validateConfig(): void {
  if (!config.telegramBotToken && !process.env.CLI_MODE) {
    throw new Error('TELEGRAM_BOT_TOKEN is required for Telegram Mode');
  }
  if (!config.openrouterApiKey && config.llmBaseUrl.includes('openrouter.ai')) {
    throw new Error('OPENROUTER_API_KEY is required for OpenRouter');
  }
  if (!config.openrouterModel) {
    throw new Error('OPENROUTER_MODEL is required');
  }
}
