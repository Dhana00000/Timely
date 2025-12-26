"use client";

import { useRouter } from "next/navigation";
import { useData } from "@/contexts/DataContext";
import { DollarSign, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import styles from "./RecentExpenses.module.css";

export default function RecentExpenses() {
    const router = useRouter();
    const { expenses } = useData();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Recent Activity</h3>
                <button className={styles.addBtn} onClick={() => router.push("/expenses")}>
                    <DollarSign size={16} />
                </button>
            </div>

            <div className={styles.list}>
                {expenses.slice(0, 4).map((expense) => (
                    <div
                        key={expense.id}
                        className={styles.item}
                        onClick={() => router.push("/expenses")}
                        style={{ cursor: "pointer" }}
                    >
                        <div className={`${styles.icon} ${expense.type === 'income' ? styles.incomeIcon : styles.expenseIcon}`}>
                            {expense.type === 'income' ? (
                                <ArrowDownLeft size={16} />
                            ) : (
                                <ArrowUpRight size={16} />
                            )}
                        </div>
                        <div className={styles.content}>
                            <span className={styles.description}>{expense.description}</span>
                            <span className={styles.meta}>{expense.date} • {expense.category}</span>
                        </div>
                        <span className={`${styles.amount} ${expense.type === 'income' ? styles.income : ''}`}>
                            {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            <button className={styles.viewAllBtn} onClick={() => router.push("/expenses")}>
                View Spending Report
            </button>
        </div>
    );
}
