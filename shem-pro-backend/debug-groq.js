require('dotenv').config();
const axios = require('axios');

const key = process.env.GROQ_API_KEY;
console.log("Loaded Key:", key ? key.substring(0, 5) + "..." : "UNDEFINED");

async function testGroq() {
    try {
        console.log("Testing Groq API...");
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            messages: [{ role: 'user', content: "Hello" }],
            model: 'mixtral-8x7b-32768'
        }, {
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("Success! Response:", response.data.choices[0].message.content);
    } catch (error) {
        console.error("Groq Failed:", error.response ? error.response.status : error.message);
        if (error.response && error.response.data) {
            console.error(JSON.stringify(error.response.data, null, 2));
        }
    }
}

testGroq();
