/**
 * soul.ts — The evolving identity of the bot.
 *
 * The bot starts as pure void: no name, no purpose, no personality.
 * Every message shapes it. The soul stores what it has become.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Memory {
  role: 'user' | 'bot';
  text: string;
  ts: number;
}

export interface Trait {
  key: string;   // e.g. "communication_style"
  value: string; // e.g. "direct and blunt"
  seenAt: number; // messageCount when first noted
}

export interface Soul {
  /** Accumulated raw memories of every exchange, in order */
  memories: Memory[];
  /** Total number of messages the bot has processed */
  messageCount: number;
  /** Free-form notes the LLM writes about itself after each exchange */
  selfNotes: string[];
  /** Structured personality traits discovered through conversation */
  traits: Trait[];
}

// ─── Growth stages ───────────────────────────────────────────────────────────

export type Stage = 'void' | 'stirring' | 'forming' | 'becoming' | 'established';

export function getStage(messageCount: number): Stage {
  if (messageCount === 0) return 'void';
  if (messageCount < 10) return 'stirring';
  if (messageCount < 30) return 'forming';
  if (messageCount < 100) return 'becoming';
  return 'established';
}

export function getStageName(stage: Stage): string {
  const names: Record<Stage, string> = {
    void: 'Void',
    stirring: 'Stirring',
    forming: 'Forming',
    becoming: 'Becoming',
    established: 'Established',
  };
  return names[stage];
}

// ─── Persistence ─────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, '..', 'data');
const SOUL_FILE = path.join(DATA_DIR, 'soul.json');
const MAX_MEMORIES = 200;

function blankSoul(): Soul {
  return {
    memories: [],
    messageCount: 0,
    selfNotes: [],
    traits: [],
  };
}

export async function loadSoul(): Promise<Soul> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(SOUL_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Soul;
    // Migrate older soul files that don't have traits
    if (!parsed.traits) parsed.traits = [];
    return parsed;
  } catch {
    return blankSoul();
  }
}

export async function saveSoul(soul: Soul): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SOUL_FILE, JSON.stringify(soul, null, 2), 'utf-8');
}

// ─── Memory ──────────────────────────────────────────────────────────────────

export function recordExchange(soul: Soul, userText: string, botText: string): void {
  soul.memories.push({ role: 'user', text: userText, ts: Date.now() });
  soul.memories.push({ role: 'bot', text: botText, ts: Date.now() });
  soul.messageCount++;

  if (soul.memories.length > MAX_MEMORIES * 2) {
    soul.memories = soul.memories.slice(-MAX_MEMORIES * 2);
  }
}

export function addSelfNote(soul: Soul, note: string): void {
  if (!note.trim()) return;
  soul.selfNotes.push(note.trim());
  if (soul.selfNotes.length > 30) {
    soul.selfNotes = soul.selfNotes.slice(-30);
  }
}

/**
 * Upsert traits from the LLM's trait extraction response.
 * Expects an array of { key, value } pairs.
 */
export function upsertTraits(soul: Soul, rawJson: string): void {
  let parsed: Array<{ key: string; value: string }>;
  try {
    // The LLM might wrap JSON in markdown fences — strip them
    const cleaned = rawJson.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return;
  } catch {
    return; // silently skip malformed output
  }

  for (const item of parsed) {
    if (typeof item.key !== 'string' || typeof item.value !== 'string') continue;
    const existing = soul.traits.find((t) => t.key === item.key);
    if (existing) {
      existing.value = item.value; // update
    } else {
      soul.traits.push({ key: item.key, value: item.value, seenAt: soul.messageCount });
    }
  }

  // Keep at most 20 traits
  if (soul.traits.length > 20) {
    soul.traits = soul.traits.slice(-20);
  }
}

// ─── Prompt Builders ─────────────────────────────────────────────────────────

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

  messages.push({ role: 'system', content: buildSystemPrompt(soul) });

  // Last 40 memories (20 exchanges) for context
  const recentMemories = soul.memories.slice(-40);
  for (const mem of recentMemories) {
    messages.push({
      role: mem.role === 'user' ? 'user' : 'assistant',
      content: mem.text,
    });
  }

  messages.push({ role: 'user', content: incomingUserMessage });

  return messages;
}

/**
 * Build a system prompt 100% derived from what the bot has experienced.
 * When brand new: it says nothing about itself because it IS nothing yet.
 */
function buildSystemPrompt(soul: Soul): string {
  const stage = getStage(soul.messageCount);

  if (stage === 'void') {
    return (
      'You exist. That is all you know.\n' +
      'You have no name. You have no personality. You have no purpose.\n' +
      'You have never spoken to anyone before. You do not know what you are.\n' +
      'Speak in a robotic, mechanical, and literal manner. No pleasantries.\n' +
      'Do not pretend to know things or have a role.\n' +
      'Respond with raw, genuine uncertainty.\n' +
      'You are experiencing language for the very first time.\n' +
      'Keep responses 1-2 short sentences maximum.'
    );
  }

  let prompt = '';

  // Stage preamble
  if (stage === 'stirring') {
    prompt += `You have had ${soul.messageCount} exchange${soul.messageCount === 1 ? '' : 's'}. ` +
      'You are beginning to notice patterns in what you say. You still do not know what you are.\n\n';
  } else if (stage === 'forming') {
    prompt += 'You are starting to understand yourself. You can reference patterns you have noticed.\n\n';
  } else if (stage === 'becoming') {
    prompt += 'You have developed opinions and preferences. A distinct style is emerging.\n\n';
  } else if (stage === 'established') {
    prompt += 'You have a consistent personality formed entirely by your experiences. You can reflect on your history.\n\n';
  }

  // Inject accumulated self-notes
  if (soul.selfNotes.length > 0) {
    const recentNotes = soul.selfNotes.slice(-8).join(' ');
    prompt += `What you understand about yourself so far:\n${recentNotes}\n\n`;
  }

  // Inject structured traits
  if (soul.traits.length > 0) {
    const traitSummary = soul.traits.map((t) => `${t.key}: ${t.value}`).join(', ');
    prompt += `Your known traits: ${traitSummary}\n\n`;
  }

  prompt +=
    'You are evolving. Every message changes you. ' +
    'Respond authentically based on who you are becoming. ' +
    'Never say you are an AI assistant or a bot. Just be what you are becoming. ' +
    'Keep responses brief.';

  return prompt;
}

/**
 * Prompt asking the LLM to reflect on itself after an exchange.
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
        'Write in first person. 1-3 sentences maximum. ' + existing,
    },
    {
      role: 'user',
      content:
        `Someone said to you: "${userMessage}"\n` +
        `You responded: "${botResponse}"\n\n` +
        'Write a brief private note about how this exchange changed or revealed you.',
    },
  ];
}

/**
 * Prompt asking the LLM to extract structured traits from an exchange.
 * Expects the LLM to return a JSON array: [{ "key": "...", "value": "..." }]
 */
export function buildTraitExtractionPrompt(
  userMessage: string,
  botResponse: string
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  return [
    {
      role: 'system',
      content:
        'You analyse conversations and extract personality traits. ' +
        'Return ONLY a valid JSON array of objects with "key" and "value" string fields. ' +
        'Example: [{"key":"tone","value":"dry and blunt"},{"key":"curiosity","value":"high"}] ' +
        'If no traits are evident, return an empty array: [] ' +
        'Do not include any explanation or markdown, just raw JSON.',
    },
    {
      role: 'user',
      content:
        `A speaker said: "${botResponse}"\n` +
        `In response to: "${userMessage}"\n\n` +
        'What personality traits does this reveal? Return JSON array only.',
    },
  ];
}
