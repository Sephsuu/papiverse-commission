import { SupplyLogsPage } from "@/features/logs/SupplyLogsPage";
import { Suspense } from "react";

export default function Logs() {
    return (
        <Suspense>
            <SupplyLogsPage />
        </Suspense>
    )
}