"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, DollarSign, Target, TrendingUp, AlertCircle } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import styles from "./TodayWidget.module.css";

export default function TodayWidget() {
    const router = useRouter();
    const { events, habits, expenses, loading } = useData();

    // Calculate real data from context
    const todayData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Filter today's events
        const todayEvents = events.filter((e) => {
            const eventDate = new Date(e.start_time);
            return eventDate >= today && eventDate < tomorrow;
        });

        // Sort by start time to get next meeting
        const sortedEvents = [...todayEvents].sort(
            (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );

        // Find next upcoming event
        const now = new Date();
        const upcomingEvent = sortedEvents.find((e) => new Date(e.start_time) > now);
        const nextMeeting = upcomingEvent
            ? `${upcomingEvent.title} at ${new Date(upcomingEvent.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
            : "No more events today";

        // Count deadlines (events with "deadline" or "due" in title)
        const deadlines = todayEvents.filter((e) =>
            e.title.toLowerCase().includes("deadline") || e.title.toLowerCase().includes("due")
        );
        const deadlineText = deadlines.length > 0
            ? `${deadlines[0].title}`
            : "No deadlines today";

        // Calculate habits completion
        const todayStr = today.toISOString().split("T")[0];
        const completedHabits = habits.filter((h) => h.completed);
        const pendingHabits = habits.filter((h) => !h.completed);
        const habitsDue = pendingHabits.slice(0, 2).map((h) => h.name);

        // Calculate expenses for today
        const todayExpenses = expenses.filter((e) => {
            const expDate = new Date(e.date);
            return expDate >= today && expDate < tomorrow;
        });
        const totalSpent = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

        // Calculate who owes based on expense types
        const owedToYou = expenses
            .filter((e) => e.type === "income" || e.description?.toLowerCase().includes("owed"))
            .reduce((sum, e) => sum + (e.amount || 0), 0);
        const youOwe = expenses
            .filter((e) => e.type === "expense" && e.description?.toLowerCase().includes("owe"))
            .reduce((sum, e) => sum + (e.amount || 0), 0);

        // Calculate focus time (events with "focus" in title or all-day events as percentage)
        const focusEvents = todayEvents.filter((e) =>
            e.title.toLowerCase().includes("focus") || e.is_all_day
        );
        const focusTime = todayEvents.length > 0
            ? Math.round((focusEvents.length / Math.max(todayEvents.length, 3)) * 100)
            : 0;

        return {
            meetings: todayEvents.length,
            nextMeeting,
            deadlines: deadlines.length,
            deadline: deadlineText,
            habits: { completed: completedHabits.length, total: habits.length },
            habitsDue: habitsDue.length > 0 ? habitsDue : ["No habits pending"],
            youOwe,
            owedToYou,
            focusTime,
            totalSpent,
        };
    }, [events, habits, expenses]);

    if (loading) {
        return (
            <div className={styles.widget}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Today at a Glance</h2>
                </div>
                <div className={styles.loading}>Loading your data...</div>
            </div>
        );
    }

    return (
        <div className={styles.widget}>
            <div className={styles.header}>
                <h2 className={styles.title}>Today at a Glance</h2>
                <span className={styles.badge}>
                    <TrendingUp size={14} />
                    {todayData.focusTime}% Focus Time
                </span>
            </div>

            <div className={styles.grid}>
                {/* Meetings */}
                <div className={styles.item} onClick={() => router.push("/calendar")}>
                    <div className={`${styles.icon} ${styles.iconBlue}`}>
                        <Calendar size={18} />
                    </div>
                    <div className={styles.content}>
                        <span className={styles.value}>
                            {todayData.meetings} {todayData.meetings === 1 ? "event" : "events"}
                        </span>
                        <span className={styles.label}>Next: {todayData.nextMeeting}</span>
                    </div>
                </div>

                {/* Deadlines */}
                <div className={styles.item} onClick={() => router.push("/calendar")}>
                    <div className={`${styles.icon} ${styles.iconRed}`}>
                        <AlertCircle size={18} />
                    </div>
                    <div className={styles.content}>
                        <span className={styles.value}>
                            {todayData.deadlines} {todayData.deadlines === 1 ? "deadline" : "deadlines"}
                        </span>
                        <span className={styles.label}>{todayData.deadline}</span>
                    </div>
                </div>

                {/* Habits */}
                <div className={styles.item} onClick={() => router.push("/habits")}>
                    <div className={`${styles.icon} ${styles.iconGreen}`}>
                        <Target size={18} />
                    </div>
                    <div className={styles.content}>
                        <span className={styles.value}>
                            {todayData.habits.completed}/{todayData.habits.total} habits
                        </span>
                        <span className={styles.label}>
                            Due: {todayData.habitsDue.join(", ")}
                        </span>
                    </div>
                </div>

                {/* Money */}
                <div className={styles.item} onClick={() => router.push("/expenses")}>
                    <div className={`${styles.icon} ${styles.iconPurple}`}>
                        <DollarSign size={18} />
                    </div>
                    <div className={styles.content}>
                        <span className={styles.value}>
                            ${todayData.totalSpent.toFixed(2)} spent today
                        </span>
                        <span className={styles.label}>
                            Total expenses: ${expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={() => router.push("/calendar")}>
                    View Calendar
                </button>
                <button className={styles.actionBtn} onClick={() => router.push("/calendar")}>
                    Add Event
                </button>
                <button className={styles.actionBtnPrimary} onClick={() => router.push("/expenses")}>
                    Log Expense
                </button>
            </div>
        </div>
    );
}
