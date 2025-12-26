"use client";

import { User, Bell, Clock, DollarSign, Palette, Shield, LogOut } from "lucide-react";
import styles from "./SettingsPanel.module.css";

export default function SettingsPanel() {
    const sections = [
        {
            id: "profile",
            title: "Profile",
            icon: User,
            settings: [
                { label: "Name", value: "User", type: "text" },
                { label: "Email", value: "user@example.com", type: "text" },
                { label: "Avatar", value: "", type: "avatar" },
            ],
        },
        {
            id: "notifications",
            title: "Notifications",
            icon: Bell,
            settings: [
                { label: "Email Notifications", value: true, type: "toggle" },
                { label: "Push Notifications", value: true, type: "toggle" },
                { label: "Reminder Before Events", value: "15 min", type: "select" },
            ],
        },
        {
            id: "calendar",
            title: "Calendar",
            icon: Clock,
            settings: [
                { label: "Week Starts On", value: "Sunday", type: "select" },
                { label: "Default Event Duration", value: "30 min", type: "select" },
                { label: "Working Hours", value: "9 AM - 5 PM", type: "range" },
            ],
        },
        {
            id: "expenses",
            title: "Expenses",
            icon: DollarSign,
            settings: [
                { label: "Currency", value: "USD ($)", type: "select" },
                { label: "Monthly Budget", value: "$2,000", type: "text" },
            ],
        },
        {
            id: "appearance",
            title: "Appearance",
            icon: Palette,
            settings: [
                { label: "Theme", value: "Dark", type: "select" },
                { label: "Accent Color", value: "#6366f1", type: "color" },
            ],
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Settings</h1>
                <p className={styles.subtitle}>Customize your experience</p>
            </div>

            <div className={styles.content}>
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <div key={section.id} className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <Icon size={20} />
                                <h2 className={styles.sectionTitle}>{section.title}</h2>
                            </div>
                            <div className={styles.settingsList}>
                                {section.settings.map((setting, i) => (
                                    <div key={i} className={styles.settingRow}>
                                        <span className={styles.settingLabel}>{setting.label}</span>
                                        {setting.type === "toggle" ? (
                                            <button className={`${styles.toggle} ${setting.value ? styles.active : ""}`}>
                                                <div className={styles.toggleThumb} />
                                            </button>
                                        ) : setting.type === "color" ? (
                                            <div className={styles.colorPicker} style={{ background: setting.value as string }} />
                                        ) : (
                                            <span className={styles.settingValue}>{setting.value as string}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Danger Zone */}
                <div className={`${styles.section} ${styles.dangerZone}`}>
                    <div className={styles.sectionHeader}>
                        <Shield size={20} />
                        <h2 className={styles.sectionTitle}>Account</h2>
                    </div>
                    <div className={styles.settingsList}>
                        <div className={styles.settingRow}>
                            <div>
                                <span className={styles.settingLabel}>Sign Out</span>
                                <p className={styles.settingDesc}>Sign out of your account</p>
                            </div>
                            <button className={styles.logoutBtn}>
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
