"use client"

import { AppHeader } from "@/components/shared/AppHeader";
import { TableFilter } from "@/components/shared/TableFilter";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from "@/components/ui/select";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { Product } from "@/types/products";
import { ArrowLeft, Info, Salad, SquarePen, Trash2, X } from "lucide-react";
import { useState } from "react";
import { PapiverseLoading } from "@/components/ui/loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ModifierItem } from "@/types/modifier";
import { ModifierItemService } from "@/services/modifier.service";
import { CreateModifierItem } from "./components/CreateModifierItem";
import { useParams } from "next/navigation";
import { useFetchOne } from "@/hooks/use-fetch-one";
import Link from "next/link";
import { UpdateModifierItem } from "./components/UpdateModifierItem";
import { DeleteModifierItem } from "./components/DeleteModifierItem";
import { useAuth } from "@/hooks/use-auth";
import { useCrudState } from "@/hooks/use-crud-state";
import { ViewModifierItem } from "./components/ViewModifierItem";

type ModifierGroupItems = {
    group: {
        groupId: number,
        groupName: string;
    },
    modifierItems: ModifierItem[],
    products: Product[],
}

const columns = [
    { title: 'Name', style: '' },
    { title: 'Description', style: '' },
    { title: 'Items Needed', style: '' },
    { title: 'Actions', style: '' },
]

const franchiseeColumns = [
    { title: 'Name', style: '' },
    { title: 'Description', style: '' },
    { title: 'Items Needed', style: '' },
]


const productColumns = [
    { title: 'Product Name', style: '' },
    { title: 'Category', style: '' },
]

export function  ViewModifierItemsPage() {
    const { id } = useParams();
    const { loading: authLoading, isFranchisor } = useAuth();
    const [reload, setReload] = useState(false);
    const { data, loading, error } = useFetchOne<ModifierGroupItems>(
        ModifierItemService.getByModifierGroup, 
        [reload, id],
        [id]
    );    
    
    const { search, setSearch, filteredItems } = useSearchFilter(data?.modifierItems, ['name']);
    const { page, setPage, size, setSize, paginated, totalPages } = usePagination(filteredItems, 20);

    const { open, setOpen, toView, setView, toUpdate, setUpdate, toDelete, setDelete } = useCrudState<ModifierItem>();

    if (loading || !data || authLoading) return <PapiverseLoading />
    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <div className="flex-center-y gap-4 w-full">
                <Link href='/sales/products?tab=Modifier Groups'>
                    <ArrowLeft className="w-7 h-7" />
                </Link>
                <AppHeader 
                    label={`Modifier Items for ${data!.group.groupName}`} 
                    className="w-full"
                    hidePapiverseLogo={true}
                />
            </div>
            <TableFilter
                setSearch={ setSearch }
                searchPlaceholder="Search for a modifier item"
                size={ size }
                setSize={ setSize }
                buttonLabel="Add item"
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
                                <div onClick={ () => setView(item) } className="td">{ item.name }</div>
                                <div className="td">{ item.description }</div>
                                <Select>
                                    <SelectTrigger className="td font-semibold underline text-dark data-[state=open]:text-dark">
                                        Supplies Needed
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Supplies needed for { item.name }</SelectLabel>
                                            {item.itemsNeeded.map((subItem, index) => (
                                                <SelectItem 
                                                    key={ index } 
                                                    value={ subItem.code! }
                                                    className="flex"
                                                >
                                                    <div className="text-sm">
                                                        { subItem.type === 'PRODUCT' &&
                                                            <Tooltip>
                                                                <TooltipTrigger><Salad className="w-4 h-4 text-darkbrown inline-block -mt-1 mr-1" /></TooltipTrigger>
                                                                <TooltipContent>Product Item</TooltipContent>
                                                            </Tooltip> 
                                                        }
                                                        { subItem.name }
                                                    </div>
                                                    <div className="text-sm flex items-center ms-auto">
                                                        <X /> <div>{ subItem.quantity } { subItem.unitMeasurement ?? '' }</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {isFranchisor && (
                                    <div className="td flex-center-y gap-2">
                                        <button onClick={ () => setUpdate(item) }><SquarePen className="w-4 h-4 text-darkgreen" /></button>
                                        <button onClick={ () => setView(item) }><Info className="w-4 h-4" /></button>
                                        <button onClick={ () => setDelete(item) }><Trash2 className="w-4 h-4 text-darkred" /></button>
                                    </div>
                                )}
                            </div>
                        ))
                        : (<div className="my-2 text-sm text-center col-span-6">There are no existing modifier items yet.</div>)
                    }
                </div>
            </div>

            <AppHeader 
                className="mt-4" 
                label={`Products Linked to ${data!.group.groupName}`} 
                hidePapiverseLogo={true}
            />

            <div className="table-wrapper">
                <div className="thead grid grid-cols-2">
                    {productColumns.map((item, _) => (
                        <div key={_} className={`th ${item.style}`}>{ item.title }</div>
                    ))}
                </div>
                <div className="animate-fade-in-up" key={page}>
                    {data.products.length > 0 ?
                        data.products.map((item, i) => (
                            <div className="tdata grid grid-cols-2" key={i}>
                                <div className="td">{ item.name }</div>
                                <div className="td">{ item.category }</div>
                            </div>
                        ))
                        : (<div className="my-2 text-sm text-center col-span-6">There are no existing products yet.</div>)
                    }
                </div>
            </div>

            {open && 
                <CreateModifierItem
                    group={ data.group }
                    setOpen={ setOpen }
                    setReload={ setReload }
                />
            }

            {toView && (
                <ViewModifierItem
                    toView={ toView }
                    setView={ setView }
                />
            )}

            {toUpdate && (
                <UpdateModifierItem 
                    toUpdate={ toUpdate }
                    setUpdate={ setUpdate }
                    group={ data.group }
                    setReload={ setReload }
                />
            )}

            {toDelete && (
                <DeleteModifierItem
                    toDelete={ toDelete }
                    setDelete={ setDelete }
                    setReload={ setReload }
                />
            )}

        </section>
    )
}