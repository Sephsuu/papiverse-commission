"use client"

import { TableFilter } from "@/components/shared/TableFilter";
import { TablePagination } from "@/components/shared/TablePagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from "@/components/ui/select";
import { useFetchData } from "@/hooks/use-fetch-data";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { formatToPeso } from "@/lib/formatter";
import { ProductService } from "@/services/product.service";
import { Product } from "@/types/products";
import { Info, Salad, SquarePen, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateProduct } from "./components/CreateProduct";
import { UpdateProduct } from "./components/UpdateProduct";
import { DeleteProduct } from "./components/DeleteProduct";
import { PapiverseLoading, SectionLoading } from "@/components/ui/loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import useNotifications from "@/hooks/use-notification";
import { useCrudState } from "@/hooks/use-crud-state";
import { NotificationSheet } from "@/components/shared/NotificationSheet";
import { ViewProduct } from "./components/ViewProduct";

const pageKey = "productPage";
const columns = [
    { title: 'Product Name', style: '' },
    { title: 'Category', style: '' },
    { title: 'Items Needed', style: '' },
    { title: 'Price', style: 'text-right' },
    { title: 'Action', style: 'text-center' },
]
const franchiseeColumns = [
    { title: 'Product Name', style: '' },
    { title: 'Category', style: '' },
    { title: 'Items Needed', style: '' },
    { title: 'Price', style: 'text-right' },
]

const filters = ["ALL PRODUCTS", "A'LA CARTE", "AFFORDABLE RICE MEALS", "ALL IN RICE BOWL", "BIG EVENT? WE GOT YOU", "BILAO BLOW OUT", "BINALOT NI PAPI", "BITES", "BURGERS", "CHEF'S PASTA", "CHEF'S PASTA 4-5 PAX", "COMBO A", "COMBO B", "COMBO C", "COMBO D", "COMBO E", "CRUNCHICKEN", "CRUNCHY BAGNET", "DINNER NIGHT TIME", "EXTRAS", "GRILLED SIZZLING BBQ DEALS", "KOPI NI PAPI", "KRISPY DELIGHTS", "KRISPY SISIG", "OVERLOAD SARAP", "PAPI FRIES", "PAPI'S FRUIT SODA", "PREMIUM BUNDLE DEALS", "QUENCHERS", "SALAD BLENDS", "SALO SALO SPECIAL", "SIGNATURE PLATES", "SIZZLING MEALS", "SNOWFROST HALO MIX", "SULIT RICE MIX", "ULTIMATE BUNDLE DEALS", "UNLI DEALS"];

export function ProductsPage() {
    const { claims, loading: authLoading, isFranchisor } = useAuth();
    const [reload, setReload] = useState(false);
    const [filter, setFilter] = useState(filters[0]);
    const { data, loading } = useFetchData<Product>(ProductService.getAllProducts, [reload]);
    const { filteredNotifications } = useNotifications({ claims, type: "PRODUCT" })
    const { search, setSearch, filteredItems } = useSearchFilter(data, ['name']);

    const filteredData = filteredItems.filter(i => {
        if (filter === 'ALL PRODUCTS') return true;
        return i.category === filter;
    });

    const { page, setPage, size, setSize, paginated } = usePagination(filteredData, 20, pageKey);

    const { open, setOpen, toView, setView, toUpdate, setUpdate, toDelete, setDelete, showNotif, setShowNotif } = useCrudState<Product>();

    if (loading || authLoading) return <SectionLoading />
    return (
        <section className="stack-md animate-fade-in-up">
            <TableFilter
                setSearch={ setSearch }
                searchPlaceholder="Search for a product"
                size={ size }
                setSize={ setSize }
                buttonLabel="Add a product"
                setOpen={ setOpen }
                filter={ filter }
                filters={ filters }
                setFilter={ setFilter }
                removeAdd={ !isFranchisor }
                filteredNotifications={ filteredNotifications }
                setShowNotif={ setShowNotif }
            />

            <div className="table-wrapper">
                <div className={`thead grid ${isFranchisor ? "grid-cols-5" : "grid-cols-4"}`}>
                    {(isFranchisor ? columns : franchiseeColumns).map((item, index) => (
                        <div key={index} className={`th ${item.style}`}>{item.title}</div>
                    ))}                     
                </div>
                <div className="animate-fade-in-up" key={`${page}-${filter}`}>
                    {paginated.length > 0 ?
                        paginated.map((item, i) => (
                            <div className={`tdata grid ${isFranchisor ? "grid-cols-5" : "grid-cols-4"}`} key={i}>
                                <div onClick={ () => setView(item) } className="td">{ item.name.toUpperCase() }</div>
                                <div className="td">{ item.category }</div>
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
                                            <Separator className="h-2" />
                                            {item.groups!.length > 0 && <SelectLabel>Modifier Groups</SelectLabel>}
                                            <div className="flex flex-col">
                                                {item.groups!.length > 0 && item.groups!.map((subItem) => (
                                                    <Link 
                                                        key={subItem.id}
                                                        href={`/sales/modifier/${subItem.id}`}
                                                        className="hover:underline text-sm pl-2 py-1.5"
                                                    >
                                                        { subItem.name }
                                                    </Link>
                                                ))}
                                            </div>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <div className="td text-right">{ formatToPeso(item.price) }</div>
                                {isFranchisor && (
                                    <div className="td flex-center-y gap-2 mx-auto">
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
                filter={ filter }
                pageKey={ pageKey }
            />

            {open && 
                <CreateProduct
                    setOpen={ setOpen }
                    setReload={ setReload }
                />
            }

            {toView && (
                <ViewProduct
                    toView={ toView }
                    setView={ setView }
                />
            )}

            {toUpdate && 
                <UpdateProduct
                    setUpdate={ setUpdate }
                    toUpdate={ toUpdate! }
                    setReload={ setReload }
                />
            }

            {toDelete && 
                <DeleteProduct
                    toDelete={ toDelete! }
                    setDelete={ setDelete }
                    setReload={ setReload }
                />
            }

            {showNotif && (
                <NotificationSheet
                    notifications={ filteredNotifications }
                    setOpen={ setShowNotif }
                />
            )}

        </section>
    )
}