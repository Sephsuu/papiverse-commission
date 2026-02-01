import { InventoriesPage } from "@/features/inventory/InventoriesPage";
import { requireRole } from "@/lib/auth";

export default async function Inventory()  {
    await requireRole(['FRANCHISOR', 'FRANCHISEE']);
    return (
        <InventoriesPage />
    )
}