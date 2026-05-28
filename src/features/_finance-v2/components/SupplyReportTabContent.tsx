import { Badge } from "@/components/ui/badge";
import { PapiverseLoading, SectionLoading } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { formatNumber, formatToPeso } from "@/lib/formatter";
import { FinanceService } from "@/services/finance.service";
import { Ham, PackageX, Snowflake } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const REQUIRED_CATEGORIES = ["MEAT", "SNOWFROST"];

const columns = [
  { title: "Product", style: "" },
  { title: "Movement", style: "" },
  { title: "Capital", style: "" },
  { title: "Sales", style: "" },
  { title: "Profit", style: "" },
];

type SupplyReportTabContentProps = {
  startDate: string;
  endDate: string;
};

type SupplyReportCategory = {
  category: string;
  producedQuantity: number;
  soldQuantity: number;
  capital: number;
  sales: number;
  profit: number;
};

type SupplyReportProduct = {
  rawMaterialId: number;
  sku: string;
  name: string;
  category: string;
  unitMeasurement: string;
  producedQuantity: number;
  soldQuantity: number;
  capital: number;
  sales: number;
  profit: number;
};

type SupplyReportResponse = {
  branchId: number;
  branchName: string;
  startDate: string;
  endDate: string;
  meatExpenses: number;
  snowExpenses: number;
  totalExpenses: number;
  totalDelivery: number;
  totalOthers: number;
  renProfit: number;
  jerryProfit: number;
  excludedMeatProfit: number
  overall: {
    producedQuantity: number;
    soldQuantity: number;
    capital: number;
    sales: number;
    profit: number;
  };
  categories: SupplyReportCategory[];
  products: SupplyReportProduct[];
  expenses?: { category: string; totalExpenses: number }[];
};

