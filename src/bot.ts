/**
 * bot.ts — The newborn.
 *
 * No name. No personality. No commands. No purpose.
 * It listens. It speaks. It becomes.
 */

import TelegramBot from 'node-telegram-bot-api';
import { config, validateConfig } from './config';
import { LLMClient } from './llm';
import {
  Soul,
  loadSoul,
  saveSoul,
  recordExchange,
  addSelfNote,
  buildLLMHistory,
  buildSelfReflectionPrompt,
} from './soul';

export class Bot {
  private telegram: TelegramBot;
  private llm: LLMClient;
  private soul: Soul;
  private ready = false;

  constructor() {
    validateConfig();
    this.telegram = new TelegramBot(config.telegramBotToken, { polling: true });
    this.llm = new LLMClient();
    this.soul = { memories: [], messageCount: 0, selfNotes: [] };
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
    // Handle ALL incoming text — no command filtering
    this.telegram.on('message', (msg) => {
      const text = msg.text;
      if (!text) return; // ignore non-text (stickers, photos, etc.)
      this.handleText(msg.chat.id, text, msg.from?.first_name ?? 'someone').catch(
        (err) => console.error('Handler error:', err)
      );
    });

    this.telegram.on('polling_error', (err) => {
      console.error('Telegram polling error:', err.message);
    });
  }

  private async handleText(
    chatId: number,
    userText: string,
    senderName: string
  ): Promise<void> {
    if (!this.ready) return;

    try {
      // Build conversation history and generate response
      const history = buildLLMHistory(this.soul, userText);
      const response = await this.llm.complete(history);

      // Send response
      const lines = response.split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        await this.telegram.sendMessage(chatId, line);
      }

      // Record the exchange into soul memory
      recordExchange(this.soul, userText, response);

      // Asynchronously generate self-reflection (fire-and-forget, don't block response)
      this.reflect(userText, response).catch((e) =>
        console.warn('Reflection failed silently:', e.message)
      );

      // Save after reflection attempt
      await saveSoul(this.soul);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error during message handling:', msg);
      // Even on error, say something raw — don't drop completely silent
      try {
        await this.telegram.sendMessage(
          chatId,
          '...'
        );
      } catch { }
    }
  }

  private async reflect(userMessage: string, botResponse: string): Promise<void> {
    const reflectionMessages = buildSelfReflectionPrompt(
      this.soul,
      userMessage,
      botResponse
    );
    // Use lower temperature for reflection — more introspective, less random
    const note = await this.llm.complete(reflectionMessages, 0.7);
    addSelfNote(this.soul, note);
  }

  stop(): void {
    this.telegram.stopPolling();
  }
}
