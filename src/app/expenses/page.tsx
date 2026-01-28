import ExpensesPage from "@/features/expenses/ExpensesPage";
import { requireRole } from "@/lib/auth";

export default async function Expenses() {
    await requireRole(["FRANCHISEE"]);
    return (
        <ExpensesPage />
    )
}