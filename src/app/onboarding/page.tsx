"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ArrowRight, Check, X } from "lucide-react";
import styles from "./page.module.css";

interface CalendarProvider {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
    connected: boolean;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [providers, setProviders] = useState<CalendarProvider[]>([
        {
            id: "google",
            name: "Google Calendar",
            icon: (
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
            ),
            description: "Sync events from your Google account",
            connected: false,
        },
        {
            id: "outlook",
            name: "Outlook Calendar",
            icon: (
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#0078D4" d="M24 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-19A2.5 2.5 0 0 1 0 17.5v-10A2.5 2.5 0 0 1 2.5 5h19A2.5 2.5 0 0 1 24 7.5z" />
                    <path fill="#fff" d="M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" />
                </svg>
            ),
            description: "Sync events from your Microsoft account",
            connected: false,
        },
    ]);
    const [loading, setLoading] = useState<string | null>(null);

    const handleConnect = async (providerId: string) => {
        setLoading(providerId);

        // Simulate OAuth flow - in production this would redirect to OAuth
        await new Promise(resolve => setTimeout(resolve, 1500));

        setProviders(prev => prev.map(p =>
            p.id === providerId ? { ...p, connected: true } : p
        ));
        setLoading(null);
    };

    const handleDisconnect = (providerId: string) => {
        setProviders(prev => prev.map(p =>
            p.id === providerId ? { ...p, connected: false } : p
        ));
    };

    const handleContinue = () => {
        // Save calendar preferences to localStorage (or database when configured)
        const connectedProviders = providers.filter(p => p.connected).map(p => p.id);
        localStorage.setItem("timely_calendar_providers", JSON.stringify(connectedProviders));
        router.push("/dashboard");
    };

    const handleSkip = () => {
        localStorage.setItem("timely_calendar_providers", JSON.stringify([]));
        router.push("/dashboard");
    };

    const hasConnections = providers.some(p => p.connected);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <Calendar size={32} />
                </div>

                <h1 className={styles.title}>Connect Your Calendars</h1>
                <p className={styles.subtitle}>
                    Timely can sync with your existing calendars for a unified view.
                    All syncs are <strong>bidirectional</strong> — changes you make here appear in your connected calendars, and vice versa.
                </p>

                <div className={styles.providers}>
                    {providers.map((provider) => (
                        <div
                            key={provider.id}
                            className={`${styles.provider} ${provider.connected ? styles.connected : ""}`}
                        >
                            <div className={styles.providerIcon}>
                                {provider.icon}
                            </div>
                            <div className={styles.providerInfo}>
                                <h3 className={styles.providerName}>{provider.name}</h3>
                                <p className={styles.providerDesc}>{provider.description}</p>
                            </div>
                            {provider.connected ? (
                                <div className={styles.connectedBadge}>
                                    <Check size={14} />
                                    Connected
                                    <button
                                        className={styles.disconnectBtn}
                                        onClick={() => handleDisconnect(provider.id)}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className={styles.connectBtn}
                                    onClick={() => handleConnect(provider.id)}
                                    disabled={loading === provider.id}
                                >
                                    {loading === provider.id ? (
                                        <span className={styles.spinner}></span>
                                    ) : (
                                        "Connect"
                                    )}
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.info}>
                    <p>
                        💡 You can always change these settings later in <strong>Settings → Integrations</strong>
                    </p>
                </div>

                <div className={styles.actions}>
                    <button className={styles.skipBtn} onClick={handleSkip}>
                        Skip for now
                    </button>
                    <button
                        className={styles.continueBtn}
                        onClick={handleContinue}
                    >
                        {hasConnections ? "Continue" : "Continue without sync"}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
