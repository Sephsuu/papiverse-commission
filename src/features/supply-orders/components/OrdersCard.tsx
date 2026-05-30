"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCompactNumber, formatToPeso } from "@/lib/formatter";
import { Inventory } from "@/types/inventory";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

const CURRENT_STOCK_VISIBILITY_KEY = "orders-card-current-stock-visible";

export function OrdersCard({ orders, inventories, isFranchisor, showMeatCategoryCost }: {
    orders: {
        rawMaterialCode?: string;
        rawMaterialName?: string;
        quantity: number;
        price: number;
        isOther?: boolean;
    } [];
    inventories: Inventory[];
    isFranchisor: boolean;
    showMeatCategoryCost?: boolean;
})  {
    const [showCurrentStock, setShowCurrentStock] = useState(() => {
        if (typeof window === "undefined") return false;

        return window.sessionStorage.getItem(CURRENT_STOCK_VISIBILITY_KEY) === "true";
    });

    useEffect(() => {
        window.sessionStorage.setItem(CURRENT_STOCK_VISIBILITY_KEY, String(showCurrentStock));
    }, [showCurrentStock]);

    return (
        <section className="relative">
            {isFranchisor && (
                <button
                    type="button"
                    onClick={() => setShowCurrentStock((prev) => !prev)}
                    className="absolute -top-18 right-0 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-xs transition hover:bg-slate-50"
                >
                    {showCurrentStock ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {showCurrentStock ? "Hide current stock" : "Show current stock"}
                </button>
            )}
            {orders.map((item, i) => {
                const inventoryItem = item.rawMaterialCode && item.rawMaterialCode !== "OTHER"
                    ? inventories.find((inventory) => inventory.sku === item.rawMaterialCode)
                    : undefined;
                const currentStock = inventoryItem?.quantity;
                const unitCost = inventoryItem?.unitCost;
                const hasUnitCost = typeof unitCost === "number";
                const basePrice = hasUnitCost ? unitCost : item.price;
                const meatCategoryCost = typeof basePrice === "number"
                    ? basePrice * item.quantity
                    : null;

                return (
                    <div
                        className={`tdata grid ${showMeatCategoryCost ? "grid-cols-[60px_1fr_1fr_100px_1fr_1fr_1fr]" : "grid-cols-[60px_1fr_1fr_100px_1fr_1fr]"}`}
                        key={i}
                    >
                        <div className="td text-center">{ i + 1 }</div>
                        <div className="td">{ item.rawMaterialCode ?? "-" }</div>
                        <div className="td">{ item.rawMaterialName ?? "-" }</div>
                        <div className="td flex-center-y gap-2">
                            <Tooltip>
                                <TooltipTrigger>
                                    { formatCompactNumber(item.quantity) } 
                                </TooltipTrigger>
                                <TooltipContent>Quantity: { item.quantity }</TooltipContent>
                            </Tooltip>
                            {isFranchisor && showCurrentStock && currentStock !== undefined && (
                                <Tooltip>
                                    <TooltipTrigger className="animate-fade-in-up" key={String(showCurrentStock)}>
                                        <Badge className="rounded-full text-[10px]">
                                            {formatCompactNumber(currentStock)}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Current Stock: { currentStock }</TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                        
                        <div className="td">{ formatToPeso(item.price) }</div>
                        <div className="td">{ formatToPeso(item.price * item.quantity) }</div>
                        {showMeatCategoryCost && (
                            <div className="td bg-darkorange-2/10">
                                {meatCategoryCost === null ? "-" : formatToPeso(meatCategoryCost)}
                                {hasUnitCost && (
                                    <Badge className="ml-2 rounded-full border border-emerald-300 bg-emerald-100 text-emerald-800">
                                        Unit Cost
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </section>     
    )
}
