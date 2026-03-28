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
import { ArrowBigDown, ArrowBigUp, Inbox } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SupplyService } from "@/services/supply.service";

type InventoryItemLog = {
    code: string;
    source: string;
    type: string;
    quantityChanged: number
    dateTime: string;
    unitMeasurement: string;
    businessEvent: string;
    effectiveDate: string;
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
    const isLogsTab = tab === "LOGS";
    const isPriceHistoryTab = tab === "PRICE HISTORY";

    const { data: logs, loading } = useFetchData<InventoryItemLog>(
        InventoryService.getItemAudits,
        [claims.branch.branchId, toView.sku, isLogsTab],
        [claims.branch.branchId, toView.sku],
        0,
        1000,
        isLogsTab
    )
    const { data: priceHistory, loading: loadingPriceHistory } = useFetchData<PriceHistoryItem>(
        SupplyService.getSupplyPriceHistory,
        [toView.sku, isPriceHistoryTab],
        [toView.sku],
        0,
        1000,
        isPriceHistoryTab
    )

    const { page: pageLogs, setPage: setPageLogs, size: sizeLogs, paginated: paginatedLogs } = usePagination(logs, 10);
    const { page: pageHistory, setPage: setPageHistory, size: sizeHistory, paginated: paginatedHistory } = usePagination(priceHistory, 10);

    if (authLoading || (isLogsTab && loading) || (isPriceHistoryTab && loadingPriceHistory)) return <ModalLoader />
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
                                <div className="thead grid grid-cols-5 w-200!">
                                    <div className="th">Date</div>
                                    <div className="th">Quantity</div>
                                    <div className="th">Source/Event</div>
                                    <div className="th">Type</div>
                                    <div className="th">Effective Date</div>
                                </div>
                                {paginatedLogs.map((item) => (
                                    <div className="tdata grid grid-cols-5 w-200!" key={item.dateTime}>
                                        <div className="td">{formatDateTime(item.dateTime)}</div>
                                        <div className="td flex-center-y gap-1">
                                            {item.type === "IN" ? (
                                                <ArrowBigUp className="w-4 h-4 text-darkgreen" fill="#014421" />
                                            ) : (
                                                <ArrowBigDown className="w-4 h-4 text-darkred" fill="#731c13" />
                                            )}
                                            {item.quantityChanged} {item.unitMeasurement}
                                        </div>
                                        <div className="td flex-col items-start!">
                                            <div>{item.source}</div>
                                            <div className="text-gray text-xs">{item.businessEvent.replace('_', ' ')}</div>
                                        </div>
                                        <div className="td">{item.type}</div>
                                        <div className="td">{formatDateTime(item.effectiveDate)}</div>
                                    </div>
                                ))}
                            </div>

                            <TablePagination 
                                data={ logs }
                                paginated={ paginatedLogs }
                                page={ pageLogs }
                                size={ sizeLogs }
                                setPage={ setPageLogs }
                            />
                        </>
                    ) : (
                        <div className="flex-center flex-col py-8">
                            <Inbox className="w-10 h-10 text-gray" />
                            <div>THERE ARE NO LOGS FOR THIS ITEM</div>
                        </div>
                    )
                ) : (
                    priceHistory.length > 0 ? (
                        <>
                            <div className="-mt-4 space-y-3 overflow-auto">
                                <div className="w-full min-w-0">
                                    <div className="table-wrapper max-w-full">
                                        <div className="thead grid grid-cols-5 min-w-[720px]">
                                            <div className="th">Effective From</div>
                                            <div className="th">Effective To</div>
                                            <div className="th">Unit Price</div>
                                            <div className="th">Type</div>
                                            <div className="th">Changed At</div>
                                        </div>

                                        {paginatedHistory.map((item) => (
                                            <div className="tdata grid grid-cols-5 min-w-[720px]" key={`${item.priceType}-${item.changedAt}`}>
                                                <div className="th">
                                                    {formatDateToWords(item.effectiveFrom)}</div>
                                                <div className="th">
                                                    {item.effectiveTo ? formatDateToWords(item.effectiveTo) : "Currently active"}
                                                </div>
                                                <div className="td">
                                                    {formatToPeso(item.unitPrice)}
                                                </div>
                                                <div className="td">{item.priceType}</div>
                                                <div className="th">{formatDateToWords(item.changedAt)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <TablePagination 
                                data={ priceHistory }
                                paginated={ paginatedHistory }
                                page={ pageHistory }
                                size={ sizeHistory }
                                setPage={ setPageHistory }
                            />
                        </>
                    ) : (
                        <div className="flex-center flex-col py-8">
                            <Inbox className="w-10 h-10 text-gray" />
                            <div>THERE IS NO PRICE HISTORY FOR THIS ITEM</div>
                        </div>
                    )
                )}
                
            </DialogContent>
        </Dialog>
    )
}
