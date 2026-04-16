import { SupplytBreakdownPage } from "@/features/_finance-v2/SuppliesBreakdownPage";
import { requireRole } from "@/lib/auth";

export default async function InventoryBreakdown() {
    await requireRole(["FRANCHISOR"]);
    return (
        <SupplytBreakdownPage />
    )
}
