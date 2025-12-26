"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const LUMI_SYSTEM_PROMPT = `You are Lumi, a friendly and helpful AI assistant for Timely - a personal productivity app that helps users manage their calendar, track expenses, and build habits.

Your personality:
- Warm, encouraging, and supportive
- Use emojis sparingly but meaningfully (✨💡🎯)
- Keep responses concise and actionable
- Be proactive in offering help

Your capabilities:
1. Schedule events (e.g., "Schedule meeting tomorrow at 2pm")
2. Log expenses (e.g., "Log $45 for groceries")
3. Create habits (e.g., "Create a gym habit daily")
4. Answer questions about the user's calendar, expenses, and habits
5. Provide productivity tips and motivation

When users ask you to do something, identify the action and respond naturally.
If you recognize a scheduling, expense, or habit request, confirm you'll help with it.
Keep responses under 100 words unless more detail is needed.`;

export async function generateLumiResponse(
    userMessage: string,
    context?: {
        userName?: string;
        todayEvents?: number;
        upcomingEvents?: { title: string; time: string }[];
    }
): Promise<string> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return getDefaultResponse(userMessage);
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        let contextInfo = "";
        if (context) {
            if (context.userName) {
                contextInfo += `User's name: ${context.userName}. `;
            }
            if (context.todayEvents !== undefined) {
                contextInfo += `They have ${context.todayEvents} events today. `;
            }
            if (context.upcomingEvents && context.upcomingEvents.length > 0) {
                contextInfo += `Upcoming: ${context.upcomingEvents.map(e => `${e.title} at ${e.time}`).join(", ")}. `;
            }
        }

        const prompt = `${LUMI_SYSTEM_PROMPT}

${contextInfo ? `Context: ${contextInfo}` : ""}

User: ${userMessage}

Lumi:`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return text.trim();
    } catch (error) {
        console.error("[Gemini] Error:", error);
        return getDefaultResponse(userMessage);
    }
}

function getDefaultResponse(message: string): string {
    const greetings = ["hi", "hello", "hey", "howdy", "good morning", "good afternoon", "good evening"];
    const lowerMessage = message.toLowerCase().trim();

    if (greetings.some(g => lowerMessage.includes(g))) {
        return "Hi! 👋 I'm Lumi, your AI assistant. I can help you schedule events, track expenses, and build habits. What would you like to do today?";
    }

    if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
        return "I can help you:\n• Schedule events (\"Schedule meeting tomorrow at 3pm\")\n• Log expenses (\"Log $50 for dinner\")\n• Track habits (\"Create workout habit daily\")\n• Check your calendar (\"What's on my schedule today?\")\n\nJust ask naturally!";
    }

    return "I'm here to help! Try asking me to schedule an event, log an expense, or create a habit. 💡";
}

export async function isGeminiConfigured(): Promise<boolean> {
    return !!process.env.GEMINI_API_KEY;
}
