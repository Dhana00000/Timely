"use client";

import styles from "./SpendingChart.module.css";

export default function SpendingChart() {
    const categories = [
        { name: "Food", amount: 342, color: "#f97316", percentage: 35 },
        { name: "Transport", amount: 189, color: "#3b82f6", percentage: 20 },
        { name: "Shopping", amount: 256, color: "#ec4899", percentage: 26 },
        { name: "Utilities", amount: 124, color: "#6366f1", percentage: 13 },
        { name: "Other", amount: 58, color: "#64748b", percentage: 6 },
    ];

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Spending by Category</h3>

            {/* Donut Chart Placeholder */}
            <div className={styles.chartWrapper}>
                <div className={styles.donut}>
                    <div className={styles.donutCenter}>
                        <span className={styles.totalLabel}>Total</span>
                        <span className={styles.totalAmount}>$969</span>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className={styles.legend}>
                {categories.map((cat) => (
                    <div key={cat.name} className={styles.legendItem}>
                        <div className={styles.legendColor} style={{ backgroundColor: cat.color }} />
                        <span className={styles.legendName}>{cat.name}</span>
                        <span className={styles.legendValue}>${cat.amount}</span>
                        <span className={styles.legendPercent}>{cat.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
