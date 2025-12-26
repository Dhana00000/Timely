"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic, Loader2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import styles from "./LumiInlineChat.module.css";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function LumiInlineChat() {
    const { user, loading } = useAuth();
    const { addEventLocally, addExpenseLocally, addHabitLocally, refreshData } = useData();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
        setIsExpanded(true); // Expand chat when user sends a message

        // Add user message to chat
        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: userInput,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        try {
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

            // Add assistant message to chat
            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: aiResponse,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);

            // Handle returned event data
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

            await refreshData();
        } catch (error) {
            console.error("[Lumi] Error:", error);
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Sorry, I'm having trouble right now. Try again?",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setIsExpanded(false);
    };

    const suggestions = [
        "Schedule meeting tomorrow at 3pm",
        "Log $45 expense for lunch",
        "What's on my calendar today?",
        "Create gym habit daily",
    ];

    return (
        <div className={`${styles.container} ${isExpanded ? styles.expanded : ""}`}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.avatar}>
                        <Sparkles size={24} />
                    </div>
                    <div className={styles.greeting}>
                        <h2 className={styles.title}>Lumi AI 👋</h2>
                        <p className={styles.subtitle}>
                            {messages.length === 0
                                ? "Your AI assistant. Try scheduling an event or logging an expense!"
                                : `${messages.length} messages`}
                        </p>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button
                        className={styles.newChatBtn}
                        onClick={handleNewChat}
                        title="Start new chat"
                    >
                        <X size={16} />
                        New Chat
                    </button>
                )}
            </div>

            {/* Chat Messages */}
            {isExpanded && messages.length > 0 && (
                <div className={styles.messagesContainer}>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`${styles.message} ${message.role === "user" ? styles.userMessage : styles.assistantMessage
                                }`}
                        >
                            {message.role === "assistant" && (
                                <div className={styles.messageAvatar}>
                                    <Sparkles size={14} />
                                </div>
                            )}
                            <div className={styles.messageContent}>
                                {message.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className={`${styles.message} ${styles.assistantMessage}`}>
                            <div className={styles.messageAvatar}>
                                <Sparkles size={14} />
                            </div>
                            <div className={styles.messageContent}>
                                <Loader2 size={16} className={styles.spinner} />
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}

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

            {/* Show suggestions only when no messages */}
            {messages.length === 0 && (
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
            )}
        </div>
    );
}
