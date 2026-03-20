import { ExpensesPage } from "@/features/_finance-v2/ExpensesPage";
import { requireRole } from "@/lib/auth";

export default async function Expenses() {
    await requireRole(["FRANCHISEE", "FRANCHISOR"]);
    return (
        <ExpensesPage />
    )
}