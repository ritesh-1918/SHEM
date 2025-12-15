require('dotenv').config();
const axios = require('axios');

const key = process.env.GEMINI_API_KEY;
console.log("Loaded Key:", key ? key.substring(0, 5) + "..." : "UNDEFINED");

async function testHelp() {
    try {
        console.log("1. Listing Models...");
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const listRes = await axios.get(listUrl);
        console.log("Models found:", listRes.data.models.map(m => m.name).filter(n => n.includes('gemini')));
    } catch (error) {
        console.error("List Models Failed:", error.response ? error.response.data : error.message);
    }

    try {
        console.log("\n2. Testing gemini-1.5-flash...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        const res = await axios.post(url, {
            contents: [{ parts: [{ text: "Hello" }] }]
        });
        console.log("Success! Response:", res.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("gemini-1.5-flash Failed:", error.response ? error.response.status : error.message);
        if (error.response && error.response.data) console.error(JSON.stringify(error.response.data, null, 2));
    }
}

testHelp();
