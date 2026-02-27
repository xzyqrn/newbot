import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  /** Required for Telegram mode. Not needed for CLI mode. */
  telegramBotToken: string;
}

export const config: Config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
};

export function validateConfig(): void {
  if (!config.telegramBotToken && !process.env.CLI_MODE) {
    throw new Error(
      'TELEGRAM_BOT_TOKEN is required to run in Telegram mode.\n' +
      'To chat locally, run: npm run chat'
    );
  }
}
