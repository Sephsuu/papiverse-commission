"use client";

import { ModalTitle } from "@/components/shared/ModalTitle";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Modifier } from "@/types/modifier";
import { Dispatch, SetStateAction } from "react";

export function ViewModifierGroup({
    toView,
    setView
}: {
    toView: Modifier;
    setView: Dispatch<SetStateAction<Modifier | undefined>>;
}) {
    return (
        <Dialog open onOpenChange={(open) => { if (!open) setView(undefined); }}>
            <DialogContent className="max-h-10/11 overflow-y-auto">
                
                <ModalTitle
                    label="Modifier Group Information"
                    spanLabel={toView.name}
                />

                <div className="space-y-4 text-sm">

                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Details</div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="font-medium text-gray-600">Name</div>
                            <div>{toView.name}</div>

                            <div className="font-medium text-gray-600">Description</div>
                            <div>{toView.description}</div>
                        </div>
                    </div>

                </div>

                <div className="flex justify-end mt-5">
                    <DialogClose className="text-sm">Close</DialogClose>
                </div>

            </DialogContent>
        </Dialog>
    );
}
