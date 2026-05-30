import { CommissionReportPage } from "@/features/_finance-v2/CommissionReportPage";
import { requireRole } from "@/lib/auth";

export default async function CommissionReport() {
    await requireRole(['FRANCHISOR'])
    return (
        <CommissionReportPage />
    )
}