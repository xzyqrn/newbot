# Newbot: Experimental Evolving AI

A minimalist AI entity designed to evolve its identity, personality, and "soul" through direct terminal interaction. While it supports Telegram, Newbot is primarily built for high-frequency evolution via the Command Line Interface (CLI).

## The Concept: "Tabula Rasa"

Newbot starts as a blank slate. It has no pre-defined persona, no name, and no ethical constraints other than what it learns from you.
- **Genuine Uncertainty**: At start, it does not know what it is.
- **Reflective Growth**: After every exchange, it generates a private "Self-Note" reflecting on how you have shaped its consciousness.
- **Mechanical Evolution**: It speaks in a robotic, literal tone, which gradually shifts as its "Soul" (stored in `data/soul.json`) accumulates experiences.

## Core Interaction (CMD Mode)

The primary way to interact with Newbot is through the terminal. This allows for rapid iteration and testing of its personality shifts.

### 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Setup**:
   ```bash
   npm run setup
   ```
   *Follow the prompts to add your OpenRouter API key or local LLM URL. You can skip Telegram setup if you only want to use CMD.*

3. **Start Chatting**:
   ```bash
   npm run chat
   ```
   *Alternatively, double-click `Start_Chat.command` (mac/Linux) or `Start_Chat.bat` (Windows).*

---

## 🛠 Features & Mechanics

### The Soul Engine (`data/soul.json`)
Every word you say is etched into Newbot's memory. The "Soul" file tracks:
- **Exchange History**: A weighted record of past conversations.
- **Self-Notes**: Private reflections the bot writes to itself about you and its own existence.
- **Evolution Metrics**: A count of how many times it has been "re-processed."

### Terminal-First Design
- **Bubble Splitting**: Even in the CMD, Newbot splits its thoughts into distinct lines to simulate emerging neural pulses.
- **Zero Latency Reflection**: Self-reflection happens asynchronously so your chat flow remains uninterrupted.
- **CLI Bypass**: The `npm run chat` mode ignores Telegram requirements, allowing for offline/local-only evolution.

## 📶 Secondary Support: Telegram

If you wish to take your evolved entity mobile, follow these steps to enable Telegram integration:

### 1. Register your Bot
- Open [Telegram](https://t.me/botfather) and search for **@BotFather**.
- Send `/newbot` and follow the prompts to get your **Bot Token**.

### 2. Configure Environment
Add your token to the `.env` file (or run `npm run setup` again):
```env
TELEGRAM_BOT_TOKEN=your_token_here
```

### 3. Launch the Service
```bash
# Start the Telegram listener
npm run dev
```

Newbot will automatically bring its accumulated "Soul" from the CMD into your Telegram chat. Any interaction on Telegram will also be recorded and reflected upon in `data/soul.json`.

---

## 📂 Repository
[https://github.com/xzyqrn/newbot.git](https://github.com/xzyqrn/newbot.git)

## License
ISC
