import TelegramBot from 'node-telegram-bot-api';
export interface BotCommand {
    command: string;
    description: string;
    handler: (msg: TelegramBot.Message) => Promise<void>;
}
export declare class RinBot {
    private bot;
    private openRouter;
    private selfImprovement;
    private scheduler;
    private commands;
    constructor();
    private setupCommands;
    private setupEventHandlers;
    private handleStart;
    private handleHelp;
    private handleChat;
    private handleChatWithMessage;
    private handleMessage;
    private processUserMessage;
    private handlePollingError;
    private handleSelfImprove;
    private handleAnalyze;
    private handleImprovements;
    private handleSchedulerStart;
    private handleSchedulerStop;
    private handleSchedulerStatus;
    start(): void;
    stop(): void;
}
//# sourceMappingURL=bot.d.ts.map