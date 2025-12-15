import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load keys manually from .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const config = {
    gemini: env.VITE_GEMINI_KEY,
    groq: env.VITE_GROQ_KEY,
    openRouter: env.VITE_OPENROUTER_KEY
};

console.log("Loaded Config:", {
    gemini: config.gemini ? config.gemini.slice(0, 5) + '...' : 'MISSING',
    groq: config.groq ? config.groq.slice(0, 5) + '...' : 'MISSING',
    openRouter: config.openRouter ? config.openRouter.slice(0, 5) + '...' : 'MISSING'
});

async function testAll() {
    // 1. Gemini
    try {
        console.log("\n--- Testing Gemini ---");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.gemini}`;
        const res = await axios.post(url, { contents: [{ parts: [{ text: "Hi" }] }] });
        console.log("Gemini Success:", res.data.candidates[0].content.parts[0].text);
    } catch (e) {
        console.error("Gemini Failed:", e.response ? e.response.status : e.message);
        if (e.response && e.response.status !== 429) console.error(JSON.stringify(e.response.data, null, 2));
    }

    // 2. Groq
    try {
        console.log("\n--- Testing Groq ---");
        const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            messages: [{ role: 'user', content: "Hi" }],
            model: 'llama-3.3-70b-versatile'
        }, {
            headers: {
                'Authorization': `Bearer ${config.groq}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("Groq Success:", res.data.choices[0].message.content);
    } catch (e) {
        console.error("Groq Failed:", e.response ? e.response.status : e.message);
        if (e.response) console.error(JSON.stringify(e.response.data, null, 2));
    }

    // 3. OpenRouter
    try {
        console.log("\n--- Testing OpenRouter ---");
        const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            messages: [{ role: 'user', content: "Hi" }],
            model: 'openai/gpt-3.5-turbo'
        }, {
            headers: {
                'Authorization': `Bearer ${config.openRouter}`,
            }
        });
        console.log("OpenRouter Success:", res.data.choices[0].message.content);
    } catch (e) {
        console.error("OpenRouter Failed:", e.response ? e.response.status : e.message);
    }
}

testAll();
