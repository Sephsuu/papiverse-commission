"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { PapiverseLoading } from "@/components/ui/loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useFetchData } from "@/hooks/use-fetch-data";
import { BranchService } from "@/services/branch.service";
import { Branch } from "@/types/branch";
import { useEffect, useState } from "react";
import { SalesPage } from "./SalesPage";

export function BranchSalesPage() {
    const { data: branches, loading: branchesLoading } = useFetchData<Branch>(
        BranchService.getAllBranches,
    );

    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

    useEffect(() => {
        if (branches?.length) {
            setSelectedBranch(branches[0].id!);
        }
    }, [branches]);


    if (branchesLoading) return <PapiverseLoading />;

    return (
        <div className="flex gap-2">

            {/* -------------------- */}
            {/* SIDEBAR */}
            {/* -------------------- */}
            <ScrollArea className="w-64 h-[95vh] bg-white shadow-md border-r p-4 flex flex-col rounded-md">
                <h2 className="sticky top-0 text-lg font-semibold text-darkbrown mb-4 bg-white pb-2">
                    Branches
                </h2>

                <div className="flex flex-col overflow-y-auto">
                    {branches.map((item) => (
                        <div key={item.id}>
                            <button
                                onClick={() => setSelectedBranch(item.id!)}
                                className={`
                                    w-full text-left px-3 py-2 rounded-md transition text-sm font-medium
                                    ${selectedBranch === item.id 
                                        ? "rounded-none border-x-5 border-darkorange font-semibold" 
                                        : "hover:bg-gray-100"
                                    }
                                `}
                            >
                                {item.name}
                            </button>
                            <Separator className="my-1" />
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* -------------------- */}
            {/* MAIN CONTENT AREA */}
            {/* -------------------- */}
            <ScrollArea className="flex-1 h-[95vh]">
                {selectedBranch ? (
                    <div className="pr-2.5">
                        <AppHeader label={`${branches.find((b) => b.id === selectedBranch)?.name} Sales`} />
                        <SalesPage branchId={ selectedBranch } />
                        
                    </div>
                ) : (
                    <div className="text-gray-500">Select a branch to view sales.</div>
                )}
            </ScrollArea>
        </div>
    );
}
