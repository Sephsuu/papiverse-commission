import { Card } from "@/components/ui/card";
import { formatToPeso } from "@/lib/formatter";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type WeeklyTotals = {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
    total: number;
};

type WeeklyChartItem = {
    label: string;
    meat: number;
    snowfrost: number;
    combined: number;
};

type Props = {
    combinedWeekTotals: WeeklyTotals;
    meatTotals: WeeklyTotals;
    snowTotals: WeeklyTotals;
    allocatedWeeklyChartData: WeeklyChartItem[];
    allocatedCategoryChartData: Array<{
        label: string;
        total: number;
        orderCategory: string;
    }>;
    paymentModeChartData: Array<{
        modeOfPayment: string;
        total: number;
        percentage: number;
        count: number;
    }>;
};

export function ExpensesOverview({
    combinedWeekTotals,
    meatTotals,
    snowTotals,
    allocatedWeeklyChartData,
    allocatedCategoryChartData,
    paymentModeChartData,
}: Props) {
    const categoryChartData = allocatedCategoryChartData.map((item) => ({
        ...item,
        fill: item.orderCategory === "SNOWFROST" ? "#007aa5" : "#bf3612",
    })).filter((item) => item.total > 0);

    return (
        <div className="animate-fade-in-up">
            <div className="mb-2 grid gap-4 animate-fade-in-up md:grid-cols-2 xl:grid-cols-3">
                {[
                    {
                        label: "Overall Expenses",
                        value: formatToPeso(combinedWeekTotals.total),
                        helper: "Total expenditure for selected month",
                    },
                    {
                        label: "MEAT Expenses",
                        value: formatToPeso(meatTotals.total),
                        helper: "Total MEAT category expenditure",
                    },
                    {
                        label: "SNOWFROST Expenses",
                        value: formatToPeso(snowTotals.total),
                        helper: "Total SNOWFROST category expenditure",
                    },
                ].map((item) => (
                    <div key={item.label} className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">{item.label}</p>
                        <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
                    </div>
                ))}
            </div>

            <Card className="w-full bg-light p-4">
                <div>
                    <div className="text-darkbrown font-bold text-xl">Weekly Expenses Chart</div>
                    <div className="text-sm text-gray">Weekly total expenses for the selected month, shown in Philippine peso (₱).</div>
                </div>

                <div className="h-52 w-full">
                    {allocatedWeeklyChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={allocatedWeeklyChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(value: number) => `₱${Number(value).toLocaleString()}`} />
                                <Tooltip formatter={(value: number) => formatToPeso(Number(value))} />
                                <Bar dataKey="combined" name="COMBINED" fill="#653818" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="meat" name="MEAT" fill="#bf3612" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="snowfrost" name="SNOW FROST" fill="#007aa5" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-gray">There are no expenses yet.</div>
                    )}
                </div>
            </Card>

            <Card className="mt-4 w-full bg-light p-4">
                <div>
                    <div className="text-darkbrown font-bold text-xl">Expenses Allocated Per Category</div>
                    <div className="text-sm text-gray">Expense allocation per category entry (e.g. CFS, ATKINS) for the selected month.</div>
                </div>

                <div className="h-72 w-full">
                    {categoryChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryChartData} margin={{ top: 12, right: 12, left: 8, bottom: 24 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(value: number) => `₱${Number(value).toLocaleString()}`} />
                                <Tooltip formatter={(value: number) => formatToPeso(Number(value))} />
                                <Bar dataKey="total" name="Allocated Expenses" radius={[6, 6, 0, 0]}>
                                    {categoryChartData.map((entry) => (
                                        <Cell key={entry.label} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-gray">There are no allocated category expenses yet.</div>
                    )}
                </div>
            </Card>

            <Card className="mt-4 w-full bg-light p-4">
                <div>
                    <div className="text-darkbrown font-bold text-xl">Expenses Allocated Per Payment Method</div>
                    <div className="text-sm text-gray">Payment mode allocation for the selected month.</div>
                </div>

                <div className="h-72 w-full">
                    {paymentModeChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={paymentModeChartData} margin={{ top: 12, right: 12, left: 8, bottom: 56 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="modeOfPayment" angle={-20} textAnchor="end" interval={0} height={72} tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(value: number) => `₱${Number(value).toLocaleString()}`} />
                                <Tooltip
                                    formatter={(value: number) => formatToPeso(Number(value))}
                                    labelFormatter={(_, payload) => {
                                        const item = payload?.[0]?.payload as { modeOfPayment: string; percentage: number; count: number } | undefined;
                                        if (!item) return "Payment Method";
                                        return `${item.modeOfPayment} (${item.percentage.toFixed(2)}%, ${item.count} entries)`;
                                    }}
                                />
                                <Bar dataKey="total" name="Allocated Expenses" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-gray">There are no payment method expenses yet.</div>
                    )}
                </div>
            </Card>
        </div>
    );
}
