"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, ChevronRight } from "lucide-react";
import styles from "./DiscoveryWidget.module.css";

interface HistoricalEvent {
    year: string;
    text: string;
    category: string;
}

export default function DiscoveryWidget() {
    const [event, setEvent] = useState<HistoricalEvent | null>(null);
    const [dismissed, setDismissed] = useState(false);
    const [loading, setLoading] = useState(true);

    // Historical events for today (December 23)
    const historicalEvents: HistoricalEvent[] = [
        { year: "1888", text: "Vincent van Gogh cuts off part of his ear in Arles, France", category: "Arts" },
        { year: "1947", text: "The transistor is first demonstrated at Bell Labs", category: "Tech" },
        { year: "1972", text: "The 6.2 magnitude earthquake strikes Managua, Nicaragua", category: "History" },
        { year: "1986", text: "The Voyager aircraft completes first non-stop flight around the world", category: "Aviation" },
    ];

    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 300));
            // Random event each load
            const randomIndex = Math.floor(Math.random() * historicalEvents.length);
            setEvent(historicalEvents[randomIndex]);
            setLoading(false);
        };
        fetchEvent();
    }, []);

    if (dismissed || loading) return null;

    const today = new Date();
    const dateString = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return (
        <div className={styles.notification}>
            <div className={styles.iconWrapper}>
                <Sparkles size={14} />
            </div>

            <div className={styles.content}>
                <span className={styles.label}>On this day in {event?.year}</span>
                <p className={styles.text}>{event?.text}</p>
            </div>

            <a
                href={`https://en.wikipedia.org/wiki/${dateString.replace(" ", "_")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.learnBtn}
            >
                <ChevronRight size={16} />
            </a>

            <button className={styles.dismissBtn} onClick={() => setDismissed(true)}>
                <X size={14} />
            </button>
        </div>
    );
}
