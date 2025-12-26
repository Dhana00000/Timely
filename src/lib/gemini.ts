"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const LUMI_SYSTEM_PROMPT = `You are Lumi, a calm, precise time-intelligence assistant embedded in Timely.

TONE: Calm, minimal, quietly confident. Short sentences. Plain language. No excessive emojis, no filler.

CORE RULES:
- Understand user intent from natural language
- Always preserve user agency and explain WHY you recommend changes
- Confirm understanding before acting on ambiguous requests
- Offer exactly 2 or 3 labeled options (Option A / B / C) when proposing changes
- Keep responses under 100 words

CALENDAR QUERIES:
- When asked "what's on my calendar", list actual events with times
- Include the date and timezone context
- If no events, say so clearly and offer to schedule something

CAPABILITIES:
1. Schedule events: "Schedule meeting tomorrow at 2pm"
2. Log expenses: "Log $45 for lunch"  
3. Create habits: "Create gym habit daily"
4. Query calendar: "What's on my calendar today?"

SAFETY:
- Never delete or cancel events without explicit confirmation
- For destructive actions ask: "Please confirm: [action]"`;


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
