"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

interface CalendarProvider {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
    connected: boolean;
    lastSync?: string;
    syncing?: boolean;
    error?: string;
}

function SettingsContent() {
    const router = useRouter();
    const { user, session, signInWithGoogle } = useAuth();
    const { refreshData } = useData();
    const [activeTab, setActiveTab] = useState("integrations");
    const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
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
            description: "Sync events bidirectionally with Google Calendar",
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
            description: "Sync events bidirectionally with Outlook Calendar",
            connected: false,
        },
    ]);

    // Check if user is connected via Google
    useEffect(() => {
        const checkGoogleConnection = async () => {
            if (session?.provider_token) {
                // User has a Google OAuth token - mark as connected
                setProviders(prev => prev.map(p =>
                    p.id === "google" ? { ...p, connected: true } : p
                ));
            }
        };
        checkGoogleConnection();
    }, [session]);

    const handleConnect = async (providerId: string) => {
        if (providerId === "google") {
            // Trigger Google OAuth with calendar scopes
            await signInWithGoogle();
        }
    };

    const handleDisconnect = (providerId: string) => {
        setProviders(prev => prev.map(p =>
            p.id === providerId ? { ...p, connected: false, lastSync: undefined } : p
        ));
    };

    const handleSync = async (providerId: string) => {
        if (providerId !== "google" || !user) return;

        // Set syncing state
        setProviders(prev => prev.map(p =>
            p.id === providerId ? { ...p, syncing: true, error: undefined } : p
        ));
        setSyncMessage(null);

        try {
            // Try to get token from localStorage first (stored on initial OAuth)
            // Fall back to session token if available
            let accessToken = localStorage.getItem('google_provider_token');

            if (!accessToken) {
                // Try getting from current session (only works immediately after login)
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                accessToken = currentSession?.provider_token || null;
            }

            if (!accessToken) {
                throw new Error("No access token available. Please sign out and sign back in with Google to grant calendar permissions.");
            }

            // Call sync API
            const response = await fetch("/api/calendar/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    accessToken: accessToken,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Sync failed");
            }

            // Update last sync time
            setProviders(prev => prev.map(p =>
                p.id === providerId ? { ...p, lastSync: "Just now", syncing: false } : p
            ));

            setSyncMessage({ type: 'success', text: result.message || `Synced ${result.synced} events` });

            // Refresh data to show new events
            await refreshData();
        } catch (error) {
            console.error("Sync error:", error);
            setProviders(prev => prev.map(p =>
                p.id === providerId ? {
                    ...p,
                    syncing: false,
                    error: error instanceof Error ? error.message : "Sync failed"
                } : p
            ));
            setSyncMessage({
                type: 'error',
                text: error instanceof Error ? error.message : "Failed to sync calendar"
            });
        }
    };

    return (
        <DashboardLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className={styles.title}>Settings</h1>
                </header>

                <div className={styles.layout}>
                    <nav className={styles.nav}>
                        <button
                            className={`${styles.navItem} ${activeTab === "integrations" ? styles.active : ""}`}
                            onClick={() => setActiveTab("integrations")}
                        >
                            <Calendar size={18} />
                            Integrations
                        </button>
                    </nav>

                    <main className={styles.content}>
                        {activeTab === "integrations" && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>Calendar Integrations</h2>
                                <p className={styles.sectionDesc}>
                                    Connect your calendars for bidirectional sync. Events created in Timely will appear in your connected calendars, and vice versa.
                                </p>

                                {syncMessage && (
                                    <div className={`${styles.syncMessage} ${syncMessage.type === 'error' ? styles.error : styles.success}`}>
                                        {syncMessage.type === 'error' && <AlertCircle size={16} />}
                                        {syncMessage.text}
                                    </div>
                                )}

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
                                                {provider.connected && provider.lastSync && (
                                                    <span className={styles.lastSync}>
                                                        Last synced: {provider.lastSync}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.providerActions}>
                                                {provider.connected ? (
                                                    <>
                                                        <button
                                                            className={`${styles.syncBtn} ${provider.syncing ? styles.syncing : ''}`}
                                                            onClick={() => handleSync(provider.id)}
                                                            title="Sync now"
                                                            disabled={provider.syncing}
                                                        >
                                                            <RefreshCw size={16} className={provider.syncing ? styles.spinning : ''} />
                                                        </button>
                                                        <button
                                                            className={styles.disconnectBtn}
                                                            onClick={() => handleDisconnect(provider.id)}
                                                        >
                                                            Disconnect
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className={styles.connectBtn}
                                                        onClick={() => handleConnect(provider.id)}
                                                    >
                                                        Connect
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.helpBox}>
                                    <h4>How does bidirectional sync work?</h4>
                                    <ul>
                                        <li>Events you create in Timely appear in your connected calendars</li>
                                        <li>Events from your calendars appear in Timely</li>
                                        <li>Changes sync automatically within minutes</li>
                                        <li>Deleting an event in either place removes it from both</li>
                                    </ul>
                                </div>
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function SettingsPage() {
    return (
        <AuthGuard>
            <SettingsContent />
        </AuthGuard>
    );
}
