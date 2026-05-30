import { formatToPeso } from "@/lib/formatter";

type BreakdownItem = {
    expenseCategoryName: string;
    expenseCategoryId?: number | null;
    orderCategory: string;
    week1: string | number;
    week2: string | number;
    week3: string | number;
    week4: string | number;
    total: string | number;
};

type WeeklyTotals = {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
    total: number;
};

type Props = {
    weeklyBreakdownColumns: Array<{ title: string; style: string }>;
    meatBreakdown: BreakdownItem[];
    snowfrostBreakdown: BreakdownItem[];
    meatTotals: WeeklyTotals;
    snowTotals: WeeklyTotals;
    combinedWeekTotals: WeeklyTotals;
};

function toAmount(value: string | number) {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") {
        if (value.trim().toUpperCase() === "N/A") return 0;
        const parsed = Number(value.replace(/[^\d.-]/g, ""));
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

export function ExpensesSummary({
    weeklyBreakdownColumns,
    meatBreakdown,
    snowfrostBreakdown,
    meatTotals,
    snowTotals,
    combinedWeekTotals,
}: Props) {
    return (
        <div className="space-y-2 mb-4 animate-fade-in-up">
            <div className="table-wrapper">
                <div className="thead grid grid-cols-6 bg-darkbrown/10!">
                    {weeklyBreakdownColumns.map((item, index) => (
                        <div className="th" key={`meat-${item.title}`}>{index === 0 ? "MEAT Expenses" : item.title}</div>
                    ))}
                </div>

                {meatBreakdown.map((item, idx) => (
                    <div className="tdata grid grid-cols-6" key={idx}>
                        <div className="td font-semibold">{item.expenseCategoryName}</div>
                        {[{ key: "week1", week: 1 }, { key: "week2", week: 2 }, { key: "week3", week: 3 }, { key: "week4", week: 4 }].map((weekItem) => (
                            <div className="td justify-between" key={`${item.expenseCategoryName}-${weekItem.key}`}>
                                <span>₱</span>
                                {item[weekItem.key as keyof BreakdownItem] === "N/A" ? "N/A" : formatToPeso(Number(item[weekItem.key as keyof BreakdownItem])).slice(1,)}
                            </div>
                        ))}
                        <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(toAmount(item.total)).slice(1)}</span></div>
                    </div>
                ))}

                {meatBreakdown.length === 0 && (
                    <div className="tdata grid grid-cols-6">
                        <div className="td font-semibold">No MEAT expenses yet.</div><div className="td">-</div><div className="td">-</div><div className="td">-</div><div className="td">-</div><div className="td">-</div>
                    </div>
                )}

                <div className="tdata grid grid-cols-6 bg-darkbrown/5!">
                    <div className="td font-bold">MEAT Total</div>
                    <div className="td justify-between font-semibold text-darkred text-md">
                        <span>₱</span>
                        <span>{formatToPeso(meatTotals.week1).slice(1)}</span>
                    </div>
                    <div className="td justify-between font-semibold text-darkred text-md">
                        <span>₱</span>
                        <span>{formatToPeso(meatTotals.week2).slice(1)}</span>
                    </div>
                    <div className="td justify-between font-semibold text-darkred text-md">
                        <span>₱</span>
                        <span>{formatToPeso(meatTotals.week3).slice(1)}</span>
                    </div>
                    <div className="td justify-between font-semibold text-darkred text-md">
                        <span>₱</span>
                        <span>{formatToPeso(meatTotals.week4).slice(1)}</span>
                    </div>
                    <div className="td justify-between font-bold text-darkred text-md">
                        <span>₱</span>
                        <span>{formatToPeso(meatTotals.total).slice(1)}</span>
                    </div>
                </div>

                <div className="thead grid grid-cols-6 bg-blue/10!">
                    {weeklyBreakdownColumns.map((item, index) => (
                        <div className="th" key={`snow-${item.title}`}>{index === 0 ? "SNOWFROST Expenses" : item.title}</div>
                    ))}
                </div>

                {snowfrostBreakdown.map((item, idx) => (
                    <div className="tdata grid grid-cols-6" key={`snow-${idx}`}>
                        <div className="td font-semibold">{item.expenseCategoryName}</div>
                        {[{ key: "week1", week: 1 }, { key: "week2", week: 2 }, { key: "week3", week: 3 }, { key: "week4", week: 4 }].map((weekItem) => (
                            <div className="td justify-between" key={`snow-${item.expenseCategoryName}-${weekItem.key}`}>
                                <span>₱</span>
                                {item[weekItem.key as keyof BreakdownItem] === "N/A" ? "N/A" : formatToPeso(Number(item[weekItem.key as keyof BreakdownItem])).slice(1,)}
                            </div>
                        ))}
                        <div className="td justify-between font-semibold"><span>₱</span><span>{formatToPeso(toAmount(item.total)).slice(1)}</span></div>
                    </div>
                ))}

                {snowfrostBreakdown.length === 0 && (
                    <div className="tdata grid grid-cols-6">
                        <div className="td font-semibold">No SNOWFROST expenses yet.</div><div className="td">-</div><div className="td">-</div><div className="td">-</div><div className="td">-</div><div className="td">-</div>
                    </div>
                )}

                <div className="tdata grid grid-cols-6 bg-blue/5!">
                    <div className="td font-bold">SNOWFROST Total</div>
                    <div className="td justify-between font-semibold text-darkred text-md">
                        <span>₱</span>
                        <span>{formatToPeso(snowTotals.week1).slice(1)}</span>
                    </div>
                    <div className="td justify-between font-semibold text-darkred text-md">
                        <span>₱</span>
                        <span>{formatToPeso(snowTotals.week2).slice(1)}</span>
                    </div>
                    <div className="td justify-between font-semibold text-darkred text-md">
                        <span>₱</span>
                        <span>{formatToPeso(snowTotals.week3).slice(1)}</span>
                    </div>
                    <div className="td justify-between font-semibold text-darkred text-md">
                        <span>₱</span>
                        <span>{formatToPeso(snowTotals.week4).slice(1)}</span>
                    </div>
                    <div className="td justify-between font-bold text-darkred text-md">
                        <span>₱</span>
                        <span>{formatToPeso(snowTotals.total).slice(1)}</span>
                    </div>
                </div>

                <div className="tdata grid grid-cols-6 bg-green-50!">
                    <div className="td font-bold">Combined Weekly Total</div>
                    <div className="td justify-between font-bold text-darkred text-lg">
                        <span>₱</span>
                        <span>{formatToPeso(combinedWeekTotals.week1).slice(1)}</span>
                    </div>
                    <div className="td justify-between font-bold text-darkred text-lg">
                        <span>₱</span>
                        <span>{formatToPeso(combinedWeekTotals.week2).slice(1)}</span>
                    </div>
                    <div className="td justify-between font-bold text-darkred text-lg">
                        <span>₱</span>
                        <span>{formatToPeso(combinedWeekTotals.week3).slice(1)}</span>
                    </div>
                    <div className="td justify-between font-bold text-darkred text-lg">
                        <span>₱</span>
                        <span>{formatToPeso(combinedWeekTotals.week4).slice(1)}</span>
                    </div>
                    <div className="td justify-between font-bold text-darkred text-lg">
                        <span>₱</span>
                        <span>{formatToPeso(combinedWeekTotals.total).slice(1)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
