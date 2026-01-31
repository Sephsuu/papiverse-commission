import { LogsPage } from "@/features/inventory/LogsPage";
import { Suspense } from "react";

export default function Logs() {
    return (
        <Suspense>
            <LogsPage />
        </Suspense>
    )
}