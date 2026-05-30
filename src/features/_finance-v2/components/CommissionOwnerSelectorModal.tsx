"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { AppSelect } from "@/components/shared/AppSelect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type OwnerOption = { label: string; value: string };

export function CommissionOwnerSelectorModal({
    open,
    setOpen,
    ownerOptions,
    selectedOwner,
    setSelectedOwner,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    ownerOptions: OwnerOption[];
    selectedOwner: string;
    setSelectedOwner: (value: string) => void;
}) {
    const [draftOwner, setDraftOwner] = useState(selectedOwner);

    useEffect(() => {
        if (!open) return;
        setDraftOwner(selectedOwner);
    }, [open, selectedOwner]);

    const handleApply = () => {
        if (!draftOwner) return;
        setSelectedOwner(draftOwner);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="my-auto max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogTitle>
                    <AppHeader label="Select commission owner" />
                </DialogTitle>

                <div className="space-y-3">
                    <div className="space-y-2 rounded-md border bg-white p-3">
                        <div className="text-sm font-semibold text-slate-700">Commission Owner</div>
                        <AppSelect
                            groupLabel="Owners"
                            placeholder="Select Owner"
                            items={ownerOptions}
                            value={draftOwner}
                            onChange={setDraftOwner}
                            triggerClassName="border-slate-300 bg-light shadow-xs"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="button"
                            className="bg-darkgreen! hover:opacity-90"
                            disabled={!draftOwner}
                            onClick={handleApply}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
