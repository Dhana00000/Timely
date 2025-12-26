"use client";

import { MoreHorizontal, Coffee, Car, ShoppingBag, Utensils, Zap, Heart } from "lucide-react";
import styles from "./ExpenseList.module.css";

const categoryIcons: Record<string, React.ReactNode> = {
    food: <Utensils size={16} />,
    transport: <Car size={16} />,
    shopping: <ShoppingBag size={16} />,
    coffee: <Coffee size={16} />,
    utilities: <Zap size={16} />,
    health: <Heart size={16} />,
};

const categoryColors: Record<string, string> = {
    food: "#f97316",
    transport: "#3b82f6",
    shopping: "#ec4899",
    coffee: "#a855f7",
    utilities: "#6366f1",
    health: "#10b981",
};

export default function ExpenseList() {
    const expenses = [
        { id: 1, description: "Grocery Shopping", amount: 67.50, category: "food", date: "Today", paidBy: "You", splitWith: "Sarah" },
        { id: 2, description: "Uber to Airport", amount: 42.00, category: "transport", date: "Yesterday", paidBy: "You", splitWith: null },
        { id: 3, description: "Coffee Meeting", amount: 18.50, category: "coffee", date: "Dec 21", paidBy: "John", splitWith: "You" },
        { id: 4, description: "Amazon Order", amount: 89.99, category: "shopping", date: "Dec 20", paidBy: "You", splitWith: null },
        { id: 5, description: "Electric Bill", amount: 124.00, category: "utilities", date: "Dec 19", paidBy: "You", splitWith: "Roommates" },
        { id: 6, description: "Gym Membership", amount: 49.00, category: "health", date: "Dec 18", paidBy: "You", splitWith: null },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Recent Expenses</h3>
                <button className={styles.moreBtn}>
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className={styles.list}>
                {expenses.map((expense) => (
                    <div key={expense.id} className={styles.item}>
                        <div
                            className={styles.icon}
                            style={{ backgroundColor: `${categoryColors[expense.category]}20`, color: categoryColors[expense.category] }}
                        >
                            {categoryIcons[expense.category]}
                        </div>

                        <div className={styles.details}>
                            <span className={styles.description}>{expense.description}</span>
                            <span className={styles.meta}>
                                {expense.date} • {expense.paidBy === "You" ? "Paid by you" : `Paid by ${expense.paidBy}`}
                                {expense.splitWith && ` • Split with ${expense.splitWith}`}
                            </span>
                        </div>

                        <div className={styles.amountWrapper}>
                            <span className={styles.amount}>
                                ${expense.amount.toFixed(2)}
                            </span>
                            {expense.splitWith && (
                                <span className={styles.splitBadge}>Split</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
