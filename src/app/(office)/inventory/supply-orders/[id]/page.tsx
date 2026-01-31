"use client"

import { ViewOrderPage } from "@/features/supply-orders/ViewOrder";
import { useParams } from "next/navigation"


export default function ViewOrder() {
    const { id } = useParams<{ id: string }>();     
    return (
        <ViewOrderPage id={ Number(id) } />
    )
}