"use client";

import { Sparkles, MessageCircle } from "lucide-react";
import styles from "./FloatingLumiButton.module.css";

interface FloatingLumiButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

export default function FloatingLumiButton({ onClick, isOpen }: FloatingLumiButtonProps) {
    if (isOpen) return null;

    return (
        <button
            className={styles.container}
            onClick={onClick}
            aria-label="Open Lumi AI Assistant"
        >
            {/* Animated rings */}
            <div className={styles.ring1} />
            <div className={styles.ring2} />

            {/* Main button */}
            <div className={styles.button}>
                <div className={styles.glow} />
                <div className={styles.iconWrapper}>
                    <Sparkles size={22} />
                </div>
            </div>

            {/* Label */}
            <div className={styles.label}>
                <MessageCircle size={14} />
                <span>Chat with Lumi</span>
            </div>
        </button>
    );
}
