"use client";

import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { useData } from "@/contexts/DataContext";
import styles from "./MonthView.module.css";

interface MonthViewProps {
    currentDate: Date;
    onDateClick?: (date: Date) => void;
}

export default function MonthView({ currentDate, onDateClick }: MonthViewProps) {
    const { events } = useData();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const handleDayClick = (day: Date) => {
        if (onDateClick) {
            onDateClick(day);
        }
    };

    return (
        <div className={styles.grid}>
            {/* Weekday Headers */}
            {weekDays.map((day) => (
                <div key={day} className={styles.headerCell}>
                    {day}
                </div>
            ))}

            {/* Calendar Days */}
            {days.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, monthStart);
                const dayEvents = events.filter((e) => isSameDay(new Date(e.start_time), day));

                return (
                    <div
                        key={day.toString()}
                        className={`${styles.cell} ${!isCurrentMonth ? styles.disabled : ""} ${styles.fadeIn} ${styles.clickable}`}
                        style={{ animationDelay: `${idx * 10}ms` }}
                        onClick={() => handleDayClick(day)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && handleDayClick(day)}
                    >
                        <div className={styles.cellHeader}>
                            <span className={`${styles.dayNumber} ${isToday(day) ? styles.today : ""}`}>
                                {format(day, "d")}
                            </span>
                        </div>

                        <div className={styles.events}>
                            {dayEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className={styles.event}
                                    style={{ backgroundColor: event.color }}
                                >
                                    {event.title}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

