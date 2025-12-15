const express = require('express');
const router = express.Router();
const axios = require('axios');

// API configurations
const getGeminiKey = () => process.env.VITE_GEMINI_KEY || process.env.GEMINI_API_KEY;
const getGroqKey = () => process.env.VITE_GROQ_KEY || process.env.GROQ_API_KEY;
const getOpenRouterKey = () => process.env.VITE_OPENROUTER_KEY || process.env.OPENROUTER_API_KEY;

// API Call Functions
const callGemini = async (prompt) => {
    const key = getGeminiKey();
    if (!key) throw new Error("Gemini Key Missing");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }]
    });
    return response.data.candidates[0].content.parts[0].text;
};

const callGroq = async (prompt) => {
    const key = getGroqKey();
    if (!key) throw new Error("Groq Key Missing");

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-70b-8192'
    }, {
        headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data.choices[0].message.content;
};

const callOpenRouter = async (prompt) => {
    const key = getOpenRouterKey();
    if (!key) throw new Error("OpenRouter Key Missing");

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-3.5-turbo'
    }, {
        headers: {
            'Authorization': `Bearer ${key}`,
        }
    });
    return response.data.choices[0].message.content;
};

// Main Chat Route
router.post('/', async (req, res) => {
    const { message, contextData } = req.body;

    const systemPrompt = `You are SHEM-AI, a smart home energy assistant. 
    Current Energy Data: ${JSON.stringify(contextData || {})}
    User Question: ${message}
    Provide a concise, helpful response focusing on energy efficiency and cost savings. Keep it under 50 words unless asked for details.`;

    try {
        // Attempt 1: Gemini
        try {
            console.log("Attempting Gemini...");
            const response = await callGemini(systemPrompt);
            return res.json({ response });
        } catch (error) {
            console.error("Gemini failed:", error.message);
        }

        // Attempt 2: Groq
        try {
            console.log("Attempting Groq...");
            const response = await callGroq(systemPrompt);
            return res.json({ response });
        } catch (error) {
            console.error("Groq failed:", error.message);
        }

        // Attempt 3: OpenRouter
        try {
            console.log("Attempting OpenRouter...");
            const response = await callOpenRouter(systemPrompt);
            return res.json({ response });
        } catch (error) {
            console.error("OpenRouter failed:", error.message);
        }

        throw new Error("All AI providers failed.");

    } catch (error) {
        console.error("All Chat Failures:", error.message);
        res.status(500).json({ error: "Sorry, I encountered an error communicating with the AI service. Please check your API keys." });
    }
});

module.exports = router;