export function SupplyReportTabContent({ startDate, endDate }: SupplyReportTabContentProps) {
  const { data: report, loading: loadingReport } = useFetchOne<SupplyReportResponse>(
    FinanceService.getSupplyFinanceReport,
    [startDate, endDate],
    [1, startDate, endDate]
  );

  const categories = useMemo<SupplyReportCategory[]>(() => {
    const existingCategories = report?.categories ?? [];
    const normalizedCategories = new Map<string, SupplyReportCategory>(
      existingCategories.map((category) => [category.category, category])
    );

    REQUIRED_CATEGORIES.forEach((category) => {
      if (!normalizedCategories.has(category)) {
        normalizedCategories.set(category, {
          category,
          producedQuantity: 0,
          soldQuantity: 0,
          capital: 0,
          sales: 0,
          profit: 0,
        });
      }
    });

    return Array.from(normalizedCategories.values());
  }, [report?.categories]);

  const snowfrostCategory = useMemo<SupplyReportCategory | undefined>(
    () => categories.find((category) => String(category.category).toUpperCase() === "SNOWFROST"),
    [categories]
  );

  const expensesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    (report?.expenses ?? []).forEach((expense) => {
      map.set(String(expense.category).toUpperCase(), Number(expense.totalExpenses ?? 0));
    });

    return {
      meat: map.get("MEAT") ?? Number(report?.meatExpenses ?? 0),
      snowfrost: map.get("SNOWFROST") ?? Number(report?.snowExpenses ?? 0),
    };
  }, [report?.expenses, report?.meatExpenses, report?.snowExpenses]);

  const snowfrostProfit = Number(snowfrostCategory?.profit ?? 0);
  const renProfit = Number(report?.renProfit ?? 0);

  if (loadingReport || !report) return <SectionLoading />;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-9">
        {[
          {
            label: "Capital",
            value: formatToPeso(report.overall.capital),
            helper: "Estimated input cost",
          },
          {
            label: "Sales",
            value: formatToPeso(report.overall.sales),
            helper: "Gross recorded sales",
          },
          {
            label: "Profit",
            value: formatToPeso(report.overall.profit),
          },
          {
            label: "Total Expenses",
            value: formatToPeso(report.totalExpenses),
            helper: "Total expenditure",
          },
          {
            label: "Delivery Fees",
            value: formatToPeso(report.totalDelivery),
            helper: "Delivery fees on supply orders",
          },
          {
            label: "Other Fees",
            value: formatToPeso(report.totalOthers),
            helper: "Other fees on supply orders",
          },
        ].map((item) => (
          <div key={item.label} className={`gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300 ${item.label === 'Profit' ? 'row-span-2 col-span-3' : ['Capital', 'Sales'].includes(item.label) ? 'col-span-3' : 'col-span-2'}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">{item.label}</p>
            <p className={`mt-3 text-2xl font-semibold ${item.label === "Profit" && report.overall.profit < 0 ? "text-darkred" : "text-slate-900"} ${item.label === 'Total Expenses' && 'text-darkred! font-bold!'} ${item.label === 'Profit' && 'text-3xl font-bold text-darkgreen!'}`}>
              {item.value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
            {item.label === "Profit" && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] mt-auto">Snowfrost profit:</p>
                  <span className="mt-1 text-xl text-darkbrown font-semibold">{formatToPeso(snowfrostProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] mt-auto">meat profit:</p>
                  <span className="mt-1 text-xl text-darkbrown font-semibold ml-1.5">{formatToPeso(report.excludedMeatProfit)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-4">
        {categories.map((category) => {
          const sellThrough = category.producedQuantity > 0
            ? Math.round((category.soldQuantity / category.producedQuantity) * 100)
            : 0;

          const isMeat = String(category.category).toUpperCase() === "MEAT";

          return (
            <div key={category.category} className="w-full rounded-md border border-slate-300 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-darkbrown">{category.category} Breakdown</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {Number(category.soldQuantity).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} sold from {" "}
                    {Number(category.producedQuantity).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} produced
                  </p>
                </div>
                <Badge variant="outline" className="border-darkgreen bg-emerald-50 text-darkgreen">
                  {sellThrough}% sell-through
                </Badge>
              </div>

              <Separator className="my-2" />

              <div className="grid grid-cols-3 gap-3">
                <div className="mt-auto rounded-xl bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Capital</p>
                  <p className="mt-2 font-semibold text-slate-900">{formatToPeso(category.capital)}</p>
                </div>
                <div className="mt-auto rounded-xl bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Sales</p>
                  <p className="mt-2 font-semibold text-slate-900">{formatToPeso(category.sales)}</p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{isMeat ? "Jerry Profit" : "Snowfrost Profit"}</p>
                  <p className={`mt-2 text-lg font-bold scale-x-110 origin-left ${category.profit < 0 ? "text-darkred" : "text-green-700"}`}>
                    {isMeat ? formatToPeso(report.jerryProfit) : formatToPeso(category.profit)}
                  </p>
                </div>
                {isMeat ? (
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">MEAT Expenses</p>
                    <p className="mt-2 font-bold text-darkred text-xl">{formatToPeso(expensesByCategory.meat)}</p>
                  </div>
                ) : (
                  <div className="col-span-2 rounded-xl bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Snowfrost Expenses</p>
                    <p className="mt-2 font-bold text-darkred text-xl">{formatToPeso(expensesByCategory.snowfrost)}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex-center-y justify-between">
          <div>
            <div className="text-darkbrown font-bold text-xl">Product Details</div>
            <div className="text-sm text-gray">Item-level sales and profit performance for the selected range.</div>
          </div>
          <Link href={`/finance/supply-breakdown`} className="hover:underline max-sm:text-right">
            View All
          </Link>
        </div>
        <div>
          <div className="table-wrapper">
            <div className="thead grid grid-cols-5">
              {columns.map((item, i) => (
                <div className={`th ${item.title === "Profit" ? "bg-darkgreen/15! text-darkgreen font-bold" : ""}`} key={i}>{item.title}</div>
              ))}
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {report.products.map((item: any) => (
                <div key={item.rawMaterialId} className="tdata grid grid-cols-5">
                  <div className="td gap-2">
                    <Tooltip>
                      <TooltipTrigger>
                        {item.category === "MEAT"
                          ? <Ham className="w-4 h-4 text-darkbrown" />
                          : item.category === "SNOWFROST"
                            ? <Snowflake className="w-4 h-4 text-blue" />
                            : <PackageX className="w-4 h-4 text-slate-400" />}
                      </TooltipTrigger>
                      <TooltipContent>
                        {item.category === "MEAT"
                          ? "MEAT Category"
                          : item.category === "SNOWFROST"
                            ? "SNOW FROST Category"
                            : "NON DELIVERABLES"}
                      </TooltipContent>
                    </Tooltip>
                    {item.name}
                  </div>

                  <div className="td flex-col items-start! text-slate-600">
                    <p className="font-medium text-slate-900">{formatNumber(item.soldQuantity)} sold</p>
                    <p className="text-xs text-slate-500">{formatNumber(item.producedQuantity)} produced</p>
                  </div>

                  <div className="td justify-between">
                    {item.capital !== null && item.capital !== undefined ? <><div>₱</div><div>{formatToPeso(item.capital).slice(1)}</div></> : <span className="text-xs text-gray">Not available</span>}
                  </div>

                  <div className="td justify-between">
                    {item.sales !== null && item.sales !== undefined ? <><div>₱</div><div>{formatToPeso(item.sales).slice(1)}</div></> : <span className="text-xs text-gray">Not available</span>}
                  </div>

                  <div className={`td justify-between font-semibold bg-darkgreen/8! ${item.profit < 0 ? "text-darkred" : "text-darkgreen"}`}>
                    {item.profit !== null && item.profit !== undefined ? <><div>₱</div><div>{formatToPeso(item.profit).slice(1)}</div></> : <span className="text-xs text-gray">Not available</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
