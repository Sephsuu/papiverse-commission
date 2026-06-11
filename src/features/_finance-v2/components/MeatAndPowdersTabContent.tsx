import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { SectionLoading } from "@/components/ui/loader";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { formatNumber, formatToPeso } from "@/lib/formatter";
import { FinanceService, MeatAndPowdersNetIncomeType } from "@/services/finance.service";
import { useState } from "react";

type MeatPowderItem = {
  rawMaterialName: string;
  quantity: number;
  capital: number;
  srp: number;
  gross: number;
  totalCapital: number;
  net: number;
};

type MeatPowderSection = {
  key: string;
  items: MeatPowderItem[];
  total: {
    gross: number;
    totalCapital: number;
    net: number;
  };
};

type MeatPowdersReport = {
  month: string;
  startDate: string;
  endDate: string;
  branchNames: string[];
  sections: MeatPowderSection[];
  overall: {
    gross: number;
    totalCapital: number;
    net: number;
  };
};

type Props = {
  month: string;
};

const columns = ["Raw Material", "Quantity", "Capital", "SRP", "Gross", "Total Capital", "Net"];
const reportTabs = ["Maguyam / Trece", "All", "Internal", "External"] as const;

type ReportTab = (typeof reportTabs)[number];

const reportTypeByTab: Record<ReportTab, MeatAndPowdersNetIncomeType | undefined> = {
  "Maguyam / Trece": undefined,
  All: "all",
  Internal: "internal",
  External: "external",
};

export function MeatAndPowdersTabContent({ month }: Props) {
  const [selectedReportTab, setSelectedReportTab] = useState<ReportTab>(reportTabs[0]);
  const selectedReportType = reportTypeByTab[selectedReportTab];
  const { data: report, loading } = useFetchOne<MeatPowdersReport>(
    FinanceService.getMeatAndPowders,
    [month, selectedReportType],
    [month, selectedReportType]
  );

  return (
    <div className="space-y-4 pb-12">
      <AppTabSwitcher
        tabs={[...reportTabs]}
        selectedTab={selectedReportTab}
        setSelectedTab={(tab) => setSelectedReportTab(tab as ReportTab)}
        buttonClassName="w-40! shrink-0 whitespace-nowrap"
        className="max-w-full overflow-x-auto"
      />

      {loading || !report ? (
        <SectionLoading />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Gross</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(report.overall.gross)}</p>
            </div>
            <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Total Capital</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{formatToPeso(report.overall.totalCapital)}</p>
            </div>
            <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Net</p>
              <p className={`mt-3 text-2xl font-semibold ${report.overall.net < 0 ? "text-darkred" : "text-darkgreen"}`}>
                {formatToPeso(report.overall.net)}
              </p>
            </div>
          </div>
 
          <div className="flex-center-y justify-between">
            <div className="text-darkbrown font-bold">Branches Included</div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {(report.branchNames ?? []).length} Branches
            </div>
          </div>
          <div className="flex flex-wrap gap-2 -mt-2">
            {(report.branchNames ?? []).length > 0 ? (
              report.branchNames.map((branchName) => (
                <div
                  key={branchName}
                  className="rounded-full border border-darkbrown/20 bg-darkbrown/5 px-3 py-1 text-sm font-medium text-darkbrown"
                >
                  {branchName}
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No branches found for this month.</div>
            )}
          </div>

          {report.sections.map((section) => (
            <div key={section.key} className="space-y-2">
              <div className="table-wrapper">
                <div className="thead grid grid-cols-7">
                  {columns.map((col) => (
                    <div key={col} className="th">{col}</div>
                  ))}
                </div>

                <div className="divide-y divide-slate-200 bg-white">
                  {section.items.map((item) => (
                    <div key={item.rawMaterialName} className="tdata grid grid-cols-7">
                      <div className="td font-medium">{item.rawMaterialName}</div>
                      <div className="td text-right">{formatNumber(item.quantity)}</div>
                      <div className="td justify-between"><span>₱</span><span>{formatToPeso(item.capital).slice(1)}</span></div>
                      <div className="td justify-between"><span>₱</span><span>{formatToPeso(item.srp).slice(1)}</span></div>
                      <div className="td justify-between"><span>₱</span><span>{formatToPeso(item.gross).slice(1)}</span></div>
                      <div className="td justify-between"><span>₱</span><span>{formatToPeso(item.totalCapital).slice(1)}</span></div>
                      <div className={`td justify-between font-semibold ${item.net < 0 ? "text-darkred" : "text-darkgreen"}`}><span>₱</span><span>{formatToPeso(item.net).slice(1)}</span></div>
                    </div>
                  ))}

                  <div className="tdata grid grid-cols-7 bg-darkbrown/5! font-semibold">
                    <div className="td text-darkbrown">Section Total</div>
                    <div className="td">-</div>
                    <div className="td">-</div>
                    <div className="td">-</div>
                    <div className="td justify-between"><span>₱</span><span>{formatToPeso(section.total.gross).slice(1)}</span></div>
                    <div className="td justify-between"><span>₱</span><span>{formatToPeso(section.total.totalCapital).slice(1)}</span></div>
                    <div className={`td justify-between ${section.total.net < 0 ? "text-darkred" : "text-darkgreen"}`}><span>₱</span><span>{formatToPeso(section.total.net).slice(1)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
