"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import LumiChat from "@/components/lumi/LumiChat";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isLumiOpen, setIsLumiOpen] = useState(false);

    return (
        <div className={styles.layout}>
            <Sidebar
                onToggleLumi={() => setIsLumiOpen(!isLumiOpen)}
                isLumiOpen={isLumiOpen}
            />
            <main className={styles.main}>
                {children}
            </main>
            <LumiChat isOpen={isLumiOpen} onClose={() => setIsLumiOpen(false)} />
        </div>
    );
}

