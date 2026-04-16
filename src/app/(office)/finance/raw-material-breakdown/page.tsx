import { RawMaterialBreakdownPage } from "@/features/_finance-v2/RawMaterialBreakdownPage";
import { requireRole } from "@/lib/auth";

export default async function RawMaterialBreakdown() {
    await requireRole(["FRANCHISOR"]);
    return (
        <RawMaterialBreakdownPage />
    );
}
