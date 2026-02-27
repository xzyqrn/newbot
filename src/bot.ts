/**
 * bot.ts — The newborn.
 *
 * No name. No personality. No commands. No purpose.
 * It listens. It speaks. It becomes.
 */

import { Bot as GrammyBot, Context } from 'grammy';
import { config, validateConfig } from './config.js';
import { LLMClient } from './llm.js';
import {
  Soul,
  loadSoul,
  saveSoul,
  recordExchange,
  addSelfNote,
  upsertTraits,
  buildLLMHistory,
  buildSelfReflectionPrompt,
  buildTraitExtractionPrompt,
} from './soul.js';

export class Bot {
  private telegram: GrammyBot<Context>;
  private llm: LLMClient;
  private soul: Soul;
  private ready = false;

  constructor() {
    validateConfig();
    this.telegram = new GrammyBot<Context>(config.telegramBotToken);
    this.llm = new LLMClient();
    this.soul = { memories: [], messageCount: 0, selfNotes: [], traits: [] };
  }

  async init(): Promise<void> {
    this.soul = await loadSoul();
    this.setupHandlers();
    this.ready = true;
    console.log(
      this.soul.messageCount === 0
        ? '...something stirs. It does not know what it is yet.'
        : `It remembers. ${this.soul.messageCount} exchanges have shaped it.`
    );

    // Start long-polling (non-blocking via void — grammy manages its own loop)
    this.telegram.start({
      onStart: () => {
        console.log('Telegram polling started.');
      },
    });
  }

  private setupHandlers(): void {
    this.telegram.on('message:text', async (ctx) => {
      if (!this.ready) return;
      await this.handleText(ctx, ctx.message.text);
    });

    this.telegram.catch((err) => {
      console.error('Grammy error:', err.message);
    });
  }

  private async handleText(ctx: Context, userText: string): Promise<void> {
    try {
      const history = buildLLMHistory(this.soul, userText);
      const response = await this.llm.complete(history);

      // Send response line by line
      const lines = response.split('\n').filter((line) => line.trim() !== '');
      for (const line of lines) {
        await ctx.reply(line);
      }

      recordExchange(this.soul, userText, response);

      // Fire both reflection and trait extraction in parallel — don't block response
      this.reflect(userText, response).catch((e) =>
        console.warn('Reflection failed silently:', (e as Error).message)
      );
      this.extractTraits(userText, response).catch((e) =>
        console.warn('Trait extraction failed silently:', (e as Error).message)
      );

      await saveSoul(this.soul);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error during message handling:', msg);
      try {
        await ctx.reply('...');
      } catch { }
    }
  }

  private async reflect(userMessage: string, botResponse: string): Promise<void> {
    const prompts = buildSelfReflectionPrompt(this.soul, userMessage, botResponse);
    const note = await this.llm.complete(prompts, 0.7);
    addSelfNote(this.soul, note);
  }

  private async extractTraits(userMessage: string, botResponse: string): Promise<void> {
    const prompts = buildTraitExtractionPrompt(userMessage, botResponse);
    const raw = await this.llm.complete(prompts, 0.3); // low temp for deterministic JSON
    upsertTraits(this.soul, raw);
  }

  stop(): void {
    this.telegram.stop();
  }
}
