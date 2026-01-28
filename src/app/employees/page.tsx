import { EmployeesPage } from "@/features/employees/EmployeesPage";
import { requireRole } from "@/lib/auth";

export default async function Employees() {
    await requireRole(["FRANCHISEE"]);
    return (
        <EmployeesPage />
    )
}