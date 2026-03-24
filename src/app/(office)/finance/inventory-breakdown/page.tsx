import { InventoryReportBreakdownPage } from "@/features/_finance-v2/InventoryReportBreakdownPage";
import { requireRole } from "@/lib/auth";

export default async function InventoryBreakdown() {
    await requireRole(["FRANCHISOR"]);
    return (
        <InventoryReportBreakdownPage />
    )
}
