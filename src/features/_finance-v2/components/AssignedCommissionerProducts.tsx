'use client'

import { Dispatch, SetStateAction, useMemo, useState } from "react"
import { useCrudState } from "@/hooks/use-crud-state"
import { CommissionOwner } from "@/types/commissionOwner"
import { useSearchFilter } from "@/hooks/use-search-filter"
import { usePagination } from "@/hooks/use-pagination"
import { toast } from "sonner"
import { TableFilter } from "@/components/shared/TableFilter"
import { Button } from "@/components/ui/button"
import { Box, Plus, Square, Trash2 } from "lucide-react"
import { getCategoryIcon } from "@/hooks/use-helper"
import { formatToPeso } from "@/lib/formatter"
import { AssignCommissionProductsModal } from "./AssignCommissionProductsModal"
import { CommissionOwnerProduct } from "@/types/commissionOwner"
import { DeleteAssignedCommissionProduct } from "./DeleteAssignedCommissionProduct"

const columns = [
    { title: 'SKU ID', style: '' },
    { title: 'Capital', style: '' },
    { title: 'SRP', style: '' },
    { title: 'Profit', style: '' },
]

export function AssignedCommissionerProducts({
    owners,
    selectedOwner,
    setReload,
}: {
    owners: CommissionOwner[];
    selectedOwner: string;
    setReload: Dispatch<SetStateAction<boolean>>;
}) {

    const { open: openAssign, setOpen: setOpenAssign } = useCrudState()
    const [toDelete, setDelete] = useState<CommissionOwnerProduct>();

    const selectedOwnerName =
        owners.find((owner) => String(owner.id) === selectedOwner)?.name || "Select Owner";
    const selectedOwnerData = owners.find(
        (owner) => String(owner.id) === selectedOwner
    );
    const assignedProducts = selectedOwnerData?.assigned_products ?? [];
    const selectedOwnerId = selectedOwnerData?.id ?? 0;

    const { search, setSearch, filteredItems } = useSearchFilter(
        assignedProducts,
        ['name', 'sku']
    )

    const { size, setSize } = usePagination(
        filteredItems,
        10
    )

    const handleOpenAssignModal = () => {
        if (!selectedOwnerId) {
            toast.info("Please select a commission owner first.");
            return;
        }
        setOpenAssign(true);
    };
    return (
        <section className="animate-fade-in-up space-y-2">
            <div>
                <div className="text-darkbrown font-bold text-xl">
                    Assigned Commissioner Products
                </div>
                <div className="text-sm text-gray">
                    Displays all supplies currently assigned to commission owners, including supply details.
                </div>
            </div>

            <div className="flex-center-y gap-2">
                <TableFilter 
                    search={search}
                    setSearch={setSearch}
                    searchPlaceholder="Search for a supply"
                    size={size}
                    setSize={setSize}
                    removeAdd
                    removeFilter
                    className="w-full"
                />
                <Button
                    onClick={handleOpenAssignModal}
                    className="bg-darkorange! text-light shadow-xs hover:opacity-90"
                >
                    <Plus /> Assign a product
                </Button>
            </div>

            <div className="table-wrapper">
                <div className="flex thead">
                    <div className="w-full grid grid-cols-4">
                        {columns.map((item) => (
                            <div className={`th ${item.style}`} key={item.title}>{item.title}</div>
                        ))}
                    </div>
                    <div className="td flex-center w-15">
                        <Square className="w-4 h-4" />
                    </div>
                </div>
                

                {!selectedOwnerId ? (
                    <div className="p-4 tdata text-sm text-gray text-center">
                        Please select a commission owner to view assigned products.
                    </div>
                ) : filteredItems.length <= 0 ? (
                    <div className="tdata text-sm text-gray">
                        No assigned products found.
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <div className="flex tdata" key={item.sku}>
                            <div 
                                className="w-full grid grid-cols-4"
                                key={item.sku}
                            >
                                <div className="td">
                                    <div className="flex-center-y gap-2">
                                        {getCategoryIcon(item.category)}
                                        <div>
                                            <div>{item.name}</div>
                                            <div className="text-gray text-xs">{item.sku}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="td justify-between">
                                    <span>₱</span>
                                    {formatToPeso(item.capital).slice(1,)}
                                </div>
                                <div className="td justify-between">
                                    <span>₱</span>
                                    {formatToPeso(item.srp).slice(1,)}
                                </div>
                                <div className="td justify-between">
                                    <span>₱</span>
                                    {formatToPeso(item.srp - item.capital).slice(1,)}
                                </div>
                            </div>
                            <div className="td flex-center w-15">
                                <Trash2
                                    onClick={() => setDelete(item)}
                                    className="text-darkred w-4 h-4" 
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {openAssign && selectedOwnerId > 0 && (
                <AssignCommissionProductsModal
                    ownerId={selectedOwnerId}
                    ownerName={selectedOwnerName}
                    open={openAssign}
                    setOpen={setOpenAssign}
                    setReload={setReload}
                />
            )}

            {toDelete && selectedOwnerId > 0 && (
                <DeleteAssignedCommissionProduct
                    ownerId={selectedOwnerId}
                    ownerName={selectedOwnerName}
                    toDelete={toDelete}
                    setDelete={setDelete}
                    setReload={setReload}
                />
            )}
        </section>
    )
}
