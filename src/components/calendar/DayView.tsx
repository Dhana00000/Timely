"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { useData } from "@/contexts/DataContext";
import EventDetailsModal from "../modals/EventDetailsModal";
import styles from "./DayView.module.css";

interface DayViewProps {
    currentDate: Date;
}

export default function DayView({ currentDate }: DayViewProps) {
    const { events: allEvents } = useData();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    // Filter events for the current date
    const events = allEvents
        .filter(event => isSameDay(new Date(event.start_time), currentDate))
        .map(event => ({
            ...event,
            start: new Date(event.start_time),
            end: new Date(event.end_time || event.start_time),
        }));

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
            <div className={styles.header}>
                <div className={styles.dateDisplay}>
                    <span className={styles.dayOfWeek}>{format(currentDate, "EEEE")}</span>
                    <span className={styles.date}>{format(currentDate, "MMMM d, yyyy")}</span>
                </div>
            </div>

            <div className={styles.scrollArea}>
                <div className={styles.grid}>
                    <div className={styles.timeColumn}>
                        {hours.map((hour) => (
                            <div key={hour} className={styles.timeLabel}>
                                {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                            </div>
                        ))}
                    </div>

                    <div className={styles.contentColumn}>
                        {hours.map((hour) => (
                            <div key={hour} className={styles.hourCell}></div>
                        ))}

                        {/* Render Events */}
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className={styles.event}
                                style={{
                                    ...getEventStyle(event.start, event.end),
                                    backgroundColor: event.color,
                                }}
                                onClick={() => setSelectedEvent(event)}
                            >
                                <div className={styles.eventTitle}>{event.title}</div>
                                <div className={styles.eventTime}>
                                    {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
                                </div>
                                {event.description && (
                                    <div className={styles.eventDesc}>{event.description}</div>
                                )}
                                {event.notes && (
                                    <div className={styles.eventNotes}>{event.notes}</div>
                                )}
                            </div>
                        ))}

                        {/* Current Time Indicator */}
                        <div
                            className={styles.currentTimeLine}
                            style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {selectedEvent && (
                <EventDetailsModal
                    isOpen={true}
                    onClose={() => setSelectedEvent(null)}
                    event={selectedEvent}
                />
            )}
        </div>
    );
}
