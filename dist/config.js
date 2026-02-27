"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.validateConfig = validateConfig;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openrouterModel: process.env.OPENROUTER_MODEL || 'stepfun/step-3.5-flash:free',
};
function validateConfig() {
    if (!exports.config.telegramBotToken) {
        throw new Error('TELEGRAM_BOT_TOKEN is required');
    }
    if (!exports.config.openrouterApiKey) {
        throw new Error('OPENROUTER_API_KEY is required');
    }
    if (!exports.config.openrouterModel) {
        throw new Error('OPENROUTER_MODEL is required');
    }
}
//# sourceMappingURL=config.js.map