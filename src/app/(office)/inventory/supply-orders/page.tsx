import { SupplyOrdersPage } from "@/features/supply-orders/SupplyOrdersPage"
import { requireRole } from "@/lib/auth"

export default async function SupplyOrders() {
    await requireRole(["FRANCHISOR", "FRANCHISEE"]);
    return (
        <SupplyOrdersPage />
    )
}