"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ExpensesDashboard from "@/components/expenses/ExpensesDashboard";

export default function ExpensesPage() {
    return (
        <AuthGuard>
            <DashboardLayout>
                <ExpensesDashboard />
            </DashboardLayout>
        </AuthGuard>
    );
}
