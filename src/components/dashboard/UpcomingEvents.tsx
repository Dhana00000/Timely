"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/contexts/DataContext";
import { MapPin, Video, MoreHorizontal, Clock } from "lucide-react";
import styles from "./UpcomingEvents.module.css";

export default function UpcomingEvents() {
    const router = useRouter();
    const { events } = useData();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Format events for display
    const upcomingEvents = events.slice(0, 3).map(event => ({
        ...event,
        time: mounted ? new Date(event.start_time).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }) + (event.end_time ? ` - ${new Date(event.end_time).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        })}` : "") : "Loading...",
        type: event.location?.toLowerCase().includes("zoom") || event.location?.toLowerCase().includes("meet") ? "video" : "in-person",
    }));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Upcoming Events</h3>
                <button className={styles.moreBtn} onClick={() => router.push("/calendar")}>
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className={styles.list}>
                {upcomingEvents.length === 0 ? (
                    <div className={styles.empty}>
                        <Clock size={24} />
                        <p>No upcoming events</p>
                    </div>
                ) : (
                    upcomingEvents.map((event) => (
                        <div
                            key={event.id}
                            className={styles.event}
                            onClick={() => router.push("/calendar")}
                        >
                            <div
                                className={styles.timeBar}
                                style={{ backgroundColor: event.color }}
                            />
                            <div className={styles.content}>
                                <div className={styles.eventHeader}>
                                    <h4 className={styles.eventTitle}>{event.title}</h4>
                                    <span className={styles.time}>{event.time}</span>
                                </div>
                                <div className={styles.details}>
                                    <div className={styles.location}>
                                        {event.type === "video" ? (
                                            <Video size={14} />
                                        ) : (
                                            <MapPin size={14} />
                                        )}
                                        <span>{event.location || "No location"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button className={styles.viewAllBtn} onClick={() => router.push("/calendar")}>
                View Full Calendar
            </button>
        </div>
    );
}
