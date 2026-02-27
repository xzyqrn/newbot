"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RinBot = void 0;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const config_1 = require("./config");
const openrouter_1 = require("./openrouter");
const self_improvement_1 = require("./self-improvement");
const scheduler_1 = require("./scheduler");
class RinBot {
    constructor() {
        (0, config_1.validateConfig)();
        this.bot = new node_telegram_bot_api_1.default(config_1.config.telegramBotToken, { polling: true });
        this.openRouter = new openrouter_1.OpenRouterClient();
        this.selfImprovement = new self_improvement_1.SelfImprovementSystem(this.openRouter);
        this.scheduler = new scheduler_1.Scheduler(this.selfImprovement);
        this.commands = new Map();
        this.setupCommands();
        this.setupEventHandlers();
    }
    setupCommands() {
        this.commands.set('/start', {
            command: '/start',
            description: 'Start the bot and see welcome message',
            handler: this.handleStart.bind(this),
        });
        this.commands.set('/help', {
            command: '/help',
            description: 'Show available commands',
            handler: this.handleHelp.bind(this),
        });
        this.commands.set('/chat', {
            command: '/chat',
            description: 'Chat with Rin AI',
            handler: this.handleChat.bind(this),
        });
        this.commands.set('/improve', {
            command: '/improve',
            description: 'Analyze and improve my own code',
            handler: this.handleSelfImprove.bind(this),
        });
        this.commands.set('/analyze', {
            command: '/analyze',
            description: 'Analyze my codebase for improvements',
            handler: this.handleAnalyze.bind(this),
        });
        this.commands.set('/improvements', {
            command: '/improvements',
            description: 'Show improvement history',
            handler: this.handleImprovements.bind(this),
        });
        this.commands.set('/scheduler_start', {
            command: '/scheduler_start',
            description: 'Start periodic self-improvement',
            handler: this.handleSchedulerStart.bind(this),
        });
        this.commands.set('/scheduler_stop', {
            command: '/scheduler_stop',
            description: 'Stop periodic self-improvement',
            handler: this.handleSchedulerStop.bind(this),
        });
        this.commands.set('/scheduler_status', {
            command: '/scheduler_status',
            description: 'Check scheduler status',
            handler: this.handleSchedulerStatus.bind(this),
        });
    }
    setupEventHandlers() {
        this.bot.onText(/\/start/, this.handleStart.bind(this));
        this.bot.onText(/\/help/, this.handleHelp.bind(this));
        this.bot.onText(/\/chat (.+)/, this.handleChatWithMessage.bind(this));
        this.bot.onText(/\/improve/, this.handleSelfImprove.bind(this));
        this.bot.onText(/\/analyze/, this.handleAnalyze.bind(this));
        this.bot.onText(/\/improvements/, this.handleImprovements.bind(this));
        this.bot.onText(/\/scheduler_start/, this.handleSchedulerStart.bind(this));
        this.bot.onText(/\/scheduler_stop/, this.handleSchedulerStop.bind(this));
        this.bot.onText(/\/scheduler_status/, this.handleSchedulerStatus.bind(this));
        this.bot.on('message', this.handleMessage.bind(this));
        this.bot.on('polling_error', this.handlePollingError.bind(this));
    }
    async handleStart(msg) {
        const chatId = msg.chat.id;
        const welcomeMessage = `🌟 Hello! I'm Rin, your self-improving AI assistant!\n\nI'm here to help you with questions and conversations. I can also analyze and improve my own code!\n\n/chat <message> - Chat with me\n/improve - Analyze and improve my own code\n/analyze - Analyze my codebase for improvements\n/improvements - Show improvement history\n/scheduler_start - Start periodic self-improvement\n/scheduler_stop - Stop periodic self-improvement\n/scheduler_status - Check scheduler status\n/help - Show this help message\n\nFeel free to send me any message and I'll respond!`;
        await this.bot.sendMessage(chatId, welcomeMessage);
    }
    async handleHelp(msg) {
        const chatId = msg.chat.id;
        const helpMessage = `🤖 Rin Bot Commands:\n\n/start - Welcome message\n/help - Show this help\n/chat <message> - Chat with Rin AI\n/improve - Analyze and improve my own code\n/analyze - Analyze my codebase for improvements\n/improvements - Show improvement history\n/scheduler_start - Start periodic self-improvement\n/scheduler_stop - Stop periodic self-improvement\n/scheduler_status - Check scheduler status\n\nYou can also just send any message directly and I'll respond!`;
        await this.bot.sendMessage(chatId, helpMessage);
    }
    async handleChat(msg) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId, 'Please provide a message after /chat, or just send me a message directly!');
    }
    async handleChatWithMessage(msg, match) {
        if (!match || !match[1])
            return;
        const chatId = msg.chat.id;
        const userMessage = match[1];
        await this.processUserMessage(chatId, userMessage);
    }
    async handleMessage(msg) {
        if (msg.text && msg.text.startsWith('/'))
            return;
        const chatId = msg.chat.id;
        const userMessage = msg.text || 'Hello!';
        await this.processUserMessage(chatId, userMessage);
    }
    async processUserMessage(chatId, userMessage) {
        try {
            await this.bot.sendMessage(chatId, '🤔 Thinking...');
            const response = await this.openRouter.simpleChat(userMessage);
            await this.bot.sendMessage(chatId, response);
        }
        catch (error) {
            console.error('Error processing message:', error);
            const errorMessage = 'Sorry, I encountered an error while processing your message. Please try again later.';
            await this.bot.sendMessage(chatId, errorMessage);
        }
    }
    handlePollingError(error) {
        console.error('Telegram polling error:', error);
    }
    async handleSelfImprove(msg) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId, '🔧 Starting self-improvement analysis...');
        try {
            await this.selfImprovement.selfImprove();
            await this.bot.sendMessage(chatId, '✅ Self-improvement completed! Check console for details.');
        }
        catch (error) {
            console.error('Self-improvement error:', error);
            await this.bot.sendMessage(chatId, '❌ Self-improvement failed. Please check console for error details.');
        }
    }
    async handleAnalyze(msg) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId, '📊 Analyzing codebase...');
        try {
            const analyses = await this.selfImprovement.analyzeCodebase();
            let message = `📋 Code Analysis Results:\n\n`;
            for (const analysis of analyses) {
                message += `📁 ${analysis.filePath}\n`;
                message += `🔥 Priority: ${analysis.priority}\n`;
                if (analysis.improvements.length > 0) {
                    message += `💡 Improvements: ${analysis.improvements.length}\n`;
                }
                if (analysis.issues.length > 0) {
                    message += `⚠️ Issues: ${analysis.issues.length}\n`;
                }
                message += '\n';
            }
            await this.bot.sendMessage(chatId, message);
        }
        catch (error) {
            console.error('Analysis error:', error);
            await this.bot.sendMessage(chatId, '❌ Analysis failed. Please check console for error details.');
        }
    }
    async handleImprovements(msg) {
        const chatId = msg.chat.id;
        try {
            const history = this.selfImprovement.getImprovementHistory();
            if (history.length === 0) {
                await this.bot.sendMessage(chatId, '📝 No improvement history yet. Use /improve to start!');
                return;
            }
            let message = `📈 Improvement History:\n\n`;
            for (const plan of history) {
                const statusEmoji = plan.status === 'implemented' ? '✅' :
                    plan.status === 'pending' ? '⏳' :
                        plan.status === 'rejected' ? '❌' : '❓';
                message += `${statusEmoji} ${plan.description}\n`;
                message += `📊 Impact: ${plan.estimatedImpact}\n`;
                message += `📁 Files: ${plan.files.length}\n\n`;
            }
            await this.bot.sendMessage(chatId, message);
        }
        catch (error) {
            console.error('Improvement history error:', error);
            await this.bot.sendMessage(chatId, '❌ Failed to retrieve improvement history.');
        }
    }
    async handleSchedulerStart(msg) {
        const chatId = msg.chat.id;
        try {
            if (this.scheduler.isRunning()) {
                await this.bot.sendMessage(chatId, '⚠️ Scheduler is already running!');
                return;
            }
            this.scheduler.startPeriodicImprovement();
            await this.bot.sendMessage(chatId, '✅ Periodic self-improvement started! I will improve myself every 24 hours.');
        }
        catch (error) {
            console.error('Scheduler start error:', error);
            await this.bot.sendMessage(chatId, '❌ Failed to start scheduler.');
        }
    }
    async handleSchedulerStop(msg) {
        const chatId = msg.chat.id;
        try {
            if (!this.scheduler.isRunning()) {
                await this.bot.sendMessage(chatId, '⚠️ Scheduler is not running!');
                return;
            }
            this.scheduler.stopPeriodicImprovement();
            await this.bot.sendMessage(chatId, '⏹️ Periodic self-improvement stopped.');
        }
        catch (error) {
            console.error('Scheduler stop error:', error);
            await this.bot.sendMessage(chatId, '❌ Failed to stop scheduler.');
        }
    }
    async handleSchedulerStatus(msg) {
        const chatId = msg.chat.id;
        try {
            const isRunning = this.scheduler.isRunning();
            const status = isRunning ? '🟢 Running' : '🔴 Stopped';
            const message = `📅 Scheduler Status: ${status}\n\n${isRunning ?
                'I am automatically improving myself every 24 hours.' :
                'Use /scheduler_start to enable automatic improvements.'}`;
            await this.bot.sendMessage(chatId, message);
        }
        catch (error) {
            console.error('Scheduler status error:', error);
            await this.bot.sendMessage(chatId, '❌ Failed to get scheduler status.');
        }
    }
    start() {
        console.log('🤖 Rin Bot started successfully!');
        console.log(`Bot is listening for messages...`);
    }
    stop() {
        this.scheduler.stopPeriodicImprovement();
        this.bot.stopPolling();
        console.log('🛑 Rin Bot stopped');
    }
}
exports.RinBot = RinBot;
//# sourceMappingURL=bot.js.map