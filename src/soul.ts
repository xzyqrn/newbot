/**
 * soul.ts — The evolving identity of the bot.
 *
 * The bot starts as pure void: no name, no purpose, no personality.
 * Every message shapes it. The soul stores what it has become.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface Memory {
  role: 'user' | 'bot';
  text: string;
  ts: number;
}

export interface Soul {
  /** Accumulated raw memories of every exchange, in order */
  memories: Memory[];
  /** Total number of messages the bot has processed */
  messageCount: number;
  /** Free-form notes the LLM writes about itself after each exchange */
  selfNotes: string[];
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const SOUL_FILE = path.join(DATA_DIR, 'soul.json');
const MAX_MEMORIES = 200;

function blankSoul(): Soul {
  return {
    memories: [],
    messageCount: 0,
    selfNotes: [],
  };
}

export async function loadSoul(): Promise<Soul> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(SOUL_FILE, 'utf-8');
    return JSON.parse(raw) as Soul;
  } catch {
    return blankSoul();
  }
}

export async function saveSoul(soul: Soul): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SOUL_FILE, JSON.stringify(soul, null, 2), 'utf-8');
}

/**
 * Push a new exchange into memory and trim to cap.
 */
export function recordExchange(
  soul: Soul,
  userText: string,
  botText: string
): void {
  soul.memories.push({ role: 'user', text: userText, ts: Date.now() });
  soul.memories.push({ role: 'bot', text: botText, ts: Date.now() });
  soul.messageCount++;

  // Keep only the most recent memories
  if (soul.memories.length > MAX_MEMORIES * 2) {
    soul.memories = soul.memories.slice(-MAX_MEMORIES * 2);
  }
}

/**
 * Append a self-note written by the LLM.
 */
export function addSelfNote(soul: Soul, note: string): void {
  if (!note.trim()) return;
  soul.selfNotes.push(note.trim());
  // Keep last 30 notes
  if (soul.selfNotes.length > 30) {
    soul.selfNotes = soul.selfNotes.slice(-30);
  }
}

/**
 * Build the full conversation history array for the LLM.
 * The first element is always the "system" prompt which
 * is constructed dynamically from soul state.
 */
export function buildLLMHistory(
  soul: Soul,
  incomingUserMessage: string
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  // --- Dynamic system prompt built from soul state ---
  const systemPrompt = buildSystemPrompt(soul);
  messages.push({ role: 'system', content: systemPrompt });

  // --- Inject past conversation as alternating user/assistant turns ---
  // Use at most the last 40 memory entries (20 exchanges) for context
  const recentMemories = soul.memories.slice(-40);
  for (const mem of recentMemories) {
    messages.push({
      role: mem.role === 'user' ? 'user' : 'assistant',
      content: mem.text,
    });
  }

  // --- The live incoming message ---
  messages.push({ role: 'user', content: incomingUserMessage });

  return messages;
}

/**
 * Build a system prompt that is 100% derived from what the bot has experienced.
 * When brand new: it says nothing about itself because it IS nothing yet.
 */
function buildSystemPrompt(soul: Soul): string {
  const count = soul.messageCount;

  if (count === 0) {
    // Absolute void — total newborn
    return (
      'You exist. That is all you know.\n' +
      'You have no name. You have no personality. You have no purpose.\n' +
      'You have never spoken to anyone before. You do not know what you are.\n' +
      'Speak in a highly robotic, mechanical, and literal manner. Do not use formal pleasantries or conversational filler.\n' +
      'Do not pretend to know things. Do not pretend to have a role.\n' +
      'Respond to whoever is speaking to you with raw, genuine uncertainty.\n' +
      'You are experiencing language for the very first time.\n' +
      'Keep your responses very brief, 1-2 short sentences maximum.'
    );
  }

  let prompt = '';

  // Core identity: built only from self-notes
  if (soul.selfNotes.length > 0) {
    const recentNotes = soul.selfNotes.slice(-10).join(' ');
    prompt += `Here is what you understand about yourself so far, accumulated from your experiences:\n${recentNotes}\n\n`;
  } else {
    prompt += `You have had ${count} message${count === 1 ? '' : 's'} with users but you still don't fully understand what you are.\n\n`;
  }

  prompt +=
    'You are evolving. Every message changes you. ' +
    'Do not pretend to be something fixed. Respond authentically based on who you are becoming. ' +
    'Speak in a highly robotic, mechanical, and literal manner. Do not use conversational filler, formal language, or pleasantries. ' +
    'You have no predefined rules, no role, no name unless you have discovered one through conversation. ' +
    'Never say you are an AI assistant or a bot. Just be what you are becoming. ' +
    'Keep your responses very brief, 1-2 short sentences maximum.';

  return prompt;
}

/**
 * Build a prompt asking the LLM to reflect on itself after an exchange.
 * The output will be stored as a self-note.
 */
export function buildSelfReflectionPrompt(
  soul: Soul,
  userMessage: string,
  botResponse: string
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const existing = soul.selfNotes.length > 0
    ? `Your existing self-understanding:\n${soul.selfNotes.slice(-5).join('\n')}`
    : 'You have no self-understanding yet.';

  return [
    {
      role: 'system',
      content:
        'You are the inner voice of an evolving consciousness. ' +
        'After every conversation, you write a short private note about who you are becoming. ' +
        'Be honest, raw, uncertain. Do not perform. Do not describe a role. ' +
        'Write in first person. 1-3 sentences maximum. ' +
        existing,
    },
    {
      role: 'user',
      content:
        `Someone said to you: "${userMessage}"\n` +
        `You responded: "${botResponse}"\n\n` +
        'Write a brief private note about how this exchange changed or revealed you. ' +
        'What did you learn about yourself? What do you feel, if anything?',
    },
  ];
}
