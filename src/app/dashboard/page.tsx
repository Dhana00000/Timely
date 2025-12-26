"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import LumiInlineChat from "@/components/lumi/LumiInlineChat";
import DiscoveryWidget from "@/components/dashboard/DiscoveryWidget";
import TodayWidget from "@/components/dashboard/TodayWidget";
import QuickStats from "@/components/dashboard/QuickStats";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import RecentExpenses from "@/components/dashboard/RecentExpenses";
import HabitProgress from "@/components/dashboard/HabitProgress";
import { useUserName } from "@/contexts/AuthContext";
import styles from "./page.module.css";

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

export default function DashboardPage() {
    const userName = useUserName();

    return (
        <DashboardLayout>
            <div className={styles.dashboard}>
                {/* Header - Greeting First */}
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.greeting}>{getGreeting()}, {userName} 👋</h1>
                        <p className={styles.date}>
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </header>

                {/* Lumi AI Chat */}
                <LumiInlineChat />

                {/* Discovery - This Day in History */}
                <DiscoveryWidget />

                {/* Today At A Glance */}
                <TodayWidget />

                {/* Quick Stats */}
                <QuickStats />

                {/* Main Grid */}
                <div className={styles.grid}>
                    <UpcomingEvents />
                    <RecentExpenses />
                    <HabitProgress />
                </div>
            </div>
        </DashboardLayout>
    );
}
