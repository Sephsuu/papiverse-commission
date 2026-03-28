"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { Separator } from "@/components/ui/separator";
import { useMemo, useState } from "react";
import { changes } from "./data";

export function ChangesPage() {
    const tabs = useMemo(
        () => ["All", ...Array.from(new Set(changes.map((change) => change.area)))],
        []
    );
    const [selectedArea, setSelectedArea] = useState(tabs[0]);
    const filteredChanges = selectedArea === "All"
        ? changes
        : changes.filter((change) => change.area === selectedArea);

    return (
        <section className="stack-md animate-fade-in-up overflow-hidden pb-12 max-md:mt-12">
            <AppHeader label="System Changes" />

            <div className="flex mt-2 flex-wrap">
                {tabs.map((item) => {
                    const isActive = selectedArea === item;

                    return (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setSelectedArea(item)}
                            className={`uppercase group relative w-40 pb-4 text-center text-sm font-medium transition-colors
                                ${isActive ? "text-darkbrown font-semibold" : "text-slate-500 hover:text-darkbrown"}
                            `}
                        >
                            <span className="block truncate">{item}</span>
                            <span
                                className={`absolute bottom-0 left-0 h-0.5 bg-darkbrown transition-all duration-300
                                    ${isActive ? "w-full" : "w-0 group-hover:w-full group-hover:bg-orange-100"}
                                `}
                            />
                        </button>
                    );
                })}
            </div>
            <Separator className="bg-slate-400 -mt-2" />

            <div className="space-y-4">
                {filteredChanges.map((change, index) => (
                    <article
                        key={change.id}
                        className="rounded-md border border-slate-300 bg-white p-5 shadow-sm"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-1">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Change {index + 1}
                                </div>
                                <h2 className="mt-1 text-lg font-semibold text-darkbrown">
                                    {change.title}
                                </h2>
                            </div>

                            <div className="text-right">
                                <div className="inline-flex rounded-full bg-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-darkbrown">
                                    {change.area}
                                </div>
                            </div>
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                            {change.summary}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}
