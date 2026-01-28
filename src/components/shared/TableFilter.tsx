import { BellRing, Download, Funnel, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Dispatch, SetStateAction } from "react";
import { addBusinessDays } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "../ui/badge";
import { NotificationResponse } from "@/types/notification";

const pages = [10, 20, 30, 40, 50, 100]

export function TableFilter({ setSearch, searchPlaceholder, setOpen, buttonLabel, size, setSize, removeAdd, filters, filter,  setFilter, removeFilter, filteredNotifications, setShowNotif, pageKey }: {
    setSearch: (i: string) => void;
    searchPlaceholder: string;
    size: number;
    setSize: Dispatch<SetStateAction<number>>;
    removeAdd?: false | boolean;
    removeFilter?: false | boolean;
    setOpen?: Dispatch<SetStateAction<boolean>>;
    buttonLabel?: string;
    filters?: (string | { label: string; value: string })[];
    filter?: string;
    setFilter?: (value: string) => void;
    filteredNotifications?: NotificationResponse[];
    setShowNotif?: Dispatch<SetStateAction<boolean>>;
    pageKey?: string
}) {
    return (
        <div className={`flex items-center max-md:flex-col max-md:gap-2`}>
            <div className="flex-center-y gap-2 w-full">
                <input
                    className="py-1 pl-3 rounded-md bg-light shadow-xs w-100 max-md:w-full"
                    placeholder={ searchPlaceholder }
                    onChange={ e => setSearch(e.target.value) }
                />
                <Select 
                    value={ String(size) }
                    onValueChange={ (value) => setSize(prev => Number(value)) }
                >
                    <SelectTrigger className="hidden bg-light shadow-xs max-md:flex">
                        <SelectValue placeholder="20" />
                    </SelectTrigger>
                    <SelectContent className="!w-fit">
                        {pages.map((item, i) => (
                            <SelectItem value={ String(item) } key={i}>{ item }</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="ms-auto flex gap-2 max-md:w-full max-md:overflow-x-auto">
                <div className="flex items-center gap-1 max-md:hidden">
                    <div className={`text-sm text-gray`}>Showing</div>
                    <Select 
                        value={ String(size) }
                        onValueChange={ (value) => setSize(prev => Number(value)) }
                    >
                        <SelectTrigger className="bg-light shadow-xs">
                            <SelectValue placeholder="20" />
                        </SelectTrigger>
                        <SelectContent className="!w-fit">
                            {pages.map((item, i) => (
                                <SelectItem value={ String(item) } key={i}>{ item }</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {!removeFilter && (
                    <Select
                        value={filter}
                        onValueChange={(value) => setFilter?.(value)}
                    >
                        <SelectTrigger className="bg-light shadow-xs">
                            <Funnel className="text-dark" />
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>

                        <SelectContent>
                            {filters?.map((item, i) => {
                                const value = typeof item === "string" ? item : item.value;
                                const label = typeof item === "string" ? item : item.label;

                                return (
                                <SelectItem key={i} value={value}>
                                    {label}
                                </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                )}
                {filteredNotifications && (
                    <Button 
                        onClick={ () => setShowNotif?.(true) }
                        className="my-auto bg-light shadow-sm border-1 hover:bg-slate-200"
                        size="sm"
                    >   
                        <BellRing className="text-dark" />
                        {filteredNotifications.length > 0 && (
                            <Badge className="bg-darkred">{ filteredNotifications.length }</Badge>
                        )}
                        
                    </Button>
                )}
                {!removeAdd && (
                    <Button 
                        onClick={ () => setOpen?.(prev => !prev) }
                        className="!bg-darkorange text-light shadow-xs hover:opacity-90"
                    >
                        <Plus /> { buttonLabel }
                    </Button>
                )}
            </div>
        </div>
    )
}