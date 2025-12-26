"use client";

import { useState } from "react";
import { Plus, Filter, TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react";
import ExpenseList from "./ExpenseList";
import WhoOwesWhom from "./WhoOwesWhom";
import SpendingChart from "./SpendingChart";
import AddExpenseModal from "./AddExpenseModal";
import styles from "./ExpensesDashboard.module.css";

export default function ExpensesDashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"expenses" | "balances">("expenses");

    // Mock summary data
    const summary = {
        totalSpent: 1247.50,
        monthlyBudget: 2000,
        youOwe: 89.75,
        owedToYou: 234.50,
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Expenses</h1>
                    <p className={styles.subtitle}>Track spending & settle balances</p>
                </div>
                <div className={styles.headerRight}>
                    <button className={styles.filterBtn}>
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Add Expense
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.iconSpent}`}>
                        <TrendingUp size={20} />
                    </div>
                    <div className={styles.summaryContent}>
                        <span className={styles.summaryLabel}>Spent This Month</span>
                        <span className={styles.summaryValue}>${summary.totalSpent.toFixed(2)}</span>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${(summary.totalSpent / summary.monthlyBudget) * 100}%` }}
                            />
                        </div>
                        <span className={styles.summaryMeta}>
                            ${summary.monthlyBudget - summary.totalSpent} left of ${summary.monthlyBudget}
                        </span>
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.iconOwe}`}>
                        <TrendingDown size={20} />
                    </div>
                    <div className={styles.summaryContent}>
                        <span className={styles.summaryLabel}>You Owe</span>
                        <span className={`${styles.summaryValue} ${styles.negative}`}>
                            ${summary.youOwe.toFixed(2)}
                        </span>
                        <span className={styles.summaryMeta}>2 pending settlements</span>
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.iconOwed}`}>
                        <DollarSign size={20} />
                    </div>
                    <div className={styles.summaryContent}>
                        <span className={styles.summaryLabel}>Owed to You</span>
                        <span className={`${styles.summaryValue} ${styles.positive}`}>
                            ${summary.owedToYou.toFixed(2)}
                        </span>
                        <span className={styles.summaryMeta}>3 people</span>
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.iconNet}`}>
                        <Users size={20} />
                    </div>
                    <div className={styles.summaryContent}>
                        <span className={styles.summaryLabel}>Net Balance</span>
                        <span className={`${styles.summaryValue} ${styles.positive}`}>
                            +${(summary.owedToYou - summary.youOwe).toFixed(2)}
                        </span>
                        <span className={styles.summaryMeta}>You're in the green!</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "expenses" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("expenses")}
                >
                    Recent Expenses
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "balances" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("balances")}
                >
                    Who Owes Whom
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {activeTab === "expenses" ? (
                    <div className={styles.expensesLayout}>
                        <ExpenseList />
                        <SpendingChart />
                    </div>
                ) : (
                    <WhoOwesWhom />
                )}
            </div>

            {/* Modal */}
            {isModalOpen && <AddExpenseModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}
