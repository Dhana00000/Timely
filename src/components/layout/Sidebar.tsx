"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    DollarSign,
    Target,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    LogOut,
    User,
} from "lucide-react";
import { useAuth, useUserName } from "@/contexts/AuthContext";
import styles from "./Sidebar.module.css";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/calendar", icon: Calendar, label: "Calendar" },
    { href: "/expenses", icon: DollarSign, label: "Expenses" },
    { href: "/habits", icon: Target, label: "Habits" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
    onToggleLumi?: () => void;
    isLumiOpen?: boolean;
}

export default function Sidebar({ onToggleLumi, isLumiOpen }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const { user, signOut, isConfigured } = useAuth();
    const userName = useUserName();

    const handleSignOut = async () => {
        await signOut();
        // Redirect to home
        window.location.href = "/";
    };

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
            {/* Logo */}
            <div className={styles.logoSection}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <Sparkles size={24} />
                    </div>
                    {!isCollapsed && (
                        <div className={styles.logoText}>
                            <span className={styles.logoTitle}>Timely</span>
                            <span className={styles.logoTagline}>Life, In sync</span>
                        </div>
                    )}
                </div>
                <button
                    className={styles.collapseBtn}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <Icon size={20} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                    {isActive && <div className={styles.activeIndicator} />}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Lumi AI Button */}
            <div className={styles.lumiSection}>
                <button
                    className={`${styles.lumiBtn} ${isLumiOpen ? styles.lumiActive : ""}`}
                    onClick={onToggleLumi}
                    title={isCollapsed ? "Ask Lumi AI" : undefined}
                >
                    <div className={styles.lumiIcon}>
                        <Sparkles size={20} />
                    </div>
                    {!isCollapsed && (
                        <div className={styles.lumiText}>
                            <span className={styles.lumiTitle}>Lumi AI</span>
                            <span className={styles.lumiSubtitle}>Life, In sync</span>
                        </div>
                    )}
                </button>
            </div>

            {/* User Section */}
            <div className={styles.userSection}>
                <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                        <User size={20} />
                    </div>
                    {!isCollapsed && (
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>{userName}</span>
                            <span className={styles.userEmail}>
                                {user?.email || "Not signed in"}
                            </span>
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <button
                        className={styles.logoutBtn}
                        title="Sign out"
                        onClick={handleSignOut}
                    >
                        <LogOut size={18} />
                    </button>
                )}
            </div>
        </aside>
    );
}

