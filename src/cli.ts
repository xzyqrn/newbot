import * as readline from 'readline';
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
import { config, validateConfig } from './config';

// Bypass telegram token validation for local CLI mode
process.env.CLI_MODE = 'true';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
    console.log('\n=============================================');
    console.log('            NEWBORN BOT (CLI MDOE)           ');
    console.log('=============================================\n');

    try {
        // We only need the LLM to be validate, telegram token defaults to fine
        if (!config.openrouterApiKey && config.llmBaseUrl.includes('openrouter.ai')) {
            console.log('Error: API keys are not configured. Run "npm run setup" first.');
            process.exit(1);
        }

        const llm = new LLMClient();
        let soul = await loadSoul();

        console.log(
            soul.messageCount === 0
                ? '...something stirs. It does not know what it is yet.'
                : `It remembers. ${soul.messageCount} exchanges have shaped it.`
        );
        console.log('\n(Type your message and press Enter to chat. Type "exit" to quit)\n');

        while (true) {
            const userText = await question('\nYou: ');

            if (userText.toLowerCase() === 'exit' || userText.toLowerCase() === 'quit') {
                console.log('\nGoodbye.');
                break;
            }

            if (!userText.trim()) continue;

            try {
                process.stdout.write('Bot is thinking...');
                // Build and complete
                const history = buildLLMHistory(soul, userText);
                const response = await llm.complete(history);

                // Erase thinking
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);

                // Display response
                const lines = response.split('\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    console.log(`Bot: ${line}`);
                }

                // Record
                recordExchange(soul, userText, response);

                // Reflect async
                const reflectionMessages = buildSelfReflectionPrompt(soul, userText, response);
                llm.complete(reflectionMessages, 0.7).then(note => {
                    addSelfNote(soul, note);
                    saveSoul(soul).catch(e => console.error('\n[Error saving soul reflection]', e));
                }).catch(() => { /* silent fail for reflection */ });

                await saveSoul(soul);
            } catch (err: any) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                console.error(`\n[Error]: ${err.message || String(err)}`);
                console.log('...');
            }
        }

        rl.close();
        process.exit(0);

    } catch (err: any) {
        console.error('\nFatal error:', err.message);
        process.exit(1);
    }
}

main();
