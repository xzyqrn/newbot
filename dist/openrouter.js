"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
class OpenRouterClient {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: 'https://openrouter.ai/api/v1',
            headers: {
                'Authorization': `Bearer ${config_1.config.openrouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://github.com/rin-telegram-bot',
                'X-Title': 'Rin Telegram Bot',
            },
            timeout: 30000,
        });
    }
    async chat(messages) {
        try {
            const response = await this.client.post('/chat/completions', {
                model: config_1.config.openrouterModel,
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000,
            });
            const choice = response.data.choices[0];
            if (!choice) {
                throw new Error('No response from OpenRouter API');
            }
            return choice.message.content;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const errorMessage = error.response?.data?.error?.message || error.message;
                throw new Error(`OpenRouter API error: ${errorMessage}`);
            }
            throw error;
        }
    }
    async simpleChat(userMessage) {
        const messages = [
            {
                role: 'system',
                content: 'You are Rin, a helpful and friendly AI assistant. Respond in a natural, conversational manner.',
            },
            {
                role: 'user',
                content: userMessage,
            },
        ];
        return this.chat(messages);
    }
}
exports.OpenRouterClient = OpenRouterClient;
//# sourceMappingURL=openrouter.js.map