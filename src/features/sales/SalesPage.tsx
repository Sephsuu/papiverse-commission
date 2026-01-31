"use client"

import { PapiverseLoading, SectionLoading } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { formatCompactNumber, formatCustomDate, formatDateToWords, formatToPeso } from "@/lib/formatter"
import { SalesService } from "@/services/sales.service";
import { Inbox, LineChart, NotepadText, X, CalendarRange, Calendar1, CalendarSync } from "lucide-react";
import { Fragment, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DateRangePicker } from "../dashboard/components/DataRangePicker";
import { format, parseISO } from "date-fns";
import { EmptyState } from "@/components/ui/fallback";
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IngestedSales } from "./components/IngestedSales";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { MonthPicker } from "../dashboard/components/MonthPicker";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ErrorPage } from "@/components/custom/ErrorPage";

const chartTabs = ['DAY', 'WEEK', 'MONTH'];
const dateModes = ['Monthly Sales', 'Annual Sales', 'Sales of Custom Range']
const today = format(new Date(), "yyyy-MM-dd");
const columns = [
    { title: "Order ID", style: "" },
    { title: "Products", style: "" },
]

export function SalesPage({ branchId }: {
    branchId?: number;
}) {    
    const pathname = usePathname();

    const { claims, loading: authLoading, isFranchisor } = useAuth();
    const [dateMode, setDateMode] = useState(dateModes[0]);
    const [chartTab, setChartTab] = useState(chartTabs[0]);
    const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split("T")[0]);
    const [startDate, setStartDate] = useState<string>(today);
    const [endDate, setEndDate] = useState<string>(today);

    const branch = branchId ?? claims.branch.branchId;

    const salesGraphService = !isFranchisor || branchId
        ? SalesService.generateGraph
        : SalesService.generateFranchisorGraph;

    const graphParams = !isFranchisor || branchId
        ? [branch, startDate, endDate, chartTab]
        : [startDate, endDate, chartTab];

    const { data: salesGraph, loading: graphLoading, error: errorSalesGraph } = useFetchData(
        salesGraphService,
        graphParams,
        graphParams
    )

    const params = !isFranchisor || branchId
        ? [branch, startDate, endDate]
        : [startDate, endDate];

    const service = !isFranchisor || branchId
        ? SalesService.getSalesByBranch
        : SalesService.getOverallSummary;

    const { data, loading } = useFetchOne(
        service,
        params,
        params
    );    

    const { data: paidOrders, loading: paidOrdersLoading, error: errorPaidOrder } = useFetchData<{
        orderId: string;
        cash: number;
        orderType: string;
        totalPaid: number;
        items: {
            productName: string;
            quantity: number;
        } []
    }>(
        SalesService.getPaidOrders, 
        [selectedDay], 
        [claims.branch.branchId, selectedDay, selectedDay]
    );
    const { setSearch, filteredItems } = useSearchFilter(paidOrders, ["orderId"])   
    const selectedDate = selectedDay ? parseISO(selectedDay) : undefined;
 

    if (loading || authLoading || graphLoading || paidOrdersLoading) return <SectionLoading />

    if (errorSalesGraph) return <ErrorPage error={"Sales page was disabled"} className="-mt-12" /> 
    if (errorPaidOrder) return <ErrorPage error={"Sales page was disables"} className="-mt-12" /> 
    
    const summary = [
        { title: 'Total Orders', date: formatCustomDate('2025-08-21 22:45:19'), count: data.totalOrders ?? 0  },
        { title: 'Payment Methods', date: formatCustomDate('2025-08-21 22:45:19'), count: formatToPeso(data.totalCash), type: "Cash"  },
        { title: 'Payment Methods', count: formatToPeso(data.totalGcash), type: "G-cash"  },
        { title: 'Type of Orders', count: data.totalDineIn ?? 0, type: "Dine in"  },
        { title: 'Type of Orders', count: data.totalTakeAway ?? 0, type: "Take out"  },
        { title: 'Total Sales', count: formatToPeso(data.totalIncome)  },
    ]

    const grouped = summary.reduce((acc, item) => {
        if (!acc[item.title]) {
            acc[item.title] = [];
        }
        acc[item.title].push(item);
        return acc;
    }, {} as Record<string, typeof summary>);

    return (
        <section className="stack-md animate-fade-in-up">
            <div className="flex-center-y justify-between max-md:flex-col max-sm:gap-2">
                <div className="text-lg font-semibold pl-2 scale-x-110 origin-left whitespace-normal wrap-break-word flex">
                    { formatSummaryDate(startDate, endDate) }
                </div>
                <div className="flex-center-y gap-2">
                    {dateMode === dateModes[0] && (
                        <MonthPicker 
                            startDate={ startDate }
                            endDate={ endDate }
                            setStartDate={ setStartDate }
                            setEndDate={ setEndDate }
                        />
                    )}
                    {dateMode === dateModes[1] && (
                        <DateRangePicker 
                            startDate={ startDate }
                            endDate={ endDate }
                            setStartDate={ setStartDate }
                            setEndDate={ setEndDate }
                        />
                    )}                    
                    <ShadcnTooltip>
                        <TooltipTrigger>
                            <CalendarSync 
                                className="text-gray w-4 h-4" 
                                onClick={() => setDateMode(dateMode === dateModes[0] ? dateModes[1] : dateModes[0])} 
                            />
                        </TooltipTrigger>
                        <TooltipContent>{dateMode === dateModes[0] ? "Select Custom Date" : "Select Mobnthly Sales"}</TooltipContent>
                    </ShadcnTooltip>
                </div>
   
            </div>

            <div className="flex items-stretch gap-2 max-md:overflow-x-auto">
                {Object.entries(grouped).map(([key, value]) => (
                    <div 
                        className="flex flex-col gap-2 flex-1 w-full p-4 bg-white shadow-sm rounded-md  max-md:flex-none"
                        key={key}
                    >
                        <div className="font-semibold flex items-center justify-between">
                            <div className="text-sm">{ key }</div>
                            <div className="w-6 h-6 flex justify-center items-center rounded-full bg-darkorange text-light"><NotepadText className="w-4 h-4"/></div>
                        </div>
                        <div className="grid grid-cols-2 flex-1">
                        {value.map((item, index) => (
                            <Fragment key={ index }>
                                {item.type ? (
                                    <div>
                                        <div className="text-xs">{ item.type }</div>
                                     
                                        <ShadcnTooltip>
                                            <TooltipTrigger className={`${["Cash", "G-cash"].includes(item.type) && "text-[15px]"} ml-3 text-2xl font-semibold scale-x-120 text-darkbrown`}>
                                                {typeof item.count === "string"
                                                    ? `₱${formatCompactNumber(item.count)}`
                                                    : formatCompactNumber(item.count)       
                                                }
                                            </TooltipTrigger>
                                            <TooltipContent>{ item.count }</TooltipContent>
                                        </ShadcnTooltip>
                                    </div>                                            
                                ) : (<div className="ml-3 text-2xl font-semibold scale-x-120 text-darkbrown">{item.count}</div>)}
                            </Fragment>
                        ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="shadow-sm bg-white rounded-xl overflow-hidden">
                <div className="w-full flex items-center justify-between bg-slate-50 px-5 py-4 max-md:block">
                    <div className="text-lg scale-x-110 font-semibold text-darkbrown px-2">Sales Revenue</div>
                    <div className="flex items-center gap-4 mr-12 max-md:mr-0 max-md:justify-center max-md:mt-2">
                        {chartTabs.map((item, index) => (
                            <button
                                onClick={ () => setChartTab(item) }
                                className={`text-sm text-gray ${chartTab === item && "text-dark! font-semibold"}`}
                                key={ index }
                            >
                                { item }
                            </button>
                        ))}
                    </div>
                    
                </div>
                {graphLoading ? (
                    <SectionLoading />
                ) : !salesGraph || salesGraph.length === 0 ? (
                    <div className="flex-center flex-col h-[200px] text-gray-400 gap-2">
                        <LineChart className="w-15 h-15 text-gray-300" />
                        <div>No sales data available for this range.</div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={salesGraph} margin={{ top: 40, right: 10, left: 10, bottom: 0 }}>
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={(dateStr) => {
                                    const date = new Date(dateStr);
                                    const monthName = date.getMonth() + 1;
                                    const day = date.getDate();
                                    return `${monthName}/${day}`; 
                                }}
                                tick={{ fontSize: 12 }}
                            />

                            <YAxis 
                                tickFormatter={(sales) => (sales === 0 ? "" : formatToPeso(sales))}
                                tick={{ fontSize: 12 }}
                            />

                            <CartesianGrid strokeDasharray="3 3" />

                            <Tooltip 
                                formatter={(value: number) => [`${formatToPeso(value)}`, "Sales"]} 
                                labelFormatter={(date: string) => formatDateToWords(date)}
                                contentStyle={{ fontSize: 12, backgroundColor: "#fff", border: "1px solid #ccc" }} 
                                itemStyle={{ fontSize: 12, color: "#8884d8" }}
                            />

                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <Area 
                                type="linear"
                                dataKey="sales"
                                stroke="#8884d8"
                                strokeWidth={3}
                                fill="url(#colorSales)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}

            </div>

            <div className={`grid grid-cols-1 gap-4 mt-2 pb-4 ${!branchId && "xl:grid-cols-2"}`}>
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex-center-y justify-between px-5 py-4 border-b bg-gray-50">
                        <h3 className="text-lg font-bold tracking-tight text-darkbrown flex items-center gap-2 scale-x-110 origin-left">
                            Top Selling Products
                        </h3>
                        <Link 
                            className="hover:font-semibold"
                            href="/sales/product-ranking"
                        >
                            See all
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white border-b text-darkbrown text-xs uppercase">
                                <tr className="text-dark text-sm">
                                    <th className="py-3 px-4 text-left w-12">#</th>
                                    <th className="py-3 px-4 text-left">Product Name</th>
                                    <th className="py-3 px-4 text-right">Total Sales</th>
                                    <th className="py-3 px-4 text-right">Orders</th>
                                </tr>
                            </thead>

                            <tbody>
                                {(!data.topProducts || data.topProducts.length === 0) ? (
                                    <tr>
                                        <td colSpan={4} className="py-6">
                                            <EmptyState message="No top products available" />
                                        </td>
                                    </tr>
                                ) : (
                                    <Fragment>
                                        {data.topProducts.map((
                                            item: {
                                                productName: string,
                                                amount: number;
                                                quantity: number;
                                            }, 
                                            index: number
                                        ) => {
                                            const rankColor =
                                                index === 0 ? "text-yellow-600" :
                                                index === 1 ? "text-gray-500" :
                                                index === 2 ? "text-amber-700" : "text-darkbrown";

                                            return (
                                                <tr
                                                    key={index}
                                                    className="border-b last:border-b-0 hover:bg-gray-50/70 transition-all"
                                                >
                                                    <td className={`py-3 px-4 font-bold ${rankColor}`}>
                                                        {index + 1}
                                                    </td>

                                                    <td className="py-3 px-4 font-medium text-gray-700">
                                                        {item.productName}
                                                    </td>

                                                    <td className="py-3 px-4 font-semibold text-right text-darkbrown">
                                                        {formatToPeso(item.amount)}
                                                    </td>

                                                    <td className="py-3 px-4 text-right text-gray-700">
                                                        {item.quantity}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </Fragment>
                                )}

                                
                            </tbody>
                        </table>
                    </div>
                </div>

                {!branchId && isFranchisor && (
                    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                        <div className="flex-center-y justify-between px-5 py-4 border-b bg-gray-50">
                            <h3 className="text-lg font-bold tracking-tight text-darkbrown flex items-center gap-2 scale-x-110 origin-left">
                                Top Performing Branches
                            </h3>
                            <Link 
                                className="hover:font-semibold"
                                href="/sales/branch-ranking"
                            >
                                See all
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-white border-b text-darkbrown text-xs uppercase">
                                    <tr className="text-dark text-sm">
                                        <th className="py-3 px-4 text-left w-12">#</th>
                                        <th className="py-3 px-4 text-left">Branch Name</th>
                                        <th className="py-3 px-4 text-right">Total Sales</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {(!data.topBranches || data.topBranches.length === 0) ? (
                                        <tr>
                                            <td colSpan={3} className="py-6">
                                                <EmptyState message="No top branches available" />
                                            </td>
                                        </tr>
                                    ) : (
                                        <div>
                                            {data.topBranches.map((
                                                item: {
                                                    branchName: string;
                                                    totalSales: number
                                                }, 
                                                index: number
                                            ) => {
                                                const rankColor =
                                                    index === 0 ? "text-yellow-600" :
                                                    index === 1 ? "text-gray-500" :
                                                    index === 2 ? "text-amber-700" : "text-darkbrown";

                                                return (
                                                    <tr
                                                        key={index}
                                                        className="border-b last:border-b-0 hover:bg-gray-50/70 transition-all"
                                                    >
                                                        <td className={`py-3 px-4 font-bold ${rankColor}`}>
                                                            {index + 1}
                                                        </td>

                                                        <td className="py-3 px-4 font-medium text-gray-700">
                                                            {item.branchName}
                                                        </td>

                                                        <td className="py-3 px-4 font-semibold text-right text-darkbrown">
                                                            {formatToPeso(item.totalSales)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </div>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {(!isFranchisor || pathname === "/sales/branches") && (
                    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                        <div className="flex-center-y justify-between px-5 py-4 border-b bg-gray-50">
                            <h3 className="text-lg font-bold tracking-tight text-darkbrown flex items-center gap-2 scale-x-110 origin-left">
                                Ingested Sales on { selectedDay }
                            </h3>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-[220px] justify-start text-left font-normal"
                                    >
                                        {selectedDate
                                            ? format(selectedDate, "MMMM d, yyyy")
                                            : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        if (!date) return;

                                        // convert Date → YYYY-MM-DD
                                        const formatted = format(date, "yyyy-MM-dd");
                                        setSelectedDay(formatted);
                                    }}
                                    initialFocus
                                    />
                                </PopoverContent>
                                </Popover>

                        </div>

                        <ScrollArea className="table-wrapper h-100">
                            <div className="thead grid grid-cols-2 sticky top-0">
                                {columns.map((item) => (
                                    <div className="td" key={item.title}>{ item.title }</div>
                                ))}
                            </div>
            
                            {filteredItems.length === 0 ? (
                                <div className="flex-center flex-col w-full bg-light h-100 rounded-b-md">
                                    <Inbox className="w-30 h-30 text-gray-300" strokeWidth={2} />
                                    <div className="text-gray text-center text-sm">
                                        You have no ingested sales for day { formatDateToWords(selectedDay) }
                                    </div>
                                </div>
                            ) : (
                                filteredItems.map((
                                    item: {
                                        orderId: string;
                                        cash: number;
                                        orderType: string;
                                        totalPaid: number;
                                        items: {
                                            productName: string;
                                            quantity: number;
                                        } []
                                    }, 
                                    i: number
                                ) => (
                                    <div className="tdata grid grid-cols-2 border-gray! border-b!" key={i}>
                                        <div className="td border-r">
                                            <div className="font-semibold text-xs">ORDER ID</div>
                                            <div>{ item.orderId }</div>
            
                                            <div className="font-semibold text-xs mt-2">PAYMENT TYPE</div>
                                            <div>{ item.cash !== 0 ? "Cash" : "G-cash" }</div>
            
                                            <div className="font-semibold text-xs mt-2">ORDER TYPE</div>
                                            <div>{ item.orderType }</div>
            
                                            <div className="font-semibold text-xs mt-3">TOTAL AMOUNT</div>
                                            <div className="font-bold text-darkgreen">
                                                { formatToPeso(item.totalPaid) }
                                            </div>
                                        </div>
            
                                        <div className="td">
                                            {item.items.map((subItem, i) => (
                                                <div className="flex-center-y gap-1 py-1" key={i}>
                                                    <p>{ subItem.productName }</p>
                                                    <X className="w-3 h-3" />
                                                    { subItem.quantity }
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </ScrollArea>
                    </div>
                )}
            </div>


        </section>
    )
}

function formatSummaryDate(start: string, end: string) {
    const startFormatted = format(new Date(start), "MMMM d, yyyy");
    const endFormatted = format(new Date(end), "MMMM d, yyyy");

    if (start === end) {
        return (
            <div>As of <span className="text-darkorange">{`${startFormatted}`}</span></div>
        );
    }

    return (
        <div className="whitespace-normal wrap-break-word">
            From <span className="text-darkorange wrap-break-word">{`${startFormatted} - ${endFormatted}`}</span>
        </div>
    )
}

