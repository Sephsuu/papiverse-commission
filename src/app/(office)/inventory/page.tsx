import { InventoryPage } from "@/features/_inventory-v2/InventoryPage";
import { requireRole } from "@/lib/auth";

export default async function Inventory() {
    await requireRole(['FRANCHISOR']);
    return (
        <InventoryPage />
    )
}