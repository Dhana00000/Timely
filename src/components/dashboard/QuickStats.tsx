"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Clock, Zap } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import styles from "./QuickStats.module.css";

export default function QuickStats() {
    const { events, habits, expenses, loading } = useData();

    const stats = useMemo(() => {
        // Calculate weekly focus (hours spent in events this week)
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const thisWeekEvents = events.filter((e) => {
            const eventDate = new Date(e.start_time);
            return eventDate >= weekAgo && eventDate <= now;
        });

        // Estimate focus hours (assume 1hr per event if no end_time)
        let focusMinutes = 0;
        thisWeekEvents.forEach((e) => {
            if (e.end_time && e.start_time) {
                const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / 60000;
                focusMinutes += Math.min(duration, 480); // Cap at 8 hours per event
            } else {
                focusMinutes += 60; // Default 1 hour
            }
        });

        const focusHours = Math.floor(focusMinutes / 60);
        const focusMins = Math.round(focusMinutes % 60);

        // Calculate weekly spending
        const thisWeekExpenses = expenses.filter((e) => {
            const expDate = new Date(e.date);
            return expDate >= weekAgo && expDate <= now;
        });
        const totalSpending = thisWeekExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

        // Calculate productivity (events completed + habits completed)
        const completedHabits = habits.filter((h) => h.completed).length;
        const totalHabits = habits.length;
        const habitScore = totalHabits > 0 ? (completedHabits / totalHabits) * 10 : 5;
        const eventScore = Math.min(thisWeekEvents.length / 5, 1) * 10; // Max 10 events per week = full score
        const productivity = Math.round(((habitScore + eventScore) / 2) * 10) / 10;

        return {
            focusHours,
            focusMins,
            totalSpending,
            productivity,
            eventsThisWeek: thisWeekEvents.length,
            expensesCount: thisWeekExpenses.length,
            habitsCompleted: completedHabits,
            totalHabits,
        };
    }, [events, habits, expenses]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.content}>
                        <span className={styles.label}>Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Stat 1: Weekly Focus */}
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <Clock size={20} className={styles.icon} />
                </div>
                <div className={styles.content}>
                    <span className={styles.label}>Weekly Focus</span>
                    <span className={styles.value}>
                        {stats.focusHours}h {stats.focusMins}m
                    </span>
                    <span className={`${styles.trend} ${styles.positive}`}>
                        <TrendingUp size={14} />
                        {stats.eventsThisWeek} events this week
                    </span>
                </div>
            </div>

            {/* Stat 2: Spending */}
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <TrendingDown size={20} className={styles.icon} />
                </div>
                <div className={styles.content}>
                    <span className={styles.label}>Spending</span>
                    <span className={styles.value}>${stats.totalSpending.toFixed(2)}</span>
                    <span className={`${styles.trend} ${stats.totalSpending > 0 ? styles.negative : styles.positive}`}>
                        <TrendingDown size={14} />
                        {stats.expensesCount} expenses logged
                    </span>
                </div>
            </div>

            {/* Stat 3: Productivity */}
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <Zap size={20} className={styles.icon} />
                </div>
                <div className={styles.content}>
                    <span className={styles.label}>Productivity</span>
                    <span className={styles.value}>{stats.productivity}/10</span>
                    <span className={`${styles.trend} ${stats.productivity >= 5 ? styles.positive : styles.negative}`}>
                        <TrendingUp size={14} />
                        {stats.habitsCompleted}/{stats.totalHabits} habits done
                    </span>
                </div>
            </div>
        </div>
    );
}
