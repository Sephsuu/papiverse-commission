"use client";

import { ModalTitle } from "@/components/shared/ModalTitle";
import { AddButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { ModalLoader } from "@/components/ui/loader";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { CommissionOwnerService } from "@/services/commissionOwner.service";
import { CommissionOwnerProduct } from "@/types/commissionOwner";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Props {
    ownerId: number;
    ownerName: string;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setReload: Dispatch<SetStateAction<boolean>>;
}

export function AssignCommissionProductsModal({
    ownerId,
    ownerName,
    open,
    setOpen,
    setReload,
}: Props) {
    const [onProcess, setProcess] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const { data: products, loading } = useFetchData<CommissionOwnerProduct>(
        CommissionOwnerService.getAvailableProducts,
        [ownerId, open],
        [ownerId],
        0,
        1000,
        open && ownerId > 0
    );

    const { search, setSearch, filteredItems } = useSearchFilter(products, ["name", "sku"]);

    useEffect(() => {
        if (!open) return;
        setSearch("");
        setSelectedIds([]);
    }, [open, setSearch]);

    const hasItems = useMemo(() => filteredItems.length > 0, [filteredItems.length]);
    const selectedItems = useMemo(
        () => products.filter((item) => selectedIds.includes(item.raw_material_id)),
        [products, selectedIds]
    );

    const toggleSelection = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    async function handleAssign() {
        if (selectedIds.length <= 0) {
            toast.info("Please select at least one product.");
            return;
        }

        try {
            setProcess(true);
            await CommissionOwnerService.assignProductsToOwner(ownerId, {
                rawMaterialIds: selectedIds,
            });
            toast.success("Selected products assigned successfully.");
            setReload((prev) => !prev);
            setOpen(false);
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    if (loading) return <ModalLoader />
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                <ModalTitle 
                    label="Add Products to" 
                    spanLabel={ownerName}
                />

                <form 
                    className="space-y-3"
                    onSubmit={e => {
                        e.preventDefault()
                        handleAssign()
                    }}
                >
                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-light p-2">
                        <div className="text-sm font-medium text-slate-700">
                            {selectedIds.length} item{selectedIds.length !== 1 ? "s" : ""} selected
                        </div>
                        {selectedIds.length > 0 && (
                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-xs font-semibold text-darkbrown underline underline-offset-2"
                                    >
                                        View selected
                                    </button>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-72">
                                    <div className="space-y-1">
                                        {selectedItems.map((item) => (
                                            <div key={item.raw_material_id} className="text-xs text-slate-700">
                                                {item.name} ({item.sku})
                                            </div>
                                        ))}
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        )}
                    </div>

                    <Input
                        placeholder="Search by product name or SKU"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray bg-light"
                    />

                    <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border bg-white p-2">
                        {loading ? (
                            <div className="p-3 text-sm text-gray">Loading available products...</div>
                        ) : !hasItems ? (
                            <div className="p-3 text-sm text-gray">No available products found.</div>
                        ) : (
                            filteredItems.map((item) => (
                                <label
                                    key={item.raw_material_id}
                                    className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50"
                                >
                                    <Checkbox
                                        checked={selectedIds.includes(item.raw_material_id)}
                                        onCheckedChange={() => toggleSelection(item.raw_material_id)}
                                    />
                                    <div className="min-w-0">
                                        <div className="truncate font-medium text-slate-900">{item.name}</div>
                                        <div className="truncate text-xs text-gray">{item.sku}</div>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>

                    <div className="flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <AddButton
                            type="submit"
                            onProcess={onProcess}
                            label="Assign Selected"
                            loadingLabel="Assigning"
                        />
                    </div>
                </form>

            </DialogContent>
        </Dialog>
    );
}
