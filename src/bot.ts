/**
 * bot.ts — The newborn.
 *
 * No name. No personality. No commands. No purpose.
 * It listens. It speaks. It becomes.
 */

import TelegramBot from 'node-telegram-bot-api';
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
  private telegram: TelegramBot;
  private llm: LLMClient;
  private soul: Soul;
  private ready = false;

  constructor() {
    validateConfig();
    this.telegram = new TelegramBot(config.telegramBotToken, { polling: true });
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
  }

  private setupHandlers(): void {
    this.telegram.on('message', (msg) => {
      const text = msg.text;
      if (!text) return;
      this.handleText(msg.chat.id, text).catch(
        (err) => console.error('Handler error:', err)
      );
    });

    this.telegram.on('polling_error', (err) => {
      console.error('Telegram polling error:', err.message);
    });
  }

  private async handleText(chatId: number, userText: string): Promise<void> {
    if (!this.ready) return;

    try {
      const history = buildLLMHistory(this.soul, userText);
      const response = await this.llm.complete(history);

      // Send response line by line
      const lines = response.split('\n').filter((line) => line.trim() !== '');
      for (const line of lines) {
        await this.telegram.sendMessage(chatId, line);
      }

      recordExchange(this.soul, userText, response);

      // Fire both reflection and trait extraction in parallel — don't block response
      this.reflect(userText, response).catch((e) =>
        console.warn('Reflection failed silently:', e.message)
      );
      this.extractTraits(userText, response).catch((e) =>
        console.warn('Trait extraction failed silently:', e.message)
      );

      await saveSoul(this.soul);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error during message handling:', msg);
      try {
        await this.telegram.sendMessage(chatId, '...');
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
    this.telegram.stopPolling();
  }
}
