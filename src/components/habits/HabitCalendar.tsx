"use client";

import styles from "./HabitCalendar.module.css";

interface HabitCalendarProps {
    selectedHabit: string | null;
}

export default function HabitCalendar({ selectedHabit }: HabitCalendarProps) {
    // Generate last 35 days (5 weeks)
    const days = Array.from({ length: 35 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (34 - i));
        return {
            date,
            completed: Math.random() > 0.3, // Mock data
        };
    });

    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

    return (
        <div className={styles.container}>
            {/* Week day labels */}
            <div className={styles.weekLabels}>
                {weekDays.map((day, i) => (
                    <span key={i} className={styles.weekLabel}>{day}</span>
                ))}
            </div>

            {/* Calendar grid */}
            <div className={styles.grid}>
                {days.map((day, i) => (
                    <div
                        key={i}
                        className={`${styles.day} ${day.completed ? styles.completed : styles.missed}`}
                        title={day.date.toLocaleDateString()}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.completed}`} />
                    <span>Completed</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.missed}`} />
                    <span>Missed</span>
                </div>
            </div>

            {!selectedHabit && (
                <p className={styles.hint}>Select a habit to see detailed history</p>
            )}
        </div>
    );
}
