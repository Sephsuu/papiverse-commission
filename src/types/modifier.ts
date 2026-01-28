import { id } from "date-fns/locale";
import { MaterialItem } from "./products";
import { SupplyItem } from "./supplyOrder";
import { Code } from "lucide-react";
import { QuantityBadge } from "@/components/ui/badge";

export interface Modifier {
    id?: number;
    name?: string;
    description?: string;
}

export interface ModifierItem {
    id: number;
    groupId: number;
    name: string;
    quantity: number;
    description: string;
    requiredMaterials: Partial<SupplyItem>[];
    itemsNeeded: MaterialItem[];
    group: {
        groupId: number;
        groupName: string;
    }
}

export const modifierItemInit: Partial<ModifierItem> = {
    groupId: 0,
    name: '',
    description: '',
    requiredMaterials: [],
};

