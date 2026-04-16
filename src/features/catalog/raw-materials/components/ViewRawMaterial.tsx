import { ModalTitle } from "@/components/shared/ModalTitle";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { formatToPeso } from "@/lib/formatter";
import { Supply } from "@/types/supply";
import { Dispatch, SetStateAction } from "react";

export function ViewRawMaterial({
    toView,
    setView
}: {
    toView: Supply;
    setView: Dispatch<SetStateAction<Supply | undefined>>;
}) {
    return (
        <Dialog open onOpenChange={(open) => { if (!open) setView(undefined); }}>
            <DialogContent className="max-w-md max-h-10/11 overflow-y-auto">
                <ModalTitle
                    label="Raw Material Information"
                    spanLabel={toView.name}
                />

                <div className="space-y-4 text-sm">
                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Basic Details</div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="font-medium text-gray-600">SKU ID</div>
                            <div>{toView.sku}</div>

                            <div className="font-medium text-gray-600">Category</div>
                            <div>{toView.category ?? "NON DELIVERABLES"}</div>

                            <div className="font-medium text-gray-600">Deliverable</div>
                            <div>{toView.isDeliverables ? "Yes" : "No"}</div>
                        </div>
                    </div>

                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Measurement Details</div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="font-medium text-gray-600">Unit Qty</div>
                            <div>
                                {toView.unitQuantity} {toView.unitMeasurement}
                            </div>

                            <div className="font-medium text-gray-600">Converted Qty</div>
                            <div>
                                {toView.convertedQuantity ?? 0} {toView.convertedMeasurement ?? toView.unitMeasurement}
                            </div>

                            <div className="font-medium text-gray-600">Minimum Stock</div>
                            <div>
                                {toView.minStock} {toView.unitMeasurement}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Pricing</div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="font-medium text-gray-600">Unit Cost</div>
                            <div>
                                {toView.unitCost !== null && toView.unitCost !== undefined
                                    ? formatToPeso(toView.unitCost)
                                    : "Not available"}
                            </div>

                            <div className="font-medium text-gray-600">External Price</div>
                            <div>
                                {toView.unitPriceExternal !== null && toView.unitPriceExternal !== undefined
                                    ? formatToPeso(toView.unitPriceExternal)
                                    : "Not available"}
                            </div>
                        </div>
                    </div>

                    {(toView.inventorySourceSku || toView.stockFactor !== null) && (
                        <div className="rounded-md border p-3">
                            <div className="font-semibold mb-2">Inventory Source</div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <div className="font-medium text-gray-600">Source SKU</div>
                                <div>{toView.inventorySourceSku ?? "Not linked"}</div>

                                <div className="font-medium text-gray-600">Stock Factor</div>
                                <div>{toView.stockFactor ?? "Not available"} {toView.unitMeasurement}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-5">
                    <DialogClose className="text-sm">Close</DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
}
