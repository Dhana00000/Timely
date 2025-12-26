"use client";

import { TrendingUp, TrendingDown, Clock, Zap } from "lucide-react";
import styles from "./QuickStats.module.css";

export default function QuickStats() {
    return (
        <div className={styles.container}>
            {/* Stat 1: Weekly Focus */}
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <Clock size={20} className={styles.icon} />
                </div>
                <div className={styles.content}>
                    <span className={styles.label}>Weekly Focus</span>
                    <span className={styles.value}>24h 15m</span>
                    <span className={`${styles.trend} ${styles.positive}`}>
                        <TrendingUp size={14} />
                        +12% vs last week
                    </span>
                </div>
            </div>

            {/* Stat 2: Spending */}
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <TrendingDown size={20} className={styles.icon} />
                </div>
                <div className={styles.content}>
                    <span className={styles.label}>Spending</span>
                    <span className={styles.value}>$342.50</span>
                    <span className={`${styles.trend} ${styles.positive}`}>
                        <TrendingDown size={14} />
                        -5% vs last week
                    </span>
                </div>
            </div>

            {/* Stat 3: Productivity */}
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <Zap size={20} className={styles.icon} />
                </div>
                <div className={styles.content}>
                    <span className={styles.label}>Productivity</span>
                    <span className={styles.value}>8.5/10</span>
                    <span className={`${styles.trend} ${styles.positive}`}>
                        <TrendingUp size={14} />
                        High Energy
                    </span>
                </div>
            </div>
        </div>
    );
}
