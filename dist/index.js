"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("./bot");
const bot = new bot_1.RinBot();
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    bot.stop();
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    bot.stop();
    process.exit(0);
});
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    bot.stop();
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    bot.stop();
    process.exit(1);
});
bot.start();
//# sourceMappingURL=index.js.map