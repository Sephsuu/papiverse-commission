"use client"

import { TableFilter } from "@/components/shared/TableFilter";
import { TablePagination } from "@/components/shared/TablePagination";
import { useFetchData } from "@/hooks/use-fetch-data";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { Info, Search, SquarePen, Trash2 } from "lucide-react";
import { SectionLoading } from "@/components/ui/loader";
import { Modifier } from "@/types/modifier";
import { ModifierGroupService } from "@/services/modifier.service";
import { CreateModifierGroup } from "./components/CreateModifierGroup";
import Link from "next/link";
import { UpdateModifierGroup } from "./components/UpdateModifierGroup";
import { DeleteModifierGroup } from "./components/DeleteModifierGroup";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useCrudState } from "@/hooks/use-crud-state";
import { ViewModifierGroup } from "./components/ViewModifierGroup";

const pageKey = "modifierGroupPage"
const columns = [
    { title: 'Name', style: '' },
    { title: 'Description', style: 'col-span-2' },
    { title: 'Actions', style: '' },
]
const franchiseeColumns = [
    { title: 'Name', style: '' },
    { title: 'Description', style: 'col-span-2' },
]

export function ModifierGroupsPage() {
    const { loading: authLoading, isFranchisor } = useAuth();
    const [reload, setReload] = useState(false);
    const { data, loading } = useFetchData<Modifier>(ModifierGroupService.getAllModifierGroups, [reload]);
    const { search, setSearch, filteredItems } = useSearchFilter(data, ['name']);
    const { page, setPage, size, setSize, paginated, totalPages } = usePagination(filteredItems, 20, pageKey);

    const { open, setOpen, toView, setView, toUpdate, setUpdate, toDelete, setDelete } = useCrudState<Modifier>();

    if (loading || authLoading) return <SectionLoading />
    return (
        <section className="stack-md animate-fade-in-up">
            <TableFilter
                setSearch={ setSearch }
                searchPlaceholder="Search for a modifier group"
                size={ size }
                setSize={ setSize }
                buttonLabel="Add a group"
                setOpen={ setOpen }
                removeAdd={ !isFranchisor }
            />

            <div className="table-wrapper">
                <div className={`thead grid ${isFranchisor ? "grid-cols-4" : "grid-cols-3"}`}>
                    {(isFranchisor ? columns : franchiseeColumns).map((item, _) => (
                        <div key={_} className={`th ${item.style}`}>{ item.title }</div>
                    ))}
                </div>
                <div className="animate-fade-in-up" key={page}>
                    {paginated.length > 0 ?
                        paginated.map((item, i) => (
                            <div className={`tdata grid ${isFranchisor ? "grid-cols-4" : "grid-cols-3"}`} key={i}>
                                <Link 
                                    href={`/sales/modifier/${item.id}`}
                                    className="td underline"
                                >
                                    { item.name }
                                </Link>
                                <div className="td col-span-2">{ item.description }</div>
                                {isFranchisor && (
                                    <div className="td flex-center-y gap-2">
                                        <button onClick={ () => setUpdate(item) }><SquarePen className="w-4 h-4 text-darkgreen" /></button>
                                        <button onClick={ () => setView(item) }><Info className="w-4 h-4" /></button>
                                        <button onClick={ () => setDelete(item) }><Trash2 className="w-4 h-4 text-darkred" /></button>
                                    </div>
                                )}
                            </div>
                        ))
                        : (<div className="my-2 text-sm text-center col-span-6">There are no existing products yet.</div>)
                    }
                </div>
            </div>

            <TablePagination 
                data={ data }
                paginated={ paginated }
                page={ page }
                size={ size }
                setPage={ setPage }
                search={ search }
                pageKey={ pageKey }
            />

            {open && 
                <CreateModifierGroup
                    setOpen={ setOpen }
                    setReload={ setReload }
                />
            }

            {toView && (
                <ViewModifierGroup
                    toView={ toView }
                    setView={ setView }
                />
            )}

            {toUpdate && (
                <UpdateModifierGroup 
                    toUpdate={ toUpdate }
                    setUpdate={ setUpdate }
                    setReload={ setReload }
                />
            )}

            {toDelete && (
                <DeleteModifierGroup 
                    toDelete={ toDelete }
                    setDelete={ setDelete }
                    setReload={ setReload }
                />
            )}

        </section>
    )
}