"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToday } from "@/hooks/use-today";
import { format } from "date-fns";
import { DatePickerModal } from "./components/DatePickerModal";
import {
    ArrowUpDown,
    CalendarDays,
    Expand,
    Funnel,
    RefreshCcw,
    Shrink,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatToPeso } from "@/lib/formatter";
import { usePagination } from "@/hooks/use-pagination";
import { useFetchData } from "@/hooks/use-fetch-data";
import { SectionLoading } from "@/components/ui/loader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { DetailedCommissary } from "@/types/inventory";
import { TablePagination } from "@/components/shared/TablePagination";
import { EmptyState } from "@/components/custom/EmptyState";

const pageKey = "inventoryPricingPage";

const partialColumns = [
    { title: "Product Name", style: "" },
    { title: "Previous Inventory", style: "text-center" },
    { title: "Current Inventory", style: "" },
    { title: "Gross Sales (Day)", style: "" },
    { title: "Net Profit", style: "flex justify-end mr-4" },
];

const fullColumns = [
    { title: "Product Name", style: "" },
    { title: "Previous Inventory ", style: "" },
    { title: "Total Out", style: "" },
    { title: "Total In", style: "" },
    { title: "Current Inventory", style: "" },
    { title: "Status", style: "" },
    { title: "Total Inventory Cost", style: "" },
    { title: "Total Inventory Value", style: "" },
    { title: "Net Profit", style: "" },
    { title: "Cost per Unit", style: "" },
    { title: "Price per Unit", style: "" },
    { title: "Net Profit", style: "" },
    { title: "Gross Sales (Day)", style: "" },
    { title: "Capital", style: "" },
];

const CATEGORIES = ["MEAT", "SNOWFROST"];
const STATUSES = ["GOOD", "WARNING", "DANGER", "CRITICAL"];
const SORTS = ["product name", "total in", "total out", "price per unit"];

