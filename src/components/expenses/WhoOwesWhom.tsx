"use client";

import { ArrowRight, Check } from "lucide-react";
import styles from "./WhoOwesWhom.module.css";

export default function WhoOwesWhom() {
    const balances = [
        { id: 1, name: "Sarah", avatar: "S", amount: 125.50, direction: "owes_you", items: 3 },
        { id: 2, name: "John", avatar: "J", amount: 45.00, direction: "you_owe", items: 1 },
        { id: 3, name: "Mike", avatar: "M", amount: 89.00, direction: "owes_you", items: 2 },
        { id: 4, name: "Emma", avatar: "E", amount: 44.75, direction: "you_owe", items: 2 },
        { id: 5, name: "Roommates", avatar: "R", amount: 20.00, direction: "owes_you", items: 1 },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Who Owes Whom</h3>
            </div>

            <div className={styles.list}>
                {balances.map((balance) => (
                    <div key={balance.id} className={styles.item}>
                        <div className={styles.avatar}>{balance.avatar}</div>

                        <div className={styles.details}>
                            <span className={styles.name}>{balance.name}</span>
                            <span className={styles.meta}>{balance.items} expense{balance.items > 1 ? 's' : ''}</span>
                        </div>

                        <div className={styles.balanceWrapper}>
                            <span className={`${styles.amount} ${balance.direction === "owes_you" ? styles.positive : styles.negative}`}>
                                {balance.direction === "owes_you" ? "+" : "-"}${balance.amount.toFixed(2)}
                            </span>
                            <span className={styles.direction}>
                                {balance.direction === "owes_you" ? "owes you" : "you owe"}
                            </span>
                        </div>

                        <button className={styles.settleBtn}>
                            {balance.direction === "you_owe" ? (
                                <>Pay<ArrowRight size={14} /></>
                            ) : (
                                <>Remind</>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <button className={styles.settleAllBtn}>
                <Check size={18} />
                Settle All Balances
            </button>
        </div>
    );
}
