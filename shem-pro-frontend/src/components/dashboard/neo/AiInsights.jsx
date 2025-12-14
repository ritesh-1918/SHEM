import React, { useState, useEffect } from 'react';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { generateAIResponse } from '../../../services/aiLLM';

const AiInsights = ({ data }) => {
    const [insight, setInsight] = useState("Analyzing your energy patterns...");
    const [loading, setLoading] = useState(false);

    const fetchInsight = async () => {
        setLoading(true);
        // Simple prompt for quick insight
        const prompt = "Give me one specific, actionable one-sentence tip based on my current energy usage to save money right now.";
        const response = await generateAIResponse(prompt, data);
        setInsight(response);
        setLoading(false);
    };

    useEffect(() => {
        if (data) {
            fetchInsight();
        }
    }, [data]); // Re-run when data changes significantly? Maybe too expensive. 
    // In prod, debounce or run once on mount/interval.

    return (
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-white/10 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <SparklesIcon className="w-24 h-24 text-white" />
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-accent" />
                    <h3 className="font-bold">AI Insight</h3>
                </div>
                <button
                    onClick={fetchInsight}
                    disabled={loading}
                    className="text-white/70 hover:text-white transition-colors"
                >
                    <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <p className="text-sm italic relative z-10 min-h-[40px]">
                "{insight}"
            </p>
        </div>
    );
};

export default AiInsights;
