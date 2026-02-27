import { Bot } from './bot.js';

const bot = new Bot();

bot.init().catch((err) => {
  console.error('Fatal: failed to initialise bot:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  bot.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  bot.stop();
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  bot.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  bot.stop();
  process.exit(1);
});
