import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import { SectionLoading } from "@/components/ui/loader";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { formatDateTime, formatToPeso } from "@/lib/formatter";
import { SupplyOrderPaymentService } from "@/services/supplyOrderPayment.service";
import { SupplyOrder } from "@/types/supplyOrder";
import { Dispatch, SetStateAction, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import { CreateSupplyOrderPayment } from "./CreateSupplyOrderPayment";
import { UpdateSupplyOrderPayment } from "./UpdateSupplyOrderPayment";
import { DeleteSupplyOrderPayment } from "./DeleteSupplyOrderPayment";

type SupplyOrderSnapshot = {
    orderId: number;
    orderGrandTotal: number;
    totalPaid: number;
    remainingBalance: number;
    paymentStatus: string;
    isPaid: boolean;
};

type SupplyOrderPaymentItem = {
    paymentId: number;
    supplyOrderId: number;
    branchId: number;
    branchName: string;
    paymentDate: string;
    paymentMode: string;
    amount: number;
    remarks?: string;
    createdAt: string;
    supplyOrderSnapshot: SupplyOrderSnapshot;
};

const columns = [
    { title: "Payment Date", style: "" },
    { title: "Payment Mode", style: "" },
    { title: "Amount", style: "" },
    { title: "Remarks", style: "" },
    { title: "Status", style: "text-center" },
];

export function SupplyOrderPayment({ toView, setView }: {
    toView: SupplyOrder;
    setView: Dispatch<SetStateAction<SupplyOrder | undefined>>;
}) {
    const [reload, setReload] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [toUpdate, setUpdate] = useState<SupplyOrderPaymentItem>();
    const [toDelete, setDelete] = useState<SupplyOrderPaymentItem>();

    const { data: paymentInfo, loading: loadingPaymentInfo } = useFetchOne<SupplyOrderPaymentItem[]>(
        SupplyOrderPaymentService.getPaymentByOrder,
        [toView.orderId, reload],
        [toView.orderId]
    )

    const payments = Array.isArray(paymentInfo) ? paymentInfo : [];
    const latestSnapshot = payments[0]?.supplyOrderSnapshot;

    return (
        <Drawer open onOpenChange={(open) => { if (!open) setView(undefined); }}>
            <DrawerContent className="max-h-[88vh] pb-24">
                <section className="stack-md p-4 md:p-6 overflow-y-auto">
                    <div className="flex-center-y justify-between">
                        <AppHeader 
                            label="Supply Order Payment Details" 
                            hidePapiverseLogo
                        />
                        <Button
                            onClick={() => setOpenCreate(true)}
                            className="bg-darkgreen! hover:opacity-90"
                        >
                            <Plus className="w-4 h-4" /> Add Payment
                        </Button>
                    </div>

                    {loadingPaymentInfo && <SectionLoading />}

                    {!loadingPaymentInfo && (
                        <>
                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Order Grand Total</p>
                                    <p className="mt-2 text-2xl font-semibold text-slate-900">{formatToPeso(latestSnapshot?.orderGrandTotal ?? toView.completeOrderTotalAmount ?? 0)}</p>
                                </div>
                                <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Total Paid</p>
                                    <p className="mt-2 text-2xl font-semibold text-slate-900">{formatToPeso(latestSnapshot?.totalPaid ?? 0)}</p>
                                </div>
                                <div className="gap-3 p-5 bg-white shadow-sm rounded-md border border-slate-300">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-darkbrown">Remaining Balance</p>
                                    <p className="mt-2 text-2xl font-semibold text-slate-900">{formatToPeso(latestSnapshot?.remainingBalance ?? toView.remainingBalance ?? 0)}</p>
                                </div>
                            </div>

                            <div className="table-wrapper">
                                <div className="flex thead">
                                    <div className="w-full grid grid-cols-5">
                                        {columns.map((item, index) => (
                                            <div key={index} className={`th ${item.style}`}>{item.title}</div>
                                        ))}
                                    </div>
                                    <div className="th w-25"></div>
                                </div>
                                <div className="divide-y divide-slate-200 bg-white">
                                    {payments.length === 0 && (
                                        <div className="tdata grid grid-cols-1">
                                            <div className="flex-center td text-slate-500 p-4 text-center">No payment records found for this supply order.</div>
                                        </div>
                                    )}

                                    {payments.map((item) => (
                                        <div className="flex tdata" key={item.paymentId}>
                                            <div className={`w-full grid grid-cols-5 ${item.supplyOrderSnapshot?.isPaid === false ? "bg-red-50" : ""}`}>
                                                <div className="td">{formatDateTime(item.createdAt || item.paymentDate)}</div>
                                                <div className="td">{item.paymentMode}</div>
                                                <div className="td justify-between">
                                                    <span>₱</span>
                                                    <span>{formatToPeso(item.amount).slice(1)}</span>
                                                </div>
                                                <div className="td">{item.remarks || "No remarks"}</div>
                                                <div className="td">
                                                    <Badge className={item.supplyOrderSnapshot?.isPaid ? "bg-darkgreen" : "bg-darkred"}>
                                                        {item.supplyOrderSnapshot?.paymentStatus || "UNPAID"}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex-center td w-25 gap-2">
                                                <SquarePen
                                                    className="w-4 h-4 text-darkgreen"
                                                    onClick={() => setUpdate(item)}
                                                />
                                                <Trash2
                                                    className="w-4 h-4 text-darkred"
                                                    onClick={() => setDelete(item)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </section>

                {openCreate && (
                    <CreateSupplyOrderPayment
                        supplyOrderId={toView.orderId!}
                        setOpen={setOpenCreate}
                        setReload={setReload}
                    />
                )}
                {toUpdate && (
                    <UpdateSupplyOrderPayment
                        toUpdate={toUpdate}
                        setUpdate={setUpdate}
                        setReload={setReload}
                    />
                )}
                {toDelete && (
                    <DeleteSupplyOrderPayment
                        toDelete={toDelete}
                        setDelete={setDelete}
                        setReload={setReload}
                    />
                )}
            </DrawerContent>
        </Drawer>
    )
}
