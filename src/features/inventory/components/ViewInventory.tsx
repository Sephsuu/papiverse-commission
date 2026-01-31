import { ModalTitle } from "@/components/shared/ModalTitle";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { useToday } from "@/hooks/use-today";
import { Inventory } from "@/types/inventory";
import { Dispatch, SetStateAction } from "react";

export function ViewInventory({
    toView,
    setView
}: {
    toView: Inventory;
    setView: Dispatch<SetStateAction<Inventory | undefined>>;
}) {
    const { day, monthLong, dayLong, year } = useToday(); 
    return (
        <Dialog open onOpenChange={(open) => { if (!open) setView(undefined); }}>
            <DialogContent>
                <ModalTitle
                    label="Inventory Information"
                    spanLabel={toView.name}
                />

                <div className="space-y-4 text-sm">
                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Basic Details</div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="font-medium text-gray-600">Code</div>
                            <div>{toView.sku}</div>

                            <div className="font-medium text-gray-600">Category</div>
                            <div>{toView.category}</div>
                        </div>
                    </div>

                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Stock Details</div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="font-medium text-gray-600">Quantity</div>
                            <div>
                                {toView.quantity} {toView.unitMeasurement}
                            </div>

                            <div className="font-medium text-gray-600">Converted Qty</div>
                            <div>
                                {toView.convertedQuantity} {toView.convertedMeasurement}
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-gray">As of {`${dayLong}, ${day} ${monthLong}, ${year}`}</div>
                </div>

                <div className="flex justify-end mt-5">
                    <DialogClose className="text-sm">Close</DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
}
