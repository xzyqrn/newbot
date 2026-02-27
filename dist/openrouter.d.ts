export interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface OpenRouterResponse {
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export declare class OpenRouterClient {
    private client;
    constructor();
    chat(messages: OpenRouterMessage[]): Promise<string>;
    simpleChat(userMessage: string): Promise<string>;
}
//# sourceMappingURL=openrouter.d.ts.map