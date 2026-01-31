import { BranchSalesPage } from "@/features/sales/BranchSalesPage";
import { requireRole } from "@/lib/auth";

export default async function Branches() {
    await requireRole(['FRANCHISOR']);
    return (
        <BranchSalesPage />
    )
}