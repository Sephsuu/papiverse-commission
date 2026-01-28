import { ProductEntitiesPage } from "@/features/sales/ProductEntitiesPage";
import { Suspense } from "react";

export default function Products() {
    return (
        <Suspense>
            <ProductEntitiesPage />
        </Suspense>
    )
}