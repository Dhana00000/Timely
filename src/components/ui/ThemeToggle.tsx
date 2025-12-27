"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const options = [
        { value: "light" as const, icon: Sun, label: "Light" },
        { value: "dark" as const, icon: Moon, label: "Dark" },
        { value: "system" as const, icon: Monitor, label: "System" },
    ];

    return (
        <div className={styles.container}>
            <span className={styles.label}>Theme</span>
            <div className={styles.toggleGroup}>
                {options.map(({ value, icon: Icon, label }) => (
                    <button
                        key={value}
                        className={`${styles.toggleBtn} ${theme === value ? styles.active : ""}`}
                        onClick={() => setTheme(value)}
                        title={label}
                        aria-label={`Switch to ${label} theme`}
                    >
                        <Icon size={16} />
                    </button>
                ))}
            </div>
        </div>
    );
}
