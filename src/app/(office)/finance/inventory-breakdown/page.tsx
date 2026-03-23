import { InventoryBreakdownPage } from "@/features/inventory/InventoryBreakdownPage";
import { requireRole } from "@/lib/auth";

export default async function InventoryBreakdown() {
    await requireRole(["FRANCHISEE", "FRANCHISOR"]);
    return (
        <InventoryBreakdownPage />
    )
}
