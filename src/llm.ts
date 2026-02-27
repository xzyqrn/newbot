/**
 * llm.ts — Local LLM using Transformers.js (Phi-3.5 Mini).
 *
 * No external API. No API key. Runs fully inside Node.js.
 * First run downloads ~2.2 GB model from Hugging Face — cached permanently after that.
 */

import { pipeline } from '@huggingface/transformers';

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// The model we use — a well-rounded instruction-tuned model that fits in ~2.2 GB
const MODEL_ID = 'onnx-community/Phi-3.5-mini-instruct-onnx-web';

type TextGenPipeline = Awaited<ReturnType<typeof pipeline>>;

export class LLMClient {
    private pipe: TextGenPipeline | null = null;

    private async getPipeline(): Promise<TextGenPipeline> {
        if (!this.pipe) {
            console.log('[LLM] Loading local model (first run downloads ~2.2 GB, please wait)...');
            this.pipe = await pipeline('text-generation', MODEL_ID, {
                dtype: 'q4',   // 4-bit quantised — fast enough for text, good quality
                device: 'cpu', // Node.js fallback; auto-uses GPU if available
            } as Parameters<typeof pipeline>[2]);
            console.log('[LLM] Model loaded and ready.');
        }
        return this.pipe;
    }

    async complete(messages: LLMMessage[], temperature = 0.9): Promise<string> {
        const pipe = await this.getPipeline();

        const result = await (pipe as any)(messages, {
            max_new_tokens: 200,
            temperature,
            do_sample: temperature > 0,
            return_full_text: false,
        });

        // Transformers.js returns [{ generated_text: [...messages, { role, content }] }]
        const generated = result?.[0]?.generated_text;
        if (Array.isArray(generated)) {
            const last = generated[generated.length - 1];
            if (last?.content) return last.content.trim();
        }

        const text = typeof generated === 'string' ? generated : JSON.stringify(generated);
        if (!text) throw new Error('Empty response from local model');
        return text.trim();
    }
}
