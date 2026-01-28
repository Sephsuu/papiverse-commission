"use client";

import { ModalTitle } from "@/components/shared/ModalTitle";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { ModifierItem } from "@/types/modifier";
import { Dispatch, SetStateAction } from "react";

export function ViewModifierItem({
    toView,
    setView
}: {
    toView: ModifierItem;
    setView: Dispatch<SetStateAction<ModifierItem | undefined>>;
}) {
    return (
        <Dialog open onOpenChange={(open) => { if (!open) setView(undefined); }}>
            <DialogContent className="max-h-10/11 overflow-y-auto">

                <ModalTitle
                    label="Modifier Item Details"
                    spanLabel={toView.name}
                />

                <div className="space-y-4 text-sm">

                    {/* BASIC DETAILS */}
                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Basic Details</div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="font-medium text-gray-600">Name</div>
                            <div>{toView.name}</div>

                            <div className="font-medium text-gray-600">Description</div>
                            <div>{toView.description}</div>
                        </div>
                    </div>

                    {/* ITEMS NEEDED — SAME STYLE AS ViewProduct */}
                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Items Needed</div>

                        {toView.itemsNeeded.length === 0 ? (
                            <div className="text-gray-500 text-sm italic">
                                No items required for this modifier.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {toView.itemsNeeded.map((item, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-5 gap-2 rounded border px-3 py-2 text-xs"
                                    >
                                        {/* Name */}
                                        <div className="col-span-2 font-medium">
                                            {item.name}
                                        </div>

                                        {/* Code — not available in ModifierItem, so blank */}
                                        <div className="text-gray-500 italic">—</div>

                                        {/* Quantity + Unit */}
                                        <div>
                                            {item.quantity} {item.unitMeasurement ?? ""}
                                        </div>

                                        {/* Type */}
                                        <div className="text-right">
                                            {item.type}
                                        </div>
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
