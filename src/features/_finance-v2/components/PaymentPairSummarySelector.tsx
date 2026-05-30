import { Badge } from "@/components/ui/badge";
import { CalendarDays, Store } from "lucide-react";

interface Props {
    selectedGroupName: string;
    displayDate: string;
    onClick: () => void;
}

export function PaymentPairSummarySelector({
    selectedGroupName,
    displayDate,
    onClick,
}: Props) {
    return (
        <div
            onClick={onClick}
            className="flex-center-y w-fit max-w-full cursor-pointer gap-3 rounded-md border border-slate-300 bg-light px-4 py-2 text-base font-bold shadow-sm max-md:w-full"
        >
            <Store />
            <div className="truncate">{selectedGroupName || "Select Group"}</div>
            <span className="text-slate-400">|</span>
            <CalendarDays />
            <div className="truncate scale-x-110 origin-left">{displayDate || "Select Month & Year"}</div>
            <Badge className="bg-darkbrown font-bold ml-2">MONTHLY</Badge>
        </div>
    );
}
