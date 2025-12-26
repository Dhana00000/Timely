"use client";

import { useState } from "react";
import { X, DollarSign, Calendar, Users, Tag } from "lucide-react";
import styles from "./AddExpenseModal.module.css";

interface AddExpenseModalProps {
    onClose: () => void;
}

export default function AddExpenseModal({ onClose }: AddExpenseModalProps) {
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "food",
        date: new Date().toISOString().split("T")[0],
        splitWith: "",
        notes: "",
    });

    const categories = [
        { value: "food", label: "Food & Dining", emoji: "🍔" },
        { value: "transport", label: "Transport", emoji: "🚗" },
        { value: "shopping", label: "Shopping", emoji: "🛍️" },
        { value: "utilities", label: "Utilities", emoji: "⚡" },
        { value: "entertainment", label: "Entertainment", emoji: "🎬" },
        { value: "health", label: "Health", emoji: "💊" },
        { value: "other", label: "Other", emoji: "📦" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Submit to API
        console.log("Submit:", formData);
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Add Expense</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {/* Description */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Description</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="What did you spend on?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    {/* Amount */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Amount</label>
                        <div className={styles.inputWithIcon}>
                            <DollarSign size={18} className={styles.inputIcon} />
                            <input
                                type="number"
                                step="0.01"
                                className={styles.input}
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Category</label>
                        <div className={styles.categoryGrid}>
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    className={`${styles.categoryBtn} ${formData.category === cat.value ? styles.active : ""}`}
                                    onClick={() => setFormData({ ...formData, category: cat.value })}
                                >
                                    <span>{cat.emoji}</span>
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Date</label>
                        <div className={styles.inputWithIcon}>
                            <Calendar size={18} className={styles.inputIcon} />
                            <input
                                type="date"
                                className={styles.input}
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Split With */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Split With (optional)</label>
                        <div className={styles.inputWithIcon}>
                            <Users size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Names, comma separated"
                                value={formData.splitWith}
                                onChange={(e) => setFormData({ ...formData, splitWith: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                            Add Expense
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
