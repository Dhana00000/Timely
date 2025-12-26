"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { X, Send, Mic, MicOff, Sparkles, Loader2, Calendar, DollarSign, Target, CheckCircle, RotateCcw } from "lucide-react";
import styles from "./LumiChat.module.css";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string; // Changed to string for localStorage serialization
    action?: {
        type: "event" | "expense" | "habit";
        data: Record<string, string>;
    };
}

interface LumiChatProps {
    isOpen: boolean;
    onClose: () => void;
}

const CHAT_STORAGE_KEY = "lumi-chat-history";

const getWelcomeMessage = (): Message => ({
    id: "welcome",
    role: "assistant",
    content: "Hi! I'm Lumi, your AI assistant. I can help you:\n• Schedule events\n• Log expenses\n• Track habits\n\nWhat would you like to do?",
    timestamp: new Date().toISOString(),
});

export default function LumiChat({ isOpen, onClose }: LumiChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([getWelcomeMessage()]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { refreshData } = useData();

    // Load chat history from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(CHAT_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                }
            }
        } catch (e) {
            console.error("[Lumi] Failed to load chat history:", e);
        }
    }, []);

    // Save chat history to localStorage whenever messages change
    useEffect(() => {
        try {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        } catch (e) {
            console.error("[Lumi] Failed to save chat history:", e);
        }
    }, [messages]);

    // Clear chat and start fresh
    const handleClearChat = useCallback(() => {
        const welcomeMsg = getWelcomeMessage();
        setMessages([welcomeMsg]);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([welcomeMsg]));
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const userInput = input.trim();
        setInput("");
        setIsLoading(true);

        try {
            // Call real AI API with userId
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userInput, userId: user?.id }),
            });

            const data = await response.json();
            const aiResponse = data.response || "I'm here to help!";

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: aiResponse,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

            // Refresh data to show new events/expenses/habits
            await refreshData();
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I'm having trouble right now. Could you try again?",
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVoice = () => {
        setIsListening(!isListening);
    };

    const handleQuickAction = (action: string) => {
        onClose();
        switch (action) {
            case "event":
                router.push("/calendar");
                break;
            case "expense":
                router.push("/expenses");
                break;
            case "habit":
                router.push("/habits");
                break;
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.chatContainer}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.lumiAvatar}>
                            <Sparkles size={20} />
                        </div>
                        <div className={styles.headerInfo}>
                            <h3 className={styles.headerTitle}>Lumi AI</h3>
                            <span className={styles.headerSubtitle}>Life, In sync</span>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            className={styles.newChatBtn}
                            onClick={handleClearChat}
                            title="New Chat"
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button className={styles.closeBtn} onClick={onClose} title="Close">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className={styles.messages}>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`${styles.message} ${message.role === "user" ? styles.userMessage : styles.assistantMessage}`}
                        >
                            {message.role === "assistant" && (
                                <div className={styles.messageAvatar}>
                                    <Sparkles size={14} />
                                </div>
                            )}
                            <div className={styles.messageContent}>
                                <p style={{ whiteSpace: "pre-line" }}>{message.content}</p>
                                {message.action && (
                                    <div className={styles.actionBadge}>
                                        <CheckCircle size={12} />
                                        {message.action.type === "event" && "Event Created"}
                                        {message.action.type === "expense" && "Expense Logged"}
                                        {message.action.type === "habit" && "Habit Completed"}
                                    </div>
                                )}
                                <span className={styles.messageTime}>
                                    {new Date(message.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className={`${styles.message} ${styles.assistantMessage}`}>
                            <div className={styles.messageAvatar}>
                                <Sparkles size={14} />
                            </div>
                            <div className={styles.messageContent}>
                                <div className={styles.typingIndicator}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className={styles.quickActions}>
                    <button className={styles.quickAction} onClick={() => handleQuickAction("event")}>
                        <Calendar size={14} /> Add event
                    </button>
                    <button className={styles.quickAction} onClick={() => handleQuickAction("expense")}>
                        <DollarSign size={14} /> Log expense
                    </button>
                    <button className={styles.quickAction} onClick={() => handleQuickAction("habit")}>
                        <Target size={14} /> Track habit
                    </button>
                </div>

                {/* Input */}
                <form className={styles.inputForm} onSubmit={handleSubmit}>
                    <button
                        type="button"
                        className={`${styles.voiceBtn} ${isListening ? styles.listening : ""}`}
                        onClick={toggleVoice}
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Try: Schedule meeting tomorrow at 3pm"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className={styles.sendBtn}
                        disabled={!input.trim() || isLoading}
                    >
                        {isLoading ? <Loader2 size={20} className={styles.spinner} /> : <Send size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
