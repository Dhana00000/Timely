"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HabitsDashboard from "@/components/habits/HabitsDashboard";

export default function HabitsPage() {
    return (
        <AuthGuard>
            <DashboardLayout>
                <HabitsDashboard />
            </DashboardLayout>
        </AuthGuard>
    );
}
