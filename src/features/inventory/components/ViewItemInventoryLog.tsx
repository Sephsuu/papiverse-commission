import { ModalTitle } from "@/components/shared/ModalTitle";
import { TablePagination } from "@/components/shared/TablePagination";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalLoader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { useFetchData } from "@/hooks/use-fetch-data";
import { usePagination } from "@/hooks/use-pagination";
import { formatDateTime, formatDateToWords, formatToPeso } from "@/lib/formatter";
import { InventoryService } from "@/services/inventory.service";
import { Inventory } from "@/types/inventory";
import { ArrowBigDown, ArrowBigUp, BadgeDollarSign, Inbox } from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type InventoryItemLog = {
    code: string;
    source: string;
    type: string;
    quantityChanged: number
    dateTime: string;
    unitMeasurement: string;
    businessEvent: string
}

type PriceHistoryItem = {
    priceType: string;
    unitPrice: number;
    effectiveFrom: string;
    effectiveTo: string | null;
    changedAt: string;
}

const tabs = ["LOGS", "PRICE HISTORY"];

export function ViewItemInventoryLog({ toView, setView }: {
    toView: Inventory,
    setView: Dispatch<SetStateAction<Inventory | undefined>>
}) {
    const { claims, loading: authLoading } = useAuth();
    const [tab, setTab] = useState(tabs[0]);
    const { data: logs, loading } = useFetchData<InventoryItemLog>(
        InventoryService.getItemAudits,
        [claims.branch.branchId, toView],
        [claims.branch.branchId, toView.sku]
    )
    const { page, setPage, size, paginated } = usePagination(logs, 10);

    const priceHistory = useMemo<PriceHistoryItem[]>(() => ([
        {
            priceType: "EXTERNAL",
            unitPrice: 380,
            effectiveFrom: "2026-03-11T11:11:00",
            effectiveTo: null,
            changedAt: "2026-03-11T11:11:00",
        },
        {
            priceType: "INTERNAL",
            unitPrice: 38,
            effectiveFrom: "2026-03-11T10:11:00",
            effectiveTo: null,
            changedAt: "2026-03-11T10:11:00",
        },
        {
            priceType: "EXTERNAL",
            unitPrice: 370,
            effectiveFrom: "2026-03-10T11:10:00",
            effectiveTo: "2026-03-11T11:09:00",
            changedAt: "2026-03-10T11:10:00",
        },
        {
            priceType: "INTERNAL",
            unitPrice: 34,
            effectiveFrom: "2026-03-10T10:10:00",
            effectiveTo: "2026-03-11T10:09:00",
            changedAt: "2026-03-10T10:10:00",
        },
    ]), []);
    
    if (authLoading || loading) return <ModalLoader />
    return (
        <Dialog open onOpenChange={ (open) => { if (!open) setView(undefined) } }>
            <DialogContent className="max-h-10/11 w-full max-w-4xl overflow-y-auto">
                <ModalTitle label={`Logs for `} spanLabel={toView.name} spanLabelClassName="text-darkorange" />
                <>
                    <div className="mt-2 flex">
                        {tabs.map((item) => {
                            const isActive = tab === item;

                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setTab(item)}
                                    className={`group relative w-full pb-4 text-center text-sm font-medium transition-colors
                                        ${isActive ? "text-darkbrown font-semibold" : "text-slate-500 hover:text-darkbrown"}
                                    `}
                                >
                                    <span className="block truncate">{item}</span>
                                    <span
                                        className={`absolute bottom-0 left-0 h-0.5 bg-darkbrown transition-all duration-300
                                            ${isActive ? "w-full" : "w-0 group-hover:w-full group-hover:bg-orange-100"}
                                        `}
                                    />
                                </button>
                            );
                        })}
                    </div>
                    <Separator className="bg-slate-400 -mt-4" />
                </>

                {tab === "LOGS" ? (
                    logs.length > 0 ? (
                        <>
                            <div className="table-wrapper -mt-4 overflow-x-auto">
                                <div className="thead grid grid-cols-4 w-150!">
                                    <div className="th">Quantity</div>
                                    <div className="th">Type</div>
                                    <div className="th">Source/Event</div>
                                    <div className="th">Date</div>
                                </div>
                                {paginated.map((item) => (
                                    <div className="tdata grid grid-cols-4 w-150!" key={item.dateTime}>
                                        <div className="th flex-center-y gap-1">
                                            {item.type === "IN" ? (
                                                <ArrowBigUp className="w-4 h-4 text-darkgreen" fill="#014421" />
                                            ) : (
                                                <ArrowBigDown className="w-4 h-4 text-darkred" fill="#731c13" />
                                            )}
                                            {item.quantityChanged} {item.unitMeasurement}
                                        </div>
                                        <div className="th">{item.type}</div>
                                        <div className="th flex-col items-start!">
                                            <div>{item.source}</div>
                                            <div className="text-gray text-xs">{item.businessEvent}</div>
                                        </div>
                                        <div className="th">{formatDateTime(item.dateTime)}</div>
                                    </div>
                                ))}
                            </div>

                            <TablePagination 
                                data={ logs }
                                paginated={ paginated }
                                page={ page }
                                size={ size }
                                setPage={ setPage }
                            />
                        </>
                    ) : (
                        <div className="flex-center flex-col py-8">
                            <Inbox className="w-10 h-10 text-gray" />
                            <div>THERE ARE NO LOGS FOR THIS ITEM</div>
                        </div>
                    )
                ) : (
                    <div className="-mt-4 space-y-3 overflow-auto">
                        <div className="w-full min-w-0">
                            <div className="table-wrapper max-w-full">
                                <div className="thead grid grid-cols-5 min-w-[720px]">
                                    <div className="th">Type</div>
                                    <div className="th">Unit Price</div>
                                    <div className="th">Effective From</div>
                                    <div className="th">Effective To</div>
                                    <div className="th">Changed At</div>
                                </div>

                                {priceHistory.map((item) => (
                                    <div className="tdata grid grid-cols-5 min-w-[720px]" key={`${item.priceType}-${item.changedAt}`}>
                                        <div className="td">{item.priceType}</div>
                                                {/* <Badge
                                                    className={`mt-1 ${item.effectiveTo ? "bg-slate-200 text-slate-700" : "bg-darkgreen text-light"}`}
                                                >
                                                    {item.effectiveTo ? "Previous" : "Active"}
                                                </Badge> */}
                                        <div className="td">
                                            {formatToPeso(item.unitPrice)}
                                        </div>
                                        <div className="th">{formatDateToWords(item.effectiveFrom)}</div>
                                        <div className="th">
                                            {item.effectiveTo ? formatDateToWords(item.effectiveTo) : "Currently active"}
                                        </div>
                                        <div className="th">{formatDateToWords(item.changedAt)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
            </DialogContent>
        </Dialog>
    )
}
