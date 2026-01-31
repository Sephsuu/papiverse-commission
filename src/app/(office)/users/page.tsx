import { UsersPage } from "@/features/users/UsersPage";
import { requireRole } from "@/lib/auth";

export default async function Users() {
    await requireRole(['FRANCHISOR']);
    return (
        <UsersPage />
    )
}