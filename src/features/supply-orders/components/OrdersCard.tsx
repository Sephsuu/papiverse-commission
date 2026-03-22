import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCompactNumber, formatToPeso } from "@/lib/formatter";
import { Inventory } from "@/types/inventory";

export function OrdersCard({ orders, inventories, isFranchisor }: {
    orders: {
        rawMaterialCode: string;
        rawMaterialName: string;
        quantity: number;
        price: number;
    } [];
    inventories: Inventory[];
    isFranchisor: boolean;
})  {
    return (
        <>
            {orders.map((item, i) => {
                const currentStock = inventories.find(i => i.sku === item.rawMaterialCode)?.quantity;
                return (
                    <div className="tdata grid grid-cols-[60px_1fr_1fr_100px_1fr_1fr]" key={i}>
                        <div className="td text-center">{ i + 1 }</div>
                        <div className="td">{ item.rawMaterialCode }</div>
                        <div className="td">{ item.rawMaterialName }</div>
                        <div className="td flex-center-y gap-2">
                            <Tooltip>
                                <TooltipTrigger>
                                    { formatCompactNumber(item.quantity) } 
                                </TooltipTrigger>
                                <TooltipContent>Quantity: { item.quantity }</TooltipContent>
                            </Tooltip>
                            {isFranchisor && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge className="text-[10px] rounded-full">{ formatCompactNumber(currentStock!) }</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Current Stock: { currentStock }</TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                        
                        <div className="td">{ formatToPeso(item.price) }</div>
                        <div className="td">{ formatToPeso(item.price * item.quantity) }</div>
                    </div>
                )
            })}
        </>     
    )
}