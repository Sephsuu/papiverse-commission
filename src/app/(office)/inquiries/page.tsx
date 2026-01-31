import { InquiriesPage } from "@/features/inquiries/InquiriesPage";
import { requireRole } from "@/lib/auth";

export default async function Inquiries() {
    await requireRole(["FRANCHISOR"])
    return (
        <InquiriesPage />
    )
}