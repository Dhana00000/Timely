"use client";

import { TrendingUp, Clock, DollarSign, Target, Calendar, Zap } from "lucide-react";
import styles from "./AnalyticsDashboard.module.css";

export default function AnalyticsDashboard() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Analytics</h1>
                <p className={styles.subtitle}>Your productivity insights</p>
            </div>

            {/* Overview Cards */}
            <div className={styles.overviewGrid}>
                <div className={styles.overviewCard}>
                    <div className={`${styles.cardIcon} ${styles.iconTime}`}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.cardContent}>
                        <span className={styles.cardLabel}>Focus Time</span>
                        <span className={styles.cardValue}>24h 15m</span>
                        <span className={styles.cardTrend}>+12% this week</span>
                    </div>
                </div>

                <div className={styles.overviewCard}>
                    <div className={`${styles.cardIcon} ${styles.iconMoney}`}>
                        <DollarSign size={24} />
                    </div>
                    <div className={styles.cardContent}>
                        <span className={styles.cardLabel}>Monthly Spend</span>
                        <span className={styles.cardValue}>$1,247</span>
                        <span className={styles.cardTrend}>-5% vs last month</span>
                    </div>
                </div>

                <div className={styles.overviewCard}>
                    <div className={`${styles.cardIcon} ${styles.iconHabits}`}>
                        <Target size={24} />
                    </div>
                    <div className={styles.cardContent}>
                        <span className={styles.cardLabel}>Habit Completion</span>
                        <span className={styles.cardValue}>85%</span>
                        <span className={styles.cardTrend}>+8% this week</span>
                    </div>
                </div>

                <div className={styles.overviewCard}>
                    <div className={`${styles.cardIcon} ${styles.iconEvents}`}>
                        <Calendar size={24} />
                    </div>
                    <div className={styles.cardContent}>
                        <span className={styles.cardLabel}>Events Attended</span>
                        <span className={styles.cardValue}>47</span>
                        <span className={styles.cardTrend}>This month</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Weekly Activity</h3>
                    <div className={styles.barChart}>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                            <div key={day} className={styles.barColumn}>
                                <div
                                    className={styles.bar}
                                    style={{ height: `${[65, 80, 45, 90, 70, 40, 55][i]}%` }}
                                />
                                <span className={styles.barLabel}>{day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Time Distribution</h3>
                    <div className={styles.pieChart}>
                        <div className={styles.pieCenter}>
                            <Zap size={24} />
                            <span>40h</span>
                        </div>
                    </div>
                    <div className={styles.pieLegend}>
                        <div className={styles.legendItem}>
                            <div className={styles.legendDot} style={{ background: "#6366f1" }} />
                            <span>Work (60%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={styles.legendDot} style={{ background: "#10b981" }} />
                            <span>Personal (25%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={styles.legendDot} style={{ background: "#f59e0b" }} />
                            <span>Health (15%)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className={styles.insightsCard}>
                <h3 className={styles.insightsTitle}>
                    <TrendingUp size={20} />
                    Insights
                </h3>
                <div className={styles.insightsList}>
                    <div className={styles.insight}>
                        <span className={styles.insightEmoji}>🎯</span>
                        <p>Your most productive day is <strong>Thursday</strong> with 90% task completion.</p>
                    </div>
                    <div className={styles.insight}>
                        <span className={styles.insightEmoji}>💰</span>
                        <p>You've saved <strong>$127</strong> compared to last month. Keep it up!</p>
                    </div>
                    <div className={styles.insight}>
                        <span className={styles.insightEmoji}>🔥</span>
                        <p>You're on a <strong>12-day streak</strong> with your morning workout!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
