"use client";

import { Download, FileSpreadsheet, SquareMinus } from "lucide-react";
import { SetStateAction } from "react";
import { OrderStatusBadge } from "@/components/ui/badge";
import { SupplyOrder } from "@/types/supplyOrder";
import { formatDateToWords, formatToPeso } from "@/lib/formatter";

interface Props {
    filteredOrders: SupplyOrder[];
    setReload: React.Dispatch<SetStateAction<boolean>>;
    toView: SupplyOrder | undefined;
    setToView: (i: SupplyOrder | undefined) => void;
    selectedOrder: SupplyOrder | undefined;
    setSelectedOrder: (i: SupplyOrder | undefined) => void;
}

export function OrderHistory({ filteredOrders, setReload, toView, setToView, selectedOrder, setSelectedOrder }: Props) {
    return(
        <section>
            <div className="flex items-center bg-slate-200 font-semibold rounded-sm mt-2">
                <div className="w-[5%] py-1 border-r-1 border-amber-50"><SquareMinus className="w-4 h-4 mx-auto" strokeWidth={ 3 }/></div>
                <div className="w-[5%] py-1 border-r-1 border-amber-50"><FileSpreadsheet className="w-4 h-4 mx-auto" strokeWidth={ 3 }/></div>
                <div className="grid grid-cols-5 w-full">
                    <div className="text-sm my-auto pl-2 py-1 border-r-1 border-amber-50">Branch Name</div>
                    <div className="text-sm my-auto pl-2 py-1 border-r-1 border-amber-50">Date Requested</div>
                    <div className="text-sm my-auto pl-2 py-1 border-r-1 border-amber-50">Status</div>
                    <div className="text-sm my-auto pl-2 py-1 border-r-1 border-amber-50">Order ID</div>
                    <div className="text-sm my-auto pl-2 py-1 border-r-1 border-amber-50">Total Amount</div>
                </div>
            </div>

            {filteredOrders.length > 0 ?
                filteredOrders.map((item, index) => (
                    <div className="flex items-center bg-light rounded-b-sm shadow-xs" key={ index }>
                        <button 
                            onClick={ () => setSelectedOrder(item) }
                            className="w-[5%] text-xs text-center text-gray hover:text-dark"
                        >
                            View Full
                        </button>
                        <div className="w-[5%] flex justify-center"><button><Download className="w-4 h-4 text-gray" strokeWidth={ 2 }/></button></div>
                        <div className="grid grid-cols-5 w-full">
                                <div className="flex text-sm pl-2 py-1.5 border-b-1">
                                    <button className="my-auto"
                                        onClick={ () => setToView(item) }
                                    >{ item.branchName }</button></div>
                                <div className="flex text-sm pl-2 py-1.5 border-b-1 truncate"><div className="my-auto">{ formatDateToWords(item.orderDate) }</div></div>
                                <div className="flex text-sm pl-2 py-1.5 border-b-1"><div className="my-auto"><OrderStatusBadge status={item.status} /></div></div>
                                <div className="text-sm pl-2 py-1.5 border-b-1 truncate">
                                    <div>{ item.meatCategory?.meatOrderId }</div>
                                    <div>{ item.snowfrostCategory?.snowFrostOrderId }</div>
                                </div>
                                <div className="flex text-sm pl-2 py-1.5 border-b-1"><div className="my-auto">{ formatToPeso(item.completeOrderTotalAmount) }</div></div>
                        </div>
                    </div>
                )) : (<div className="my-2 text-sm text-center col-span-6">There are no previous orders yet.</div>)
            }
            <div className="text-gray text-sm ms-2">Showing { filteredOrders.length.toString() } of { filteredOrders.length.toString() } results.</div>

        </section>
    );
}