export function InventoryPricingPage({ className }: { className?: string }) {
    const { open } = useSidebar();
    const { dateObj } = useToday();
    const searchParams = useSearchParams();

    const [reload, setReload] = useState(false);
    const [byWeek, setByWeek] = useState(false);
    const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [selectedSort, setSelectedSort] = useState(SORTS[0]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [toggleDate, setToggleDate] = useState(false);
    const [display, setDisplay] = useState("PARTIAL");

    const columns = display === "PARTIAL" ? partialColumns : fullColumns;
    const selectedDate = searchParams.get("date");
    const parsedDate = selectedDate ? new Date(selectedDate) : null;

    const displayDate = parsedDate ? format(parsedDate, "MMMM dd, yyyy") : "Select date";

    const displayDay = parsedDate ? format(parsedDate, "EEEE").toUpperCase() : null;

    const { data: inventory, loading: loadingInventory } = useFetchData<DetailedCommissary>(
        SupplyOrderService.getDetailedCommissary,
        [date, byWeek, reload],
        [byWeek ? "WEEK" : "CUSTOM_DATE", date]
    );

    const filteredAndSorted = useMemo(() => {
        const list = (Array.isArray(inventory) ? inventory : []) as any[];

        const getName = (it: any) => it?.rawMaterial?.name ?? it?.product_name ?? "";
        const getCategory = (it: any) => it?.rawMaterial?.category ?? it?.category ?? "";
        const getStatus = (it: any) => it?.stockLevel ?? it?.status ?? "";
        const getTotalIn = (it: any) => Number(it?.totalIn ?? it?.total_in ?? 0);
        const getTotalOut = (it: any) => Number(it?.totalOut ?? it?.total_out ?? 0);
        const getPricePerUnit = (it: any) =>
            Number(it?.rawMaterial?.pricePerUnit ?? it?.price_per_unit ?? it?.pricePerUnit ?? 0);

        const filtered = list.filter((it) => {
            const cat = String(getCategory(it)).toUpperCase();
            const stat = String(getStatus(it)).toUpperCase();

            const okCategory = selectedCategory === "all" || cat === selectedCategory.toUpperCase();
            const okStatus = selectedStatus === "all" || stat === selectedStatus.toUpperCase();

            return okCategory && okStatus;
        });

        const sorted = [...filtered].sort((a, b) => {
            const key = (selectedSort ?? "").toLowerCase();

            if (key === "product name") return getName(a).localeCompare(getName(b));
            if (key === "total in") return getTotalIn(b) - getTotalIn(a);
            if (key === "total out") return getTotalOut(b) - getTotalOut(a);
            if (key === "price per unit") return getPricePerUnit(b) - getPricePerUnit(a);

            return 0;
        });

        return sorted;
    }, [inventory, selectedCategory, selectedStatus, selectedSort]);

    const { page, setPage, size, paginated } = usePagination(filteredAndSorted, 10, pageKey);

    useEffect(() => {
        setPage(0)
    }, [selectedCategory, selectedStatus, selectedSort])

    useEffect(() => {
        if (selectedDate) {
            setDate(selectedDate);
        } else {
            setDate(format(new Date(), "yyyy-MM-dd"));
        }
    }, [searchParams]);

    return (
        <section className={`stack-md ${className}`}>
            <AppHeader label="Inventory Summary for " hidePapiverseLogo={true} className="mt-auto" />

            <Separator className="bg-gray-300 mb-2" />

            <div className="flex-center-y justify-between">
                <div
                    onClick={() => setToggleDate(true)}
                    className="flex-center-y gap-3 text-xl font-bold mt-4 bg-white shadow-sm shadow-lightbrown px-4 py-2 rounded-md w-fit cursor-pointer"
                >
                    <CalendarDays />

                    <div className="scale-x-110 origin-left">
                        {byWeek && parsedDate
                            ? `${format(parsedDate, "MMM d, yyy")} - ${format(
                                new Date(parsedDate.getTime() + 6 * 24 * 60 * 60 * 1000),
                                "MMM d, yyy"
                            )}`
                            : displayDate}
                    </div>

                    <Badge className="bg-darkbrown font-bold ml-4">{byWeek ? "Sun-Sat" : displayDay}</Badge>
                </div>

                <div className="bg-white shadow-sm shadow-lightbrown rounded-md">
                    <Tooltip>
                        <TooltipTrigger
                            onClick={() => setDisplay("PARTIAL")}
                            className={`p-2 rounded-md ${display === "PARTIAL" && "bg-lightbrown text-white"}`}
                        >
                            <Shrink className="w-5 h-5" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-lightbrown font-bold mb-2" showArrow={false}>
                            PARTIAL DETAILS
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger
                            onClick={() => setDisplay("FULL")}
                            className={`p-2 rounded-md ${display === "FULL" && "bg-lightbrown text-white"}`}
                        >
                            <Expand className="w-5 h-5" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-lightbrown font-bold mb-2" showArrow={false}>
                            FULL DETAILS
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="w-full">
                    <div className="flex-center-y gap-2">
                        <ArrowUpDown className="w-4 h-4" />
                        <div>Sort</div>
                    </div>
                    <div className="flex-center-y row-md">
                        <Select value={selectedSort} onValueChange={setSelectedSort}>
                            <SelectTrigger className="w-full bg-white shadow-sm shadow-lightbrown">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent className="min-w-80 max-w-100">
                                {SORTS.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        By {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="w-full">
                    <div className="flex-center-y gap-2">
                        <Funnel className="w-4 h-4" />
                        <div>Filters</div>
                    </div>
            
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full bg-white shadow-sm shadow-lightbrown">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            <Separator className="bg-gray-300" />
                            {CATEGORIES.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                    
                <div className="w-full mt-auto">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full bg-white shadow-sm shadow-lightbrown">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All stock levels</SelectItem>
                            <Separator className="bg-gray-300" />
                            {STATUSES.map((item) => (
                                <SelectItem key={item} value={item}>
                                    <span
                                        className={`font-semibold ${
                                            item === "GOOD"
                                                ? "text-darkgreen"
                                                : item === "WARNING"
                                                ? "text-darkorange"
                                                : item === "DANGER"
                                                ? "text-darkred"
                                                : item === "CRITICAL"
                                                ? "text-black"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        {item}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

            </div>

            {loadingInventory ? (
                <SectionLoading />
            ) : (
                <div className={`table-wrapper-scrollable animate-fade-in-up mt-2 ${open ? "w-[82vw]" : "w-[94vw]"}`} key={display}>
                    <div
                        className="thead grid"
                        style={{
                            gridTemplateColumns: `220px repeat(${columns.length - 1}, minmax(150px, 1fr))`,
                            minWidth: `${220 + (columns.length - 1) * 150}px`,
                        }}
                    >
                        {columns.map((item) => (
                            <div key={item.title} className="th">
                                {item.title}
                            </div>
                        ))}
                    </div>

                    {paginated.length === 0 && (
                        <EmptyState />
                    )}

                    {display === "PARTIAL" ? (
                        paginated.map((item: any) => (
                            <div
                                className="tdata grid"
                                style={{
                                    gridTemplateColumns: `220px repeat(${columns.length - 1}, minmax(150px, 1fr))`,
                                    minWidth: `${220 + (columns.length - 1) * 150}px`,
                                }}
                            >
                                <div className="td">{item?.rawMaterial?.name ?? item?.product_name}</div>
                                <div className="td">{item?.previousInventory}</div>
                                <div className="td flex items-center gap-2">
                                    {item?.currentInventory !== item?.previousInventory && Number(item?.previousInventory) !== 0 && (
                                        <span
                                            className={`flex-center-y gap-1 text-xs font-semibold px-1 rounded-sm ${
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
                                            {Math.round(
                                                ((item.currentInventory - item.previousInventory) / item.previousInventory) * 100
                                            )}
                                            %
                                        </span>
                                    )}
                                    {item?.currentInventory}
                                </div>
                                <div className="td justify-between">
                                    <div>₱</div>
                                    {formatToPeso(0).slice(1)}
                                </div>
                                <div className="td justify-between">
                                    <div>₱</div>
                                    {formatToPeso(0).slice(1)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <></>
                    )}
                </div>
            )}

            <TablePagination 
                data={filteredAndSorted}
                paginated={paginated}
                page={page}
                setPage={setPage}
                size={size}
                pageKey={pageKey}
            />

            <DatePickerModal date={date} setDate={setDate} open={toggleDate} setOpen={setToggleDate} setByWeek={setByWeek} />
        </section>
    );
}
