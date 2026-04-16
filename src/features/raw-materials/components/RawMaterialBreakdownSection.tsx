import { TableFilter } from "@/components/shared/TableFilter";
import { TablePagination } from "@/components/shared/TablePagination";
import { SectionLoading } from "@/components/ui/loader";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { formatToPeso } from "@/lib/formatter";
import { InventoryService } from "@/services/inventory.service";
import { Claim } from "@/types/claims";
import { InventoryBreakdown } from "@/types/inventory";

function formatProfit(value: number) {
    return value < 0 ? `-${formatToPeso(Math.abs(value))}` : formatToPeso(value);
}

const pageKey = "inventoryBreakdownPage";
const columns = [
    { title: "Raw Material", style: "" },
    { title: "Quantity", style: "" },
    { title: "Unit Cost", style: "text-right" },
    { title: "Item Value", style: "text-right" },
];

export function RawMaterialBreakdownSection({ claims }: {
    claims: Claim
}) {
    const { data: breakdown, loading: loadingBreakdown, error } = useFetchOne<{
        total: {
            inventoryValue: number;
            inventoryCost: number;
            netProfit: number;
        };
        items: InventoryBreakdown[];
    }>(
        InventoryService.getInventoryBranchBreakdown,
        [claims.branch.branchId],
        [claims.branch.branchId, 0, 1000, 'RAW_MATERIAL']
    );

    const { search, setSearch, filteredItems } = useSearchFilter(
        breakdown?.items ?? [],
        ["name", "sku"]
    );

    const { page, setPage, size, setSize, paginated } = usePagination(filteredItems, 20, pageKey);

    if (loadingBreakdown) return <SectionLoading />
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                    {
                        label: "Current Raw Materials Value",
                        value: formatToPeso(breakdown?.total.inventoryValue ?? 0),
                        helper: "Summation of inventory prices",
                    },
                    {
                        label: "Current Raw Materials Cost",
                        value: formatToPeso(breakdown?.total.inventoryCost ?? 0),
                        helper: "Summation of inventory cost",
                    },
                    {
                        label: "Net Profit",
                        value: formatProfit(breakdown?.total.netProfit ?? 0),
                        helper: "Profit summation of each inventory",
                        isNegative: (breakdown?.total.netProfit ?? 0) < 0,
                    },
                ].map((item) => (
                    <div key={item.label} className="gap-3 rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">
                            {item.label}
                        </p>
                        <p className={`mt-3 text-2xl font-semibold ${item.isNegative ? "text-darkred" : "text-slate-900"}`}>
                            {item.value}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
                    </div>
                ))}
            </div>

            <TableFilter
                setSearch={setSearch}
                searchPlaceholder="Search for an inventory"
                size={size}
                setSize={setSize}
                removeAdd
            />

            <div className="table-wrapper">
                <div className="thead grid grid-cols-4 max-md:w-7xl!">
                    {columns.map((item) => (
                        <div key={item.title} className={`th ${item.style}`}>
                            {item.title}
                        </div>
                    ))}
                </div>

                <div className="animate-fade-in-up" key={`${page}`}>
                    {paginated.length > 0 ? (
                        paginated.map((item) => (
                            <div className="tdata grid grid-cols-4 max-md:w-7xl!" key={item.inventoryId}>
                                <div className="td gap-2">
                                    <div className="min-w-0">
                                        <div className="truncate font-semibold text-slate-900">
                                            {item.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {item.sku}
                                        </div>
                                    </div>
                                </div>

                                <div className="td flex-col items-start!">
                                    <span 
                                        className={`font-semibold mr-1
                                            
                                        `}>
                                        { item.quantity?.toFixed(3) }
                                    </span> 
                                    { item.unitMeasurement }
                                </div>

                                <div className="td justify-between">
                                    <div>₱</div>
                                    <div>{formatToPeso(item.unitCost).slice(1,)}</div>
                                </div>

                                <div className="td justify-between">
                                    <div>₱</div>
                                    <div>{formatToPeso(item.itemValue).slice(1,)}</div>
                                </div>

                                {/* <div className={`td justify-between font-semibold ${item.itemNetProfit < 0 ? "text-darkred" : "text-darkgreen"}`}>
                                    <div>₱</div>
                                    {formatProfit(item.itemNetProfit).slice(1,)}
                                </div> */}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-8 my-2 text-center text-sm">There are no inventory breakdown items yet.</div>
                    )}
                </div>
            </div>

            {paginated.length > 0 && (
                <TablePagination
                    data={breakdown?.items ?? []}
                    paginated={paginated}
                    page={page}
                    size={size}
                    setPage={setPage}
                    search={search}
                    pageKey={pageKey}
                />
            )}
        </>
    )
}