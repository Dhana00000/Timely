"use client";

import { useState, useRef } from "react";
import { Send, Sparkles, Mic, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import styles from "./LumiInlineChat.module.css";

export default function LumiInlineChat() {
    const { user, loading } = useAuth();
    const { addEventLocally, addExpenseLocally, addHabitLocally, refreshData } = useData();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [lastResponse, setLastResponse] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    // Show placeholder while auth is loading
    if (loading) {
        return (
            <div className={styles.container}>
                <p>Loading Lumi…</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userInput = input.trim();
        setInput("");
        setIsLoading(true);
        setLastResponse("");

        try {
            // Use demo-user-id as fallback if context hasn't loaded yet
            const userId = user?.id || "demo-user-id";

            console.log("[Lumi] Sending:", userInput, "UserID:", userId);

            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userInput, userId }),
            });

            const data = await response.json();
            console.log("[Lumi] Response:", data);

            const aiResponse = data.response || "I'm here to help!";
            setLastResponse(aiResponse);

            // Handle returned event data - add to local state
            if (data.type === "event_created" && data.event) {
                console.log("[Lumi] Adding event to local state:", data.event);
                addEventLocally(data.event);
            }

            // Handle returned expense data
            if (data.type === "expense_created" && data.expense) {
                console.log("[Lumi] Adding expense to local state:", data.expense);
                addExpenseLocally(data.expense);
            }

            // Handle returned habit data
            if (data.type === "habit_created" && data.habit) {
                console.log("[Lumi] Adding habit to local state:", data.habit);
                addHabitLocally({ ...data.habit, completed: false, streak: 0 });
            }

            // Refresh data to sync with server (for real authenticated users)
            await refreshData();
        } catch (error) {
            console.error("[Lumi] Error:", error);
            setLastResponse("Sorry, I'm having trouble right now. Try again?");
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        "Schedule meeting tomorrow at 3pm",
        "Log $45 expense for lunch",
        "What's on my calendar today?",
        "Create gym habit daily",
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.avatar}>
                    <Sparkles size={24} />
                </div>
                <div className={styles.greeting}>
                    <h2 className={styles.title}>Hi! I'm Lumi 👋</h2>
                    <p className={styles.subtitle}>
                        {lastResponse || "Your AI assistant. Try scheduling an event or logging an expense!"}
                    </p>
                </div>
            </div>

            <form className={styles.inputArea} onSubmit={handleSubmit}>
                <div className={styles.inputWrapper}>
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.input}
                        placeholder="Ask Lumi anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="button" className={styles.micBtn} aria-label="Voice input">
                        <Mic size={18} />
                    </button>
                    <button
                        type="submit"
                        className={styles.sendBtn}
                        disabled={!input.trim() || isLoading}
                    >
                        {isLoading ? <Loader2 size={18} className={styles.spinner} /> : <Send size={18} />}
                    </button>
                </div>
            </form>

            <div className={styles.suggestions}>
                {suggestions.map((suggestion, i) => (
                    <button
                        key={i}
                        className={styles.suggestion}
                        onClick={() => {
                            setInput(suggestion);
                            inputRef.current?.focus();
                        }}
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
}

