"use client"

import { AppSelect } from "@/components/shared/AppSelect";
import { AppHeader } from "@/components/shared/AppHeader";
import { useMemo, useState } from "react";
import { CalendarDays, LayoutList, TrendingDown, TrendingUp } from "lucide-react";
import { formatDateToWords } from "@/lib/formatter";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { InventoryTransactionSummary, InventoryTransactionSummaryItem } from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import { PapiverseLoading } from "@/components/ui/loader";
import { InventoryItemAuditModal } from "./components/InventoryItemAuditModal";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { TableFilter } from "@/components/shared/TableFilter";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/shared/TablePagination";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getCategoryIcon } from "@/hooks/use-helper";
import { useToday } from "@/hooks/use-today";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { TransactionDatePickerModal } from "./components/TransactionDatePickerModal";

const columns = [
    { title: 'Supply', style: '' },
    { title: 'Previous Stock', style: '' },
    { title: 'Total In', style: '' },
    { title: 'Total Out', style: '' },
    { title: 'Current Stock', style: '' },
]

const filters = ['All', 'Meat', 'Snow Frost'];
const sorts = [
    { label: "Alphabetical", value: "name_asc" },
    { label: "By Total In", value: "total_in_desc" },
    { label: "By Total Out", value: "total_out_desc" },
] as const;
type SortKey = (typeof sorts)[number]["value"];

export function TransactionSummaryPage() {
    const { today } = useToday();

    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedItem, setSelectedItem] = useState<InventoryTransactionSummaryItem | undefined>();
    const [toggleDate, setToggleDate] = useState(false);
    const [filter, setFilter] = useState(filters[0]);
    const [sort, setSort] = useState<SortKey>("name_asc");

    const parsedDate = selectedDate ? new Date(selectedDate) : null;
    const displayDate = parsedDate
        ? format(parsedDate, "MMMM dd, yyyy")
        : "Select date";
    const displayBadge = parsedDate
        ? format(parsedDate, "EEEE").toUpperCase()
        : "DAY";

    const { data: transactions, loading: loadingTransactions } = useFetchOne<InventoryTransactionSummary>(
        InventoryService.getTransactionSummary,
        [selectedDate],
        [1, selectedDate]
    )       

    const { setSearch, filteredItems } = useSearchFilter(
        transactions?.summary ?? [],
        ["name", "sku"]
    );

    const filteredData = useMemo(() => {
        return filteredItems.filter(i => {
            if (filter === 'Meat') return i.category === 'MEAT';
            if (filter === 'Snow Frost') return i.category === 'SNOWFROST';
            return true;
        });
    }, [filter, filteredItems]);

    const sortedData = useMemo(() => {
        const items = [...filteredData];

        if (sort === "name_asc") {
            items.sort((a, b) => a.name.localeCompare(b.name));
            return items;
        }

        if (sort === "total_in_desc") {
            items.sort((a, b) => b.totalIn - a.totalIn);
            return items;
        }

        items.sort((a, b) => b.totalOut - a.totalOut);
        return items;
    }, [filteredData, sort]);

    const { size, setSize, page, setPage, paginated } = usePagination(sortedData, 20);

    if (loadingTransactions || !transactions) return <PapiverseLoading />

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden max-md:mt-12">
            <AppHeader label="Inventory Transaction Summary" />

            <div className="flex-center-y justify-between">
                <div className="text-xl font-semibold">
                    Inventory Summary for 
                    <span className="text-darkbrown ml-1.5">{formatDateToWords(selectedDate)}</span>
                </div>

                <div
                    onClick={() => setToggleDate(true)}
                    className="flex-center-y gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-lg font-bold shadow-sm w-fit cursor-pointer max-md:m-1"
                >
                    <CalendarDays />

                    <div className="scale-x-110 origin-left">{displayDate}</div>

                    <Badge className="bg-darkbrown font-bold ml-2">
                        {displayBadge}
                    </Badge>
                </div>
            </div>

            <div className="flex-center-y gap-2">
                <TableFilter
                    className="w-full"
                    setSearch={ setSearch }
                    searchPlaceholder="Search for a supply"
                    buttonLabel="Add a user"
                    size={ size }
                    setSize={ setSize }
                    filters={filters}
                    filter={filter}
                    setFilter={setFilter}
                    removeAdd
                />
                <AppSelect
                    triggerClassName="bg-light shadow-xs border-input"
                    items={[...sorts]}
                    value={sort}
                    onChange={(value) => setSort(value as SortKey)}
                />
            </div>

            <div className="table-wrapper">
                <div className="thead flex-center-y">
                    <div className="w-full grid grid-cols-5">
                        {columns.map((item, _) => (
                            <div key={_} className={`th ${item.style}`}>{ item.title }</div>
                        ))}
                    </div>
                    <div className="th w-15"></div>
                </div>

                <div className="animate-fade-in-up" key={`${page}-${filter}`}>
                    {paginated.map((item) => (
                        <div key={item.sku} className="flex-center-y tdata">
                            <div className="w-full grid grid-cols-5">
                                <div className="td">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                                                {getCategoryIcon(item.category)}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>{item.category}</TooltipContent>
                                    </Tooltip>

                                    <div className="min-w-0">
                                        <div className="truncate font-semibold text-slate-900">
                                            {item.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {item.sku}
                                        </div>
                                    </div>
                                </div>
                                <div className="td font-bold">
                                    {item.previousInventory.toFixed(2)} 
                                    <span className="ml-1 text-gray font-medium">{item.unitMeasurement}</span>
                                </div>
                                <div className="td font-bold">
                                    {item.totalIn.toFixed(2)} 
                                    <span className="ml-1 text-gray font-medium">{item.unitMeasurement}</span>
                                </div>
                                <div className="td font-bold">
                                    {item.totalOut.toFixed(2)} 
                                    <span className="ml-1 text-gray font-medium">{item.unitMeasurement}</span>
                                </div>
                                <div className="td font-bold">
                                    {item?.currentInventory !== item?.previousInventory && Number(item?.previousInventory) !== 0 && (
                                        <span
                                            className={`flex-center-y gap-1 text-xs font-semibold px-1 rounded-sm mr-1 ${
                                                item.currentInventory > item.previousInventory
                                                    ? "text-darkgreen bg-green-100"
                                                    : "text-darkred bg-red-100"
                                            }`}
                                        >
                                            {item.currentInventory > item.previousInventory ? (
                                                <TrendingUp className="w-3.5 h-3.5" />
                                            ) : (
                                                <TrendingDown className="w-3.5 h-3.5" />
                                            )}
                                            {Number(
                                                (
                                                    ((item.currentInventory - item.previousInventory) / item.previousInventory) * 100
                                                ).toFixed(2)
                                            )}
                                            %
                                        </span>
                                    )}
                                    {item.currentInventory.toFixed(2)} 
                                    <span className="ml-1 text-gray font-medium">{item.unitMeasurement}</span>
                                </div>
                            </div>
                            <div className="w-15">
                                <LayoutList
                                    className="mx-auto w-4 h-4"
                                    onClick={() => setSelectedItem(item)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <TablePagination 
                data={sortedData}
                paginated={paginated}
                page={page}
                setPage={setPage}
                size={size}
            />

            {selectedItem && (
                <InventoryItemAuditModal 
                    selectedDate={selectedDate}
                    toView={selectedItem}
                    setView={setSelectedItem}
                />
            )}

            <TransactionDatePickerModal
                date={selectedDate}
                open={toggleDate}
                setDate={setSelectedDate}
                setOpen={setToggleDate}
            />

        </section>
    )
}
