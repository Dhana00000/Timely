"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/contexts/DataContext";
import { Check, Flame, Plus } from "lucide-react";
import styles from "./HabitProgress.module.css";

export default function HabitProgress() {
    const router = useRouter();
    const { habits, toggleHabit } = useData();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Habit Tracker</h3>
                <button className={styles.addBtn} onClick={() => router.push("/habits")}>
                    <Plus size={16} />
                </button>
            </div>

            <div className={styles.list}>
                {habits.slice(0, 4).map((habit) => (
                    <div key={habit.id} className={`${styles.item} ${habit.completed ? styles.completed : ''}`}>
                        <div className={styles.icon}>{habit.icon}</div>

                        <div className={styles.content}>
                            <span className={styles.name}>{habit.name}</span>
                            <div className={styles.streak}>
                                <Flame size={12} className={habit.completed ? styles.flameActive : styles.flameInactive} />
                                <span>{habit.streak} day streak</span>
                            </div>
                        </div>

                        <button
                            className={`${styles.checkBtn} ${habit.completed ? styles.checked : ''}`}
                            onClick={() => toggleHabit(habit.id)}
                            aria-label={`Mark ${habit.name} as ${habit.completed ? 'incomplete' : 'done'}`}
                        >
                            {habit.completed && <Check size={16} />}
                        </button>
                    </div>
                ))}
            </div>

            <button className={styles.viewAllBtn} onClick={() => router.push("/habits")}>
                View All Habits
            </button>
        </div>
    );
}
