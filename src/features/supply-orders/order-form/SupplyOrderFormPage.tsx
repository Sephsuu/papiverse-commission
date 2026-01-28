"use client"

import { useState } from "react"
import { MeatOrder } from "./MeatOrder";
import { useAuth } from "@/hooks/use-auth";
import { useFetchData } from "@/hooks/use-fetch-data";
import { Supply } from "@/types/supply";
import { SupplyService } from "@/services/supply.service";
import { PapiverseLoading } from "@/components/ui/loader";
import { SupplyItem } from "@/types/supplyOrder";
import { useSupplySelection } from "@/hooks/use-supply-selection";
import { SnowOrder } from "./SnowOrder";
import { OrderReceipt } from "./OrderReceipt";

export function SupplyOrderFormPage() {
    const { claims, loading: authLoading } = useAuth();
    const { data, loading, error } = useFetchData<Supply>(SupplyService.getDeliverableSupplies);
    
    const { supplies, selectedItems, handleSelect, handleQuantityChange, handleRemove } = useSupplySelection(claims, data);
    
    const [tab, setTab] = useState('meat');
    
    if (loading || authLoading) return <PapiverseLoading />
    if (tab === 'meat') return <MeatOrder
        supplies={ supplies.filter(i => i.category === 'MEAT') }
        selectedItems={ selectedItems }
        setActiveForm={ setTab }
        onSelect={ handleSelect }
        onQuantityChange={ handleQuantityChange }
        onRemove={ handleRemove }
    />

    if (tab === 'snow') return <SnowOrder
        supplies={ supplies.filter(i => i.category === 'SNOWFROST') }
        selectedItems={ selectedItems }
        setActiveForm={ setTab }
        onSelect={ handleSelect }
        onQuantityChange={ handleQuantityChange }
        onRemove={ handleRemove }
    />

    if (tab === 'receipt') return <OrderReceipt
        claims={ claims }
        setActiveForm={ setTab }
        selectedItems={ selectedItems }
    />
}