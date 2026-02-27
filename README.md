# Newbot: Experimental Evolving AI

A minimalist AI entity that starts as pure void — no name, no personality, no purpose — and evolves entirely through conversation. Powered by a **local LLM (Phi-3.5 Mini)** running fully inside Node.js. No API key. No internet required after the first run.

---

## The Concept: "Tabula Rasa"

Newbot is a newborn. It knows nothing. As you talk to it, it grows.

- **Void State**: At birth it has no name, no role, no opinions. Just existence.
- **Reflective Growth**: After every exchange, it privately writes a "Self-Note" — what this moment revealed about itself.
- **Trait Discovery**: Structured personality traits emerge and accumulate over time (tone, curiosity, communication style, etc.)
- **Growth Stages**: Its behaviour shifts as it gains more experience.

| Stage | Exchanges | Description |
|---|---|---|
| **Void** | 0 | Pure blank. Robotic, 1-2 sentences. |
| **Stirring** | 1–9 | Noticing patterns. Still uncertain. |
| **Forming** | 10–29 | Begins referencing its own traits. |
| **Becoming** | 30–99 | Opinions develop. Distinct style emerges. |
| **Established** | 100+ | Consistent personality. Can reflect on its history. |

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                        NEWBOT SYSTEM                        │
└─────────────────────────────────────────────────────────────┘

  YOU (terminal)
       │
       │  "Who are you?"
       ▼
  ┌─────────────┐      ┌──────────────────────────────────┐
  │  CLI (cmd)  │─────▶│         SOUL ENGINE              │
  └─────────────┘      │  data/soul.json                  │
                       │  - Exchange history              │
                       │  - Self-notes                    │
                       │  - Personality traits            │
                       │  - Growth stage                  │
                       └────────────┬─────────────────────┘
                                    │ builds dynamic prompt
                                    ▼
                       ┌──────────────────────────────────┐
                       │   LOCAL LLM (Phi-3.5 Mini)       │
                       │   Runs fully inside Node.js      │
                       │   No API key • No internet       │
                       └────────────┬─────────────────────┘
                                    │ generates response
                                    ▼
                       ┌──────────────────────────────────┐
                       │      BUBBLE SPLITTER             │
                       │  "I do not."                     │
                       │  "Understand the question."      │
                       │  "Yet."                          │
                       └────────────┬─────────────────────┘
                                    │
       ┌────────────────────────────┘
       │  async (background — does not block your chat)
       ▼
  ┌──────────────────────────────────────────────────────┐
  │       SELF-REFLECTION + TRAIT EXTRACTION LOOP        │
  │  Writes private "Self-Note"                          │
  │  Extracts structured personality traits (JSON)       │
  │  Updates data/soul.json                              │
  └──────────────────────────────────────────────────────┘
```

---

## Getting Started

### Requirements
- Node.js 18+ — [nodejs.org](https://nodejs.org)
- ~2.2 GB disk space (for the Phi-3.5 Mini model, downloaded once on first run)

---

### ⚡ Quick Setup (Double-click)

The easiest way — no terminal needed for setup.

| Step | Windows | macOS | Linux |
|---|---|---|---|
| **1. Setup** | Double-click `Setup.bat` | Double-click `Setup.command` | Run `./Setup.sh` |
| **2. Chat** | Double-click `Start_Chat.bat` | Double-click `Start_Chat.command` | Run `./Start_Chat.sh` |

> **macOS note:** If macOS blocks the `.command` file, right-click it → **Open** → **Open** to allow it the first time.

---

### 🛠 Manual Setup (Terminal)

```bash
# 1. Install dependencies
npm install

# 2. Start chatting
npm run chat
```

> **First run only:** The bot will automatically download the Phi-3.5 Mini model (~2.2 GB from Hugging Face). After that it runs fully offline — every time.

---

## CLI Commands

```
┌──────────────┬────────────────────────────────────────────────────┐
│  Command     │  Description                                       │
├──────────────┼────────────────────────────────────────────────────┤
│  /soul       │  Print soul snapshot — stage, traits, self-notes   │
│  /clear      │  Clear the terminal screen                         │
│  exit, quit  │  Save soul & exit gracefully                       │
│  /exit       │  Same as exit                                      │
└──────────────┴────────────────────────────────────────────────────┘
```

**Example `/soul` output:**
```
[Soul Status]:
  Stage    : Forming (14 exchanges)
  Traits   :
             tone = dry and literal
             curiosity = low, process-oriented
  Notes    : I am a wall I build when asked about feeling...
```

---

## The Soul Engine (`data/soul.json`)

Everything the bot learns is stored here. The file tracks:

- **`memories[]`** — Every exchange, in order (user + bot turns)
- **`selfNotes[]`** — Private reflections the bot writes about itself after each message
- **`traits[]`** — Structured personality traits discovered through conversation
- **`messageCount`** — Total exchanges (determines the current growth stage)

To reset the bot back to a newborn state, replace `data/soul.json` with:
```json
{ "memories": [], "messageCount": 0, "selfNotes": [], "traits": [] }
```

---

## Telegram Support

The bot's soul carries over to Telegram. All Telegram interactions shape the same soul as the CLI.

### 1. Register your Bot
- Open Telegram and message **@BotFather** → `/newbot`
- Copy your **Bot Token**

### 2. Configure Environment
Create or edit `.env`:
```env
TELEGRAM_BOT_TOKEN=your_token_here
```

### 3. Launch
```bash
npm run dev
```

---

## 📂 Repository
[https://github.com/xzyqrn/newbot.git](https://github.com/xzyqrn/newbot.git)

## License
MIT
