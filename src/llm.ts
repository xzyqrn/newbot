/**
 * llm.ts — Thin wrapper around OpenRouter API.
 * No hardcoded personas. Just raw API calls.
 */

import axios, { AxiosInstance } from 'axios';
import { config } from './config';

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export class LLMClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: config.llmBaseUrl,
            headers: {
                Authorization: `Bearer ${config.openrouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://github.com/newborn-bot',
                'X-Title': 'Newborn Bot',
            },
            timeout: 40000,
        });
    }

    async complete(messages: LLMMessage[], temperature = 0.9): Promise<string> {
        try {
            const response = await this.client.post<{
                choices: Array<{ message: { content: string } }>;
            }>('/chat/completions', {
                model: config.openrouterModel,
                messages,
                temperature,
                max_tokens: 800,
            });

            const content = response.data.choices[0]?.message?.content;
            if (!content) throw new Error('Empty response from LLM');
            return content.trim();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const msg = error.response?.data?.error?.message || error.message;
                throw new Error(`LLM error: ${msg}`);
            }
            throw error;
        }
    }
}
