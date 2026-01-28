import { BranchesPage } from "@/features/branches/BranchesPage";
import { requireRole } from "@/lib/auth";

export default async function Branches() {
    await requireRole(["FRANCHISOR"])
    return (
        <BranchesPage />
    )
}