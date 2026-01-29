"use client"

import { PapiverseLoading } from "@/components/ui/loader";
import { Branch } from "@/types/branch";
import { Info, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { useFetchData } from "@/hooks/use-fetch-data";
import { AppHeader } from "@/components/shared/AppHeader";
import { TableFilter } from "@/components/shared/TableFilter";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/shared/TablePagination";
import { BranchService } from "@/services/branch.service";
import { CreateBranch } from "./components/CreateBranch";
import { UpdateBranch } from "./components/UpdateBranch";
import { DeleteBranch } from "./components/DeleteBranch";
import { OrderStatusBadge } from "@/components/ui/badge";
import { useCrudState } from "@/hooks/use-crud-state";
import { ViewBranch } from "./components/ViewBranch";

const pageKey = "branchPage";
const columns = [
    { title: "Branch Name", style: "" },
    { title: "Full Address", style: "col-span-2" },
    { title: "Branch Type", style: "" },
    { title: "Actions", style: "" },
]
const filters = ['All', 'Internal Branch', 'External Branch'];

export function BranchesPage() {
    const [reload, setReload] = useState(false);
    const [filter, setFilter] = useState(filters[0]);

    const { data, loading } = useFetchData<Branch>(BranchService.getAllBranches, [reload]);
    const { search, setSearch, filteredItems } = useSearchFilter(data, ['name']);

    const filteredData = filteredItems.filter(i => {
        if (filter === 'Internal Branch') return i.isInternal;
        if (filter === 'External Branch') return !i.isInternal;
        return true;
    });

    const { page, setPage, size, setSize, paginated, totalPages } = usePagination(filteredData, 20, pageKey);
    const { open, setOpen, toView, setView, toUpdate, setUpdate, toDelete, setDelete } = useCrudState<Branch>();

    if (loading) return <PapiverseLoading />
    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="All Branches" />

            <TableFilter
                setSearch={ setSearch }
                searchPlaceholder="Search for a branch"
                setOpen={ setOpen }
                buttonLabel="Add a branch"
                size={ size }
                setSize={ setSize }
                filters={ filters }
                filter={ filter }
                setFilter={ setFilter }
            />

            <div className="table-wrapper">
                <div className="thead grid grid-cols-5">
                    {columns.map((item, _) => (
                        <div key={_} className={`th ${item.style}`}>{ item.title }</div>
                    ))}
                </div>

                <div className="animate-fade-in-up" key={`${page}-${filter}`}>
                    {paginated.length > 0 ? (
                        paginated.map((item, index) => (
                            <div className="tdata grid grid-cols-5" key={index}>
                                <div className="td">{ item.name }</div>
                                <div className="td col-span-2 wrap-break-words">
                                    {`${item.streetAddress}, ${item.barangay}, ${item.city}, ${item.province}`}
                                </div>
                                <div className="td">
                                    <OrderStatusBadge 
                                        className={`text-dark! text-xs! ${item.isInternal ? "bg-[#e9e0c1]" : "bg-slate-200"}`} 
                                        status={item.isInternal ? "Internal Branch" : "External Branch"} 
                                    />
                                </div>
                                <div className="td flex-center-y gap-2">
                                    <button onClick={() => setUpdate(item)}><SquarePen className="w-4 h-4 text-darkgreen" /></button>
                                    <button onClick={() => setView(item)}><Info className="w-4 h-4" /></button>
                                    <button onClick={() => setDelete(item)}><Trash2 className="w-4 h-4 text-darkred" /></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="my-2 text-sm text-center col-span-6">There are no existing branches yet.</div>
                    )}
                </div>
            </div>

            <TablePagination
                data={ filteredData }
                paginated={ paginated }
                page={ page }
                size={ size }
                setPage={ setPage }
                pageKey={ pageKey }
            />

            {open && (
                <CreateBranch 
                    setOpen={ setOpen }
                    setReload={ setReload }
                />
            )}

            {toView && (
                <ViewBranch
                    toView={ toView }
                    setView={ setView }
                />
            )}

            {toUpdate && (
                <UpdateBranch 
                    toUpdate={ toUpdate }
                    setUpdate={ setUpdate }
                    setReload={ setReload }
                />
            )}

            {toDelete && (
                <DeleteBranch
                    toDelete={ toDelete }
                    setDelete={ setDelete }
                    setReload={ setReload }
                />
            )}
        </section>
    )
}
