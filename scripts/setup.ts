import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
    console.log('\n=== Bot Setup ===\n');

    const botToken = await question('1. Enter your Telegram Bot Token: ');

    console.log('\nHow would you like to run the LLM?');
    console.log('1) OpenRouter (Cloud, Requires API Key)');
    console.log('2) Local LLM (e.g., LM Studio, Ollama, vLLM - No API key needed)');
    const modeChoice = await question('Select an option (1 or 2): ');

    let apiKey = '';
    let model = '';
    let baseUrl = 'https://openrouter.ai/api/v1';

    if (modeChoice.trim() === '2') {
        const defaultLocalUrl = 'http://127.0.0.1:1234/v1';
        let inputUrl = await question(`\nEnter your Local LLM Base URL (Default: ${defaultLocalUrl}): `);
        baseUrl = inputUrl.trim() || defaultLocalUrl;

        model = await question('Enter the Model Name (or leave blank for default local model): ');
        model = model.trim() || 'local-model';
        apiKey = 'not-needed';
    } else {
        // OpenRouter flow
        apiKey = await question('\nEnter your OpenRouter API Key: ');
        model = await question('Enter the OpenRouter Model to use (default: stepfun/step-3.5-flash:free): ');
        model = model.trim() || 'stepfun/step-3.5-flash:free';
    }

    const envContent = `TELEGRAM_BOT_TOKEN=${botToken.trim()}
OPENROUTER_API_KEY=${apiKey.trim()}
OPENROUTER_MODEL=${model.trim()}
LLM_BASE_URL=${baseUrl.trim()}
`;

    const envPath = path.join(__dirname, '..', '.env');
    fs.writeFileSync(envPath, envContent, 'utf-8');

    console.log('\n✅ Setup complete! Configurations saved to .env file.');
    console.log('You can now run: npm run dev\n');

    rl.close();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
