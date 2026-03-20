import { ModalTitle } from "@/components/shared/ModalTitle";
import { TablePagination } from "@/components/shared/TablePagination";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchData } from "@/hooks/use-fetch-data";
import { usePagination } from "@/hooks/use-pagination";
import { formatDateToWords } from "@/lib/formatter";
import { InventoryService } from "@/services/inventory.service";
import { InventoryItemAudit, InventoryTransactionSummaryItem } from "@/types/inventory";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

const TYPES = ["IN", "OUT"]

const columns = [
    { title: 'Date', style: '' },
    { title: 'Quantity Changed', style: '' },
    { title: 'Source', style: '' },
    { title: 'Order Destination', style: '' },
]

export function InventoryItemAuditModal({ selectedDate, toView, setView }: {
    selectedDate: string
    toView: InventoryTransactionSummaryItem,
    setView: Dispatch<SetStateAction<InventoryTransactionSummaryItem | undefined>>;
}) {
    const [selectedType, setSelectedType] = useState(TYPES[0])

    const { data: audit, loading: loadingAudit, error } = useFetchData<InventoryItemAudit>(
        InventoryService.getItemAuditByDate,
        [selectedType],
        [1, selectedType, toView.sku, selectedDate],
    )

    const { page, setPage, size, paginated } = usePagination(audit, 10);

    const formatAuditDate = (value?: string) => {
        if (!value) return "No date";
        try {
            return formatDateToWords(value);
        } catch {
            return value;
        }
    };

    if (loadingAudit) return (
        <Dialog open onOpenChange={(open) => { if (!open) setView(undefined) }}>
            <DialogContent className="overflow-hidden">
                <ModalTitle label={`${toView.sku || "N/A"} - ${toView.name || "Unknown Item"}`} />

                <div className="flex justify-evenly">
                    {TYPES.map((item) => (
                        <button
                            key={item}
                            className={`w-full border-b py-2 ${selectedType === item ? "font-semibold" : ""}`}
                            disabled
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div className="space-y-2 pt-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </DialogContent>
        </Dialog>
    )

    return (
        <Dialog open onOpenChange={(open) => { if (!open) setView(undefined) }}>
            <DialogContent className="overflow-hidden">
                <ModalTitle label={`${toView.sku || "N/A"} - ${toView.name || "Unknown Item"}`} />

                <div className="flex justify-evenly">
                    {TYPES.map((item) => (
                        <button
                            key={item}
                            className={`w-full border-b py-2 ${selectedType === item ? "font-semibold" : ""}`}
                            onClick={() => setSelectedType(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="text-sm text-darkred py-2 px-1">
                        Failed to load audit logs.
                    </div>
                )}

                {!error && audit.length === 0 && (
                    <div className="text-sm text-gray-500 py-8 text-center">
                        No {selectedType} audit records for the selected date.
                    </div>
                )}

                {!error && paginated.length > 0 && (
                    <div className="table-wrapper-scrollable w-full max-h-[70vh] overflow-auto">
                        <div className="thead grid grid-cols-4 min-w-[720px]">
                            {columns.map((item) => (
                                <div key={item.title} className={`th ${item.style}`}>{ item.title }</div>
                            ))}
                        </div>

                        {paginated.map((item) => (
                            <div key={item.id} className="tdata grid grid-cols-4 min-w-[720px]">
                                <div className="td">{formatAuditDate(item.dateTime)}</div>
                                <div className="td items-center">
                                    {selectedType === "IN" 
                                        ? <ArrowBigUp className="w-4 h-4 text-darkgreen" fill="#014421" /> 
                                        : <ArrowBigDown className="w-4 h-4 text-darkred" fill="#731c13" />
                                    }
                                    <span className="ml-1">{item.quantityChanged ?? 0}</span>
                                    <span className="ml-1">{item.unitMeasurement || "N/A"}</span>
                                </div>
                                <div className="td">{item.source || "N/A"}</div>
                                <div className="td">{item.order?.orderDestination || "Not from order"}</div>
                            </div>
                        ))}
                    </div>
                )}

                <TablePagination 
                    data={audit}
                    paginated={paginated}
                    page={page}
                    setPage={setPage}
                    size={size}
                />
            </DialogContent>
        </Dialog>
    )
}
