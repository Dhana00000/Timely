"use client";

import { useRouter } from "next/navigation";
import { Calendar, DollarSign, Target, TrendingUp, AlertCircle } from "lucide-react";
import styles from "./TodayWidget.module.css";

export default function TodayWidget() {
    const router = useRouter();

    // Mock data - would come from API in production
    const todayData = {
        meetings: 3,
        nextMeeting: "Client call at 2:00 PM",
        deadlines: 1,
        deadline: "Project due at 5:00 PM",
        habits: { completed: 1, total: 3 },
        habitsDue: ["Gym 7 AM", "Reading 8 PM"],
        youOwe: 89.75,
        owedToYou: 234.50,
        focusTime: 70,
    };

    return (
        <div className={styles.widget}>
            <div className={styles.header}>
                <h2 className={styles.title}>Today at a Glance</h2>
                <span className={styles.badge}>
                    <TrendingUp size={14} />
                    {todayData.focusTime}% Focus Time
                </span>
            </div>

            <div className={styles.grid}>
                {/* Meetings */}
                <div className={styles.item} onClick={() => router.push("/calendar")}>
                    <div className={`${styles.icon} ${styles.iconBlue}`}>
                        <Calendar size={18} />
                    </div>
                    <div className={styles.content}>
                        <span className={styles.value}>{todayData.meetings} meetings</span>
                        <span className={styles.label}>Next: {todayData.nextMeeting}</span>
                    </div>
                </div>

                {/* Deadlines */}
                <div className={styles.item} onClick={() => router.push("/calendar")}>
                    <div className={`${styles.icon} ${styles.iconRed}`}>
                        <AlertCircle size={18} />
                    </div>
                    <div className={styles.content}>
                        <span className={styles.value}>{todayData.deadlines} deadline</span>
                        <span className={styles.label}>{todayData.deadline}</span>
                    </div>
                </div>

                {/* Habits */}
                <div className={styles.item} onClick={() => router.push("/habits")}>
                    <div className={`${styles.icon} ${styles.iconGreen}`}>
                        <Target size={18} />
                    </div>
                    <div className={styles.content}>
                        <span className={styles.value}>
                            {todayData.habits.completed}/{todayData.habits.total} habits
                        </span>
                        <span className={styles.label}>
                            Due: {todayData.habitsDue.join(", ")}
                        </span>
                    </div>
                </div>

                {/* Money */}
                <div className={styles.item} onClick={() => router.push("/expenses")}>
                    <div className={`${styles.icon} ${styles.iconPurple}`}>
                        <DollarSign size={18} />
                    </div>
                    <div className={styles.content}>
                        <span className={styles.value}>
                            ${todayData.owedToYou.toFixed(2)} owed to you
                        </span>
                        <span className={styles.label}>
                            You owe: ${todayData.youOwe.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={() => router.push("/calendar")}>
                    View Calendar
                </button>
                <button className={styles.actionBtn} onClick={() => router.push("/calendar")}>
                    Add Event
                </button>
                <button className={styles.actionBtnPrimary} onClick={() => router.push("/expenses")}>
                    Quick Pay
                </button>
            </div>
        </div>
    );
}
