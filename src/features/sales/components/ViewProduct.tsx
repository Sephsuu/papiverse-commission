import { ModalTitle } from "@/components/shared/ModalTitle";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { formatToPeso } from "@/lib/formatter";
import { Product } from "@/types/products";
import { Dispatch, SetStateAction } from "react";

export function ViewProduct({
    toView,
    setView
}: {
    toView: Product;
    setView: Dispatch<SetStateAction<Product | undefined>>;
}) {
    return (
        <Dialog open onOpenChange={(open) => { if (!open) setView(undefined); }}>
            <DialogContent className="max-h-10/11 overflow-y-auto">
                <ModalTitle
                    label="Product Information"
                    spanLabel={toView.name}
                />

                <div className="space-y-4 text-sm">
                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Basic Details</div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="font-medium text-gray-600">Category</div>
                            <div>{toView.category}</div>

                            <div className="font-medium text-gray-600">Price</div>
                            <div>{ formatToPeso(toView.price) }</div>
                        </div>
                    </div>

                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Modifier Groups</div>

                        {toView.groups!.length === 0 ? (
                            <div className="text-gray-500 text-sm">No modifier groups.</div>
                        ) : (
                            <div className="space-y-2">
                                {toView.groups!.map((group) => (
                                    <div
                                        key={group.id}
                                        className="rounded border px-3 py-2"
                                    >
                                        <div className="font-medium">{group.name}</div>
                                        <div className="text-gray-600 text-xs">
                                            {group.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Raw Materials / Items Needed</div>

                        {toView.itemsNeeded.length === 0 ? (
                            <div className="text-gray-500 text-sm">No raw materials linked.</div>
                        ) : (
                            <div className="space-y-2">
                                {toView.itemsNeeded.map((item) => (
                                    <div
                                        key={item.id}
                                        className="grid grid-cols-5 gap-2 rounded border px-3 py-2 text-xs"
                                    >
                                        <div className="col-span-2 font-medium">
                                            {item.name}
                                        </div>
                                        <div>{item.code}</div>
                                        <div>
                                            {item.quantity} {item.unitMeasurement}
                                        </div>
                                        <div className="text-right">{item.type}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-5">
                    <DialogClose className="text-sm">Close</DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
}
