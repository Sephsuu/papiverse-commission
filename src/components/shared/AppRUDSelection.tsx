import { EllipsisVertical, LucideIcon } from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import React from "react";

type AppRUDSelectionProps<T> = {
    item: T;
    setView?: (item: T) => void;
    setUpdate?: (item: T) => void;
    setDelete?: (item: T) => void;
    className?: string,
    icon?: LucideIcon
};

export function AppRUDSelection<T>({
    item,
    setView,
    setUpdate,
    setDelete,
    className,
    icon
}: AppRUDSelectionProps<T>) {
    const Icon = icon ?? EllipsisVertical;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className={ `${className}` }>
                <button>
                    <Icon className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40 border-1 border-darkgreen bg-white">
                {setView && (
                    <DropdownMenuItem onClick={() => setView(item)}>
                        View
                    </DropdownMenuItem>
                )}

                {setUpdate && (
                    <DropdownMenuItem onClick={() => setUpdate(item)}>
                        Update
                    </DropdownMenuItem>
                )}

                {setDelete && (
                    <DropdownMenuItem
                        className="text-darkred focus:text-darkred"
                        onClick={() => setDelete(item)}
                    >
                        Delete
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
