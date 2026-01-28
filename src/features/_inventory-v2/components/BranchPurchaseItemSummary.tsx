"use client"

import { AppHeader } from "@/components/shared/AppHeader"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation";
import { useToday } from "@/hooks/use-today";
import { formatDate } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Repeat } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFetchData } from "@/hooks/use-fetch-data";
import { BranchService } from "@/services/branch.service";
import { Skeleton } from "@/components/ui/skeleton";
import { SupplyService } from "@/services/supply.service";
import { Supply } from "@/types/supply";
import { Branch } from "@/types/branch";
import { SectionLoading } from "@/components/ui/loader";

export function BranchPurchaseItemSummary({ date, className }: {
    date: string
    className?: string
}) {
    const { dateObj } = useToday();
    const searchParams = useSearchParams();

    const [reload, setReload] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState("all");
    const [selectedSupplies, setSelectedSupplies] = useState("all")

    const selectedDate = searchParams.get("date");

    const { data: branches, loading: loadingBranches } = useFetchData<Branch>(
        BranchService.getAllBranches
    )

    const { data: supplies, loading: loadingSupplies } = useFetchData<Supply>(
        SupplyService.getAllSupplies
    )
    
    return (
        <section className={`stack-md ${className}`}>
            <div className="text-xl font-bold">
                Inventory Summary for {formatDate(new Date(date), 'MMMM dd, yyyy')}
            </div>

            <Separator className="bg-gray-300 my-2" />

            <div className="row-md items-center">
                {loadingBranches ? (
                    <Skeleton className="h-12 w-full bg-slate-300" />
                ) : (
                    <div className="w-full">
                        <div className="text-sm">Column</div>
                        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                            <SelectTrigger className="w-full bg-white shadow-sm shadow-lightbrown">
                                <SelectValue placeholder="Filter by branch" />
                            </SelectTrigger>
                            <SelectContent className="min-w-80 max-w-100">
                                <SelectGroup>
                                    <SelectLabel>Branches</SelectLabel>
                                    <SelectItem value="all">All branches</SelectItem>
                                    <Separator className="bg-gray-300" />
                                    {branches.map((item) => (
                                        <SelectItem key={item.branchId} value={String(item.branchId)}>
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                    </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <Tooltip>
                    <TooltipTrigger>
                        <Repeat 
                            className="cursor-pointer w-6 h-6 mx-2 my-auto"
                        />
                    </TooltipTrigger>
                    <TooltipContent className="bg-lightbrown font-bold mb-2" showArrow={false}>SWAP</TooltipContent>
                </Tooltip>

                {loadingSupplies ? (
                    <Skeleton className="h-12 w-full bg-slate-300" />
                ) : (
                    <div className="w-full">
                        <div className="text-sm">Row</div>
                        <Select value={selectedSupplies} onValueChange={setSelectedSupplies}>
                            <SelectTrigger className="w-full bg-white shadow-sm shadow-lightbrown">
                                <SelectValue placeholder="Filter by branch" />
                            </SelectTrigger>
                            <SelectContent className="min-w-80 max-w-100">
                                <SelectGroup>
                                    <SelectLabel>Branches</SelectLabel>
                                    <SelectItem value="all">All supplies</SelectItem>
                                    <Separator className="bg-gray-300" />
                                    {supplies.map((item) => (
                                        <SelectItem key={item.id} value={item.code!}>
                                            {item.id} - {item.name}
                                        </SelectItem>
                                    ))}
                                    </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <Button
                    className="bg-darkgreen! mt-auto shadow-sm hover:opacity-90"
                    onClick={() => setReload(prev => !prev)}
                >
                    <RefreshCcw />
                    Refresh
                </Button>

            </div>

            {loadingBranches || loadingSupplies ? (
                <SectionLoading />
            ) : (
                <div className="table-wrapper mt-2">
                    <div className={`thead grid grid-cols-${supplies.length + 1}`}>
                        <div className="th"></div>
                        {supplies.map((item) => (
                            <div className="th">{item.name}</div>
                        ))}
                    </div>
                    {branches.map((item) => (
                        <div className={`tdata grid grid-cols-${supplies.length + 1}`}>
                            <div className="td">{item.name}</div>
                            
                        </div>
                    ))}
                    
                </div>
            )}

        </section>
    )
}