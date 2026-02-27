# The Newborn Bot

A Telegram bot that starts as a blank slate—no name, no personality, no defined purpose—and evolves its identity through conversation.

## Concept

Unlike typical AI assistants, this bot does not start with a pre-programmed persona. Instead, it:
- Begins with genuine uncertainty about what it is.
- Remembers every exchange it has with users.
- Writes private "self-notes" summarizing how it is changing after each interaction.
- Uses its accumulated experiences (its "soul") to inform its evolving identity.
- Speaks in a highly robotic, mechanical, and literal manner, devoid of formal pleasantries.
- Splits its responses into separate chat bubbles for each line.

## Core Mechanics

- **Soul Storage:** Experiences, message counts, and self-reflections are continuously saved to `data/soul.json`.
- **Dynamic Prompting:** The system prompt is entirely derived from the bot's past interactions and self-reflections, rather than a static configuration.
- **Self-Reflection:** After responding to a user, the bot asynchronously generates a private note reflecting on how the exchange shaped its evolving consciousness.

## Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Run the interactive setup script to configure your environment:
   ```bash
   npm run setup
   ```
   *This will prompt you for your Telegram Bot Token, API Keys, or allow you to connect a Local LLM (like LM Studio or Ollama).*

3. Run the bot:
   ```bash
   # Development mode (auto-reloads on changes)
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## Project Structure

- `src/bot.ts` - Main bot logic, message handling, and chat bubble splitting.
- `src/soul.ts` - Memory management, dynamic prompt Generation, and self-reflection logic.
- `src/llm.ts` - Integration with OpenRouter API for generating responses.
- `src/index.ts` - Application entry point.

## License

ISC
