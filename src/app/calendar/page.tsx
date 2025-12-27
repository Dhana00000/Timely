"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CalendarView from "@/components/calendar/CalendarView";

export default function CalendarPage() {
    return (
        <AuthGuard>
            <DashboardLayout>
                <CalendarView />
            </DashboardLayout>
        </AuthGuard>
    );
}
