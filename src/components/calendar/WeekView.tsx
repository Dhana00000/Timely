"use client";

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from "date-fns";
import { useData } from "@/contexts/DataContext";
import styles from "./WeekView.module.css";

interface WeekViewProps {
    currentDate: Date;
}

export default function WeekView({ currentDate }: WeekViewProps) {
    const { events: allEvents } = useData();
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Helper function to get event style
    const getEventStyle = (start: Date, end: Date) => {
        const startHour = start.getHours() + start.getMinutes() / 60;
        const endHour = end.getHours() + end.getMinutes() / 60;
        const duration = endHour - startHour;

        return {
            top: `${startHour * 50}px`,
            height: `${duration * 50}px`,
        };
    };

    return (
        <div className={styles.container}>
            {/* Header Row */}
            <div className={styles.headerRow}>
                <div className={styles.timeColumnHeader} />
                {days.map((day) => (
                    <div
                        key={day.toString()}
                        className={`${styles.dayHeader} ${isToday(day) ? styles.todayHeader : ""}`}
                    >
                        <span className={styles.dayName}>{format(day, "EEE")}</span>
                        <span className={styles.dayDate}>{format(day, "d")}</span>
                    </div>
                ))}
            </div>

            {/* Scrollable Grid */}
            <div className={styles.scrollArea}>
                <div className={styles.grid}>
                    {/* Time Column */}
                    <div className={styles.timeColumn}>
                        {hours.map((hour) => (
                            <div key={hour} className={styles.timeLabel}>
                                {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    {days.map((day) => {
                        // Filter events for this day
                        const dayEvents = allEvents
                            .filter(event => isSameDay(new Date(event.start_time), day))
                            .map(event => ({
                                id: event.id,
                                title: event.title,
                                start: new Date(event.start_time),
                                end: new Date(event.end_time || event.start_time),
                                color: event.color || "#6366f1",
                            }));

                        return (
                            <div key={day.toString()} className={styles.dayColumn}>
                                {hours.map((hour) => (
                                    <div key={hour} className={styles.hourCell}></div>
                                ))}

                                {/* Render Events */}
                                {dayEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className={styles.event}
                                        style={{
                                            ...getEventStyle(event.start, event.end),
                                            backgroundColor: event.color,
                                        }}
                                    >
                                        <div className={styles.eventTitle}>{event.title}</div>
                                    </div>
                                ))}

                                {/* Current Time Indicator (if today) */}
                                {isToday(day) && (
                                    <div
                                        className={styles.currentTimeLine}
                                        style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60) * 100}%` }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
