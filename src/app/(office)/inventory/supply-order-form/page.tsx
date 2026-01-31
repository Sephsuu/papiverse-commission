import { SupplyOrderFormPage } from "@/features/supply-orders/order-form/SupplyOrderFormPage";
import { requireRole } from "@/lib/auth";

export default async function SupplyOrderForm() {
    await requireRole(["FRANCHISEE"])
    return (
        <SupplyOrderFormPage />
    )
}