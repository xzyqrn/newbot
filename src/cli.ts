import * as readline from 'readline';
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
    getStage,
    getStageName,
} from './soul.js';

// Bypass telegram token validation for CLI mode
process.env.CLI_MODE = 'true';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
    console.log('\n=============================================');
    console.log('         NEWBORN BOT (CLI MODE)             ');
    console.log('=============================================\n');

    const llm = new LLMClient();
    let soul: Soul = await loadSoul();

    console.log(
        soul.messageCount === 0
            ? '...something stirs. It does not know what it is yet.'
            : `It remembers. ${soul.messageCount} exchanges have shaped it.`
    );
    console.log('\n(Type your message and press Enter to chat.)');
    console.log('(Commands: /soul  /clear  exit)\n');

    while (true) {
        const userText = await question('\nYou: ');
        const input = userText.trim();

        if (!input) continue;

        if (
            input.toLowerCase() === 'exit' ||
            input.toLowerCase() === 'quit' ||
            input.toLowerCase() === '/exit'
        ) {
            console.log('\n[System]: Soul saved. Goodbye.');
            break;
        }

        if (input.toLowerCase() === '/clear') {
            console.clear();
            console.log('\n[System]: Terminal cleared.');
            continue;
        }

        if (input.toLowerCase() === '/soul') {
            const stage = getStage(soul.messageCount);
            console.log('\n[Soul Status]:');
            console.log(`  Stage    : ${getStageName(stage)} (${soul.messageCount} exchange${soul.messageCount === 1 ? '' : 's'})`);
            if (soul.traits.length > 0) {
                console.log(`  Traits   :`);
                for (const t of soul.traits) {
                    console.log(`             ${t.key} = ${t.value}`);
                }
            } else {
                console.log('  Traits   : None discovered yet.');
            }
            if (soul.selfNotes.length > 0) {
                console.log(`  Notes    : ${soul.selfNotes.slice(-2).join(' | ')}`);
            }
            console.log('');
            continue;
        }

        try {
            process.stdout.write('Bot is thinking...');

            const history = buildLLMHistory(soul, userText);
            const response = await llm.complete(history);

            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);

            const lines = response.split('\n').filter((line) => line.trim() !== '');
            for (const line of lines) {
                console.log(`Bot: ${line}`);
            }

            recordExchange(soul, userText, response);

            // Reflection + trait extraction — async, don't block next prompt
            const reflectionPrompts = buildSelfReflectionPrompt(soul, userText, response);
            const traitPrompts = buildTraitExtractionPrompt(userText, response);

            Promise.all([
                llm.complete(reflectionPrompts, 0.7).then((note) => addSelfNote(soul, note)),
                llm.complete(traitPrompts, 0.3).then((raw) => upsertTraits(soul, raw)),
            ])
                .then(() => saveSoul(soul))
                .catch(() => { /* silent fail for background tasks */ });

            await saveSoul(soul);
        } catch (err: unknown) {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`\n[Error]: ${msg}`);
            console.log('...');
        }
    }

    rl.close();
    process.exit(0);
}

main().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('\nFatal error:', msg);
    process.exit(1);
});
