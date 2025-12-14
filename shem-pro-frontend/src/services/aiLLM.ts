import axios from 'axios';

// Interfaces
interface AIConfig {
    openRouter?: string;
    groq?: string;
    gemini?: string;
    activeProvider: 'openRouter' | 'groq' | 'gemini' | null;
}

const getAIConfig = (): AIConfig => {
    const openRouter = import.meta.env.VITE_OPENROUTER_KEY;
    const groq = import.meta.env.VITE_GROQ_KEY;
    const gemini = import.meta.env.VITE_GEMINI_KEY;

    let activeProvider: 'openRouter' | 'groq' | 'gemini' | null = null;
    if (openRouter) activeProvider = 'openRouter';
    else if (groq) activeProvider = 'groq';
    else if (gemini) activeProvider = 'gemini';

    return {
        openRouter: openRouter || '',
        groq: groq || '',
        gemini: gemini || '',
        activeProvider
    };
};

export const generateAIResponse = async (prompt: string, contextData?: any) => {
    const config = getAIConfig();
    const systemPrompt = `You are SHEM-AI, a smart home energy assistant. 
    Current Energy Data: ${JSON.stringify(contextData || {})}
    User Question: ${prompt}
    Provide a concise, helpful response focusing on energy efficiency and cost savings. Keep it under 50 words unless asked for details.`;

    try {
        if (!config.activeProvider) {
            return "Please configure your AI API Keys in Settings to enable the assistant.";
        }

        if (config.activeProvider === 'gemini' && config.gemini) {
            // Google Gemini API Call
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.gemini}`;
            const response = await axios.post(url, {
                contents: [{ parts: [{ text: systemPrompt }] }]
            });
            return response.data.candidates[0].content.parts[0].text;
        }

        else if (config.activeProvider === 'groq' && config.groq) {
            // Groq API Call
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                messages: [{ role: 'user', content: systemPrompt }],
                model: 'mixtral-8x7b-32768'
            }, {
                headers: {
                    'Authorization': `Bearer ${config.groq}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.choices[0].message.content;
        }

        else if (config.activeProvider === 'openRouter' && config.openRouter) {
            // OpenRouter API Call
            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                messages: [{ role: 'user', content: systemPrompt }],
                model: 'openai/gpt-3.5-turbo' // Default cheap model
            }, {
                headers: {
                    'Authorization': `Bearer ${config.openRouter}`,
                }
            });
            return response.data.choices[0].message.content;
        }

        return "Configuration error: Active provider set but key missing.";

    } catch (error) {
        console.error("AI Error:", error);
        return "Sorry, I encountered an error communicating with the AI service. Please check your API keys.";
    }
};
