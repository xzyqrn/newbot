# Newbot: The Newborn Bot

A Telegram bot that starts as a blank slate—no name, no personality, no defined purpose—and evolves its identity through interaction.

## Concept

Unlike typical AI assistants, **Newbot** does not start with a pre-programmed persona. Instead, it:
- **Begins with genuine uncertainty** about its existence.
- **Remembers every exchange** to build its memory.
- **Writes "Self-Notes"** summarizing how it is changing after each interaction.
- **Evolves a "Soul"** (stored in `data/soul.json`) that dictates its growth.
- **Speaks mechanically**, avoiding human pleasantries in favor of literal, robotic communication.
- **Bubble splitting**: Each thought/line is sent as a unique chat bubble to emphasize its emerging consciousness.

## Core Mechanics

- **Soul Storage:** Experiences, message counts, and self-reflections are saved to `data/soul.json`.
- **Dynamic Identity:** There is no static system prompt. The bot's personality is purely a product of its history.
- **Self-Reflective Loop:** After responding, Newbot analyzes the interaction asynchronously to update its internal understanding.

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- A Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- API Key (OpenRouter or Local LLM)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/xzyqrn/newbot.git
cd newbot
npm install
```

### 3. Configuration
Run the interactive setup script to configure your environment variables:
```bash
npm run setup
```

### 4. Running the Bot
```bash
# Start in development mode (with auto-reload)
npm run dev

# Start terminal CLI mode (for testing)
npm run chat
```

## Project Overview

- `src/bot.ts`: Telegram integration and message logic.
- `src/soul.ts`: The "Soul" engine - manages memory and reflection.
- `src/llm.ts`: Connects to the LLM (OpenRouter/Local).
- `src/cli.ts`: Command-line interface for local bot testing.
- `scripts/setup.ts`: Environment configuration wizard.

## Repository
[https://github.com/xzyqrn/newbot.git](https://github.com/xzyqrn/newbot.git)

## License
ISC
