import DashboardLayout from "@/components/layout/DashboardLayout";
import ExpensesDashboard from "@/components/expenses/ExpensesDashboard";

export default function ExpensesPage() {
    return (
        <DashboardLayout>
            <ExpensesDashboard />
        </DashboardLayout>
    );
}
