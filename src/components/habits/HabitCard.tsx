"use client";

import { Check, Flame, MoreHorizontal } from "lucide-react";
import styles from "./HabitCard.module.css";

interface Habit {
    id: string;
    name: string;
    icon: string;
    currentStreak: number;
    longestStreak: number;
    frequency: string;
    completedToday: boolean;
    color: string;
}

interface HabitCardProps {
    habit: Habit;
    isSelected: boolean;
    onSelect: () => void;
}

export default function HabitCard({ habit, isSelected, onSelect }: HabitCardProps) {
    return (
        <div
            className={`${styles.card} ${isSelected ? styles.selected : ""} ${habit.completedToday ? styles.completed : ""}`}
            onClick={onSelect}
        >
            <div className={styles.icon}>{habit.icon}</div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <span className={styles.name}>{habit.name}</span>
                    <button className={styles.moreBtn} onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal size={16} />
                    </button>
                </div>

                <div className={styles.streakRow}>
                    <div className={styles.streak}>
                        <Flame size={14} className={habit.currentStreak > 0 ? styles.flameActive : styles.flameInactive} />
                        <span>{habit.currentStreak} day streak</span>
                    </div>
                    <span className={styles.best}>Best: {habit.longestStreak}</span>
                </div>
            </div>

            <button
                className={`${styles.checkBtn} ${habit.completedToday ? styles.checked : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                {habit.completedToday && <Check size={18} />}
            </button>
        </div>
    );
}
