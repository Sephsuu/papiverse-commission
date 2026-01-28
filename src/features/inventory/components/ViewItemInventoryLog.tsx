import { ModalTitle } from "@/components/shared/ModalTitle";
import { TablePagination } from "@/components/shared/TablePagination";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalLoader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { useFetchData } from "@/hooks/use-fetch-data";
import { usePagination } from "@/hooks/use-pagination";
import { formatDateTime } from "@/lib/formatter";
import { InventoryService } from "@/services/inventory.service";
import { Inventory } from "@/types/inventory";
import { ArrowBigDown, ArrowBigUp, Inbox } from "lucide-react";
import { Dispatch, Fragment, SetStateAction } from "react";

type InventoryItemLog = {
    code: string;
    source: string;
    type: string;
    quantityChanged: number
    dateTime: string;
    unitMeasurement: string;
}

export function ViewItemInventoryLog({ toView, setView }: {
    toView: Inventory,
    setView: Dispatch<SetStateAction<Inventory | undefined>>
}) {
    const { claims, loading: authLoading } = useAuth();
    const { data: logs, loading } = useFetchData<InventoryItemLog>(
        InventoryService.getItemAudits,
        [claims.branch.branchId, toView],
        [claims.branch.branchId, toView.code]
    )
    const { page, setPage, size, setSize, paginated, totalPages } = usePagination(logs, 10);
    
    if (authLoading || loading) return <ModalLoader />
    return (
        <Dialog open onOpenChange={ (open) => { if (!open) setView(undefined) } }>
            <DialogContent className="max-h-10/11 overflow-auto">
                <ModalTitle label={`Logs for `} spanLabel={toView.name} spanLabelClassName="text-darkorange" />
                {logs.length > 0 ? (
                    <div className="table-wrapper">
                        <div className="thead grid grid-cols-3">
                            <div className="th">Quantity</div>
                            <div className="th">Type</div>
                            <div className="th">Date</div>
                        </div>
                        {logs.map((item, i) => (
                            <div className="tdata grid grid-cols-3">
                                <div className="th flex-center-y gap-1">{item.type === "IN" ? <ArrowBigUp className="w-4 h-4 text-darkgreen" fill="#014421" /> : <ArrowBigDown className="w-4 h-4 text-darkred" fill="#731c13" />} { item.quantityChanged } { item.unitMeasurement }</div>
                                <div className="th">{ item.type }</div>
                                <div className="th">{ formatDateTime(item.dateTime) }</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-center flex-col">
                        <Inbox className="w-10 h-10 text-gray" />
                        <div>THERE ARE NO LOGS FOR THIS ITEM</div>
                    </div>
                )}

                <TablePagination 
                    data={ logs }
                    paginated={ paginated }
                    page={ page }
                    size={ size }
                    setPage={ setPage }
                />
                
            </DialogContent>
        </Dialog>
    )
}