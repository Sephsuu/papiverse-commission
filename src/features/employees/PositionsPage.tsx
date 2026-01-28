"use client"

import { AppHeader } from "@/components/shared/AppHeader";
import { TableFilter } from "@/components/shared/TableFilter";
import { PapiverseLoading } from "@/components/ui/loader";
import { useCrudState } from "@/hooks/use-crud-state";
import { useFetchData } from "@/hooks/use-fetch-data";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { PositionService } from "@/services/employee.service";
import { Positiion } from "@/types/employee";
import { SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { CreatePosition } from "./components/CreatePosition";
import { UpdatePosition } from "./components/UpdatePosition";

const columns = [
    { title: "Position Name", style: "" },
    { title: "Action", style: "" },
]

export function PositionsPage() {
    const [reload, setReload] = useState(false);

    const { data, loading, error } = useFetchData<Positiion>(
        PositionService.getAllPositions, 
        [reload]
    );

    const { search, setSearch, filteredItems } = useSearchFilter(data, ['name']);
    const { page, setPage, size, setSize, paginated } = usePagination(filteredItems, 20); 
    const { open, setOpen, toView, setView, toUpdate, setUpdate, toDelete, setDelete } = useCrudState<Positiion>();

    if (loading) return <PapiverseLoading />
    return (
        <section className="stack-md animate-fade-in-up">
            <AppHeader label="All Employee Positions" />
            <TableFilter 
                setSearch={ setSearch }
                searchPlaceholder="Search for a supply"
                setOpen={ setOpen }
                buttonLabel="Add a position"
                size={ size }
                setSize={ setSize }
            />

            <div className="table-wrapper">
                <div className={`thead grid grid-cols-2 max-md:w-250!`}>
                    {columns.map((item, index) => (
                        <div key={index} className={`th ${item.style}`}>{item.title}</div>
                    ))}                     
                </div>

                <div>
                    {paginated.map((item) => (
                        <div className={`tdata grid grid-cols-2 max-md:w-250!`} key={ item.id }>
                            <div className="td">{ item.name }</div>
                            <div className="td flex-center-y gap-2">
                                <button onClick={ () => setUpdate(item) }><SquarePen className="w-4 h-4 text-darkgreen" /></button>
                                <button
                                    onClick={ () => setDelete(item) }
                                >
                                    <Trash2 className="w-4 h-4 text-darkred" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {open && (
                <CreatePosition 
                    setOpen={ setOpen }
                    setReload={ setReload }
                />
            )}

            {toUpdate && (
                <UpdatePosition 
                    toUpdate={ toUpdate }
                    setUpdate={ setUpdate }
                    setReload={ setReload }
                />
            )}
        </section>
    )   
}