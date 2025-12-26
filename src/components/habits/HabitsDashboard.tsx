"use client";

import { useState } from "react";
import { Plus, Flame, Target, Calendar, TrendingUp } from "lucide-react";
import HabitCard from "./HabitCard";
import HabitCalendar from "./HabitCalendar";
import styles from "./HabitsDashboard.module.css";

export default function HabitsDashboard() {
    const [selectedHabit, setSelectedHabit] = useState<string | null>(null);

    const habits = [
        { id: "1", name: "Morning Workout", icon: "💪", currentStreak: 12, longestStreak: 24, frequency: "daily", completedToday: true, color: "#f59e0b" },
        { id: "2", name: "Read 30 mins", icon: "📚", currentStreak: 8, longestStreak: 15, frequency: "daily", completedToday: false, color: "#3b82f6" },
        { id: "3", name: "Meditation", icon: "🧘", currentStreak: 3, longestStreak: 10, frequency: "daily", completedToday: false, color: "#8b5cf6" },
        { id: "4", name: "Drink Water", icon: "💧", currentStreak: 24, longestStreak: 30, frequency: "daily", completedToday: true, color: "#06b6d4" },
        { id: "5", name: "Journal", icon: "✍️", currentStreak: 5, longestStreak: 14, frequency: "daily", completedToday: false, color: "#ec4899" },
        { id: "6", name: "No Social Media", icon: "📵", currentStreak: 2, longestStreak: 7, frequency: "daily", completedToday: true, color: "#10b981" },
    ];

    const stats = {
        totalHabits: habits.length,
        completedToday: habits.filter(h => h.completedToday).length,
        totalStreak: habits.reduce((sum, h) => sum + h.currentStreak, 0),
        bestStreak: Math.max(...habits.map(h => h.longestStreak)),
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Habits</h1>
                    <p className={styles.subtitle}>Build routines, track streaks</p>
                </div>
                <button className={styles.addBtn}>
                    <Plus size={18} />
                    New Habit
                </button>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconTarget}`}>
                        <Target size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.completedToday}/{stats.totalHabits}</span>
                        <span className={styles.statLabel}>Completed Today</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconFlame}`}>
                        <Flame size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.totalStreak}</span>
                        <span className={styles.statLabel}>Total Streak Days</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconTrend}`}>
                        <TrendingUp size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.bestStreak} days</span>
                        <span className={styles.statLabel}>Best Streak</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconCalendar}`}>
                        <Calendar size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>85%</span>
                        <span className={styles.statLabel}>Weekly Completion</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.content}>
                {/* Habits List */}
                <div className={styles.habitsSection}>
                    <h2 className={styles.sectionTitle}>Your Habits</h2>
                    <div className={styles.habitsList}>
                        {habits.map((habit) => (
                            <HabitCard
                                key={habit.id}
                                habit={habit}
                                isSelected={selectedHabit === habit.id}
                                onSelect={() => setSelectedHabit(habit.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Calendar View */}
                <div className={styles.calendarSection}>
                    <h2 className={styles.sectionTitle}>Activity</h2>
                    <HabitCalendar selectedHabit={selectedHabit} />
                </div>
            </div>
        </div>
    );
}
