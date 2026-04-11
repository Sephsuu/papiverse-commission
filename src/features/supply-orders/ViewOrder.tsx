import { AppHeader } from "@/components/shared/AppHeader";
import { ModalTitle } from "@/components/shared/ModalTitle";
import { AlertDialog, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Badge, OrderStatusBadge } from "@/components/ui/badge";
import { Button, DeleteButton, UpdateButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FormLoader, PapiverseLoading, SectionLoading } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useFetchData } from "@/hooks/use-fetch-data";
import { useFetchOne } from "@/hooks/use-fetch-one";
import { useSupplyOrderApproval } from "@/hooks/use-supply-order-approval";
import { formatCompactNumber, formatDateToWords, formatToPeso } from "@/lib/formatter";
import { InventoryService } from "@/services/inventory.service";
import { SupplyOrderService } from "@/services/supplyOrder.service"
import { Inventory } from "@/types/inventory";
import { CustomItemType, OTHER_ITEM_CATEGORY, OTHER_ITEM_KEY, SupplyOrder } from "@/types/supplyOrder"
import { ArrowLeft, CalendarSync, Ham, MoveRight, ShoppingCart, Snowflake, SquarePen, Truck } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { EditOrderForm } from "./order-form/EditOrderForm";
import { EmptyState } from "@/components/ui/fallback";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExpectedDeliveryDatePicker } from "./components/ExpectedDeliveryDatePicker";
import { useRouter } from "next/navigation";
import { OrdersCard } from "./components/OrdersCard";
import { ConfirmReject } from "./components/ConfirmReject";
import { ConfirmSave } from "./components/ConfirmSave";
import { UpdateShipment } from "./components/UpdateShipment";

const tabs = ['Meat Commissary', 'Snowfrost Commissary']

const columns = [
    { title: 'No.', style: 'text-center' },
    { title: 'SKU ID', style: '' },
    { title: 'Supply Description', style: '' },
    { title: 'Qty', style: 'text-center' },
    { title: 'Unit Price', style: '' },
    { title: 'Total Amount', style: '' },
]

const mapOtherCategory = (sourceCategory: string) =>
    sourceCategory === "MEAT" ? "MEAT" : "SNOWFROST";

const getCustomItemType = (name?: string, hasParentSku?: boolean): CustomItemType => {
    if (!hasParentSku) return "OTHER";
    if (name?.toUpperCase().startsWith("LACKING")) return "LACKING";
    return "REPLACEMENT";
};

const mapEditableCategoryItem = (
    item: {
        rawMaterialCode?: string;
        rawMaterialName?: string;
        unitMeasurement?: string;
        quantity: number;
        price: number;
        isOther?: boolean;
    },
    category: "MEAT" | "SNOWFROST",
    key: string,
) => {
    const isCustomItem = item.isOther || !item.rawMaterialCode;
    const customItemType = isCustomItem
        ? getCustomItemType(item.rawMaterialName, Boolean(item.rawMaterialCode))
        : undefined;

    return {
        sku: item.rawMaterialCode,
        quantity: item.quantity,
        name: item.rawMaterialName,
        unitMeasurement: item.unitMeasurement,
        unitPrice: item.price,
        category,
        isOther: isCustomItem,
        customItemType,
        [OTHER_ITEM_KEY]: isCustomItem ? key : undefined,
        [OTHER_ITEM_CATEGORY]: isCustomItem ? category : undefined,
    };
};

export function ViewOrderPage({ id }: { id: number }) {
    const [reload, setReload] = useState(false);
    const { claims, loading: authLoading, isFranchisor } = useAuth();

    const { data, loading } = useFetchOne<SupplyOrder>(
        SupplyOrderService.getSupplyOrderById, 
        [id, reload], 
        [id]
    );
    const { data: inventories, loading: inventoryLoading } = useFetchOne<{
        total: {
            inventoryCost: number;
            inventoryValue: number;
            netProfit: number;
        },
        inventories: Inventory[];
    }>(
        InventoryService.getInventoryByBranch, 
        [claims.branch.branchId, reload], 
        [claims.branch.branchId, 0, 1000]
    )
    const { onProcess, enableSave, handleSubmit } = useSupplyOrderApproval(
        data!, 
        claims, 
        setReload
    );    
    
    const [tab, setTab] = useState(tabs[1]);
    const [open, setOpen] = useState(false);
    const [toEdit, setEdit] = useState(false);
    const [toUpdateShip, setUpdateShip] = useState(false);
    const [toReject, setReject] = useState(false);
    const [meatApproved, setMeatApproved] = useState<boolean | undefined>(undefined);
    const [snowApproved, setSnowApproved] = useState<boolean | undefined>(undefined);

    const [processExpDel, setProcessExpDel] = useState(false);
    const [openExpDel, setOpenExpDel] = useState(false);
    const [expDel, setExpDel] = useState<string | null>(null);


    useEffect(() => {
        if (data?.meatCategory?.meatOrderId) setTab(tabs[0]);
        else setTab(tabs[1]);
    }, [data?.meatCategory?.meatOrderId]);

    useEffect(() => {
        if (!data) return;

        setMeatApproved(
            data.meatCategory === null
            ? true
            : data.meatCategory
                ? data.meatCategory.isApproved
                : undefined
        );

        setSnowApproved(
            data.snowfrostCategory === null
            ? true
            : data.snowfrostCategory
                ? data.snowfrostCategory.isApproved
                : undefined
        );
    }, [data]);

    const hasSnowfrost = Boolean(data?.snowfrostCategory);
    const hasMeat = Boolean(data?.meatCategory);
    const meatOtherItems = (data?.othersCategory?.othersItems ?? []).filter(
        (item) => mapOtherCategory(item.sourceCategory) === "MEAT"
    );
    const snowOtherItems = (data?.othersCategory?.othersItems ?? []).filter(
        (item) => mapOtherCategory(item.sourceCategory) === "SNOWFROST"
    );
    const meatOrderRows = [
        ...(data?.meatCategory?.meatItems ?? []),
        ...meatOtherItems.map((item) => ({
            rawMaterialCode: "OTHER",
            rawMaterialName: item.itemName,
            unitMeasurement: "",
            quantity: item.quantity,
            price: item.unitPrice,
            isOther: true,
        })),
    ];
    const snowOrderRows = [
        ...(data?.snowfrostCategory?.snowFrostItems ?? []),
        ...snowOtherItems.map((item) => ({
            rawMaterialCode: "OTHER",
            rawMaterialName: item.itemName,
            unitMeasurement: "",
            quantity: item.quantity,
            price: item.unitPrice,
            isOther: true,
        })),
    ];

    const hasMissingCategory = !hasSnowfrost || !hasMeat;

    async function exportForm(type: string, category: string) {
        try {
            const res = await SupplyOrderService.exportForm(data!.orderId!, type, category);

            if (res) {
                toast.success('Form export success.')
            }

        } catch (error) {
            toast.error(String(error))
        }
    }

    async function handleUpdateExpDel() {
        if (!data?.orderId) return
        if (!expDel) return toast.warning('select an expected delivery date.');
        try {
            setProcessExpDel(true);
            const res = await SupplyOrderService.updateExpectedDeliveryDate(expDel, data?.orderId)

            if (res) {
                toast.success('expected delivery updated successfully.')
                setReload(prev => !prev)
                setOpenExpDel(false)
            }
        } catch (error) {
            toast.error(String(error))
        } finally { setProcessExpDel(false) }
    }

    if (loading || authLoading || inventoryLoading) return <PapiverseLoading /> 
    if (toEdit) return <EditOrderForm   
        setEdit={setEdit}
        orderId={ data!.orderId! }
        meatId={data?.meatCategory?.meatOrderId ?? "No meat order"}
        snowId={data?.snowfrostCategory?.snowFrostOrderId ?? "No snowfrost order"}
        internalShipment={data?.internalShipment ?? false}
        deliveryType={data?.deliveryType ?? ""}
        expectedDelivery={data?.expectedDelivery ?? ""}
        toEditItems={[
            ...(data?.meatCategory?.meatItems ?? []).map((item, index) =>
                mapEditableCategoryItem(item, "MEAT", `edit-meat-${index}`)
            ),
            ...(data?.othersCategory?.othersItems ?? [])
                .filter((item) => mapOtherCategory(item.sourceCategory) === "MEAT")
                .map((item, index) => ({
                    sku: item.rawMaterialCode,
                    name: item.itemName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    category: "MEAT" as const,
                    isOther: true,
                    customItemType: getCustomItemType(item.itemName, Boolean(item.rawMaterialCode)),
                    [OTHER_ITEM_KEY]: `edit-other-meat-${index}`,
                    [OTHER_ITEM_CATEGORY]: "MEAT",
                })),
            ...(data?.snowfrostCategory?.snowFrostItems ?? []).map((item, index) =>
                mapEditableCategoryItem(item, "SNOWFROST", `edit-snow-${index}`)
            ),
            ...(data?.othersCategory?.othersItems ?? [])
                .filter((item) => mapOtherCategory(item.sourceCategory) === "SNOWFROST")
                .map((item, index) => ({
                    sku: item.rawMaterialCode,
                    name: item.itemName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    category: "SNOWFROST" as const,
                    isOther: true,
                    customItemType: getCustomItemType(item.itemName, Boolean(item.rawMaterialCode)),
                    [OTHER_ITEM_KEY]: `edit-other-snow-${index}`,
                    [OTHER_ITEM_CATEGORY]: "SNOWFROST",
                })),
        ]}
        setReload={setReload}
    />
    return (
        <section className="stack-md animate-fade-in-up overflow-hidden pb-12 max-md:mt-12">
            <div className="flex-center-y gap-4">
                <ArrowLeft 
                    className="cursor-pointer"
                    onClick={() => {history.back()}}
                />
                <AppHeader 
                    label={ `${data!.meatCategory?.meatOrderId ?? "No Meat Order"} | ${data!.snowfrostCategory?.snowFrostOrderId ?? "No Snowfrost Order"}`  } 
                    hidePapiverseLogo={true}
                />
            </div>

            <div className="flex justify-between items-center max-sm:grid! max-sm:gap-2!">
                <div className="flex-center bg-slate-50 shadow-sm rounded-full max-sm:w-fit max-sm:mx-auto">
                    {tabs.map((item, i) => {
                        const isMeatTab = i === 0;
                        const isSnowTab = i === 1;

                        const disabled =
                            (isMeatTab && !data?.meatCategory?.meatOrderId) ||
                            (isSnowTab && !data?.snowfrostCategory?.snowFrostOrderId);
                            
                        return (
                            <Button
                                key={i}
                                onClick={ () => setTab(item) }
                                disabled={disabled}
                                className={[
                                    "w-42 rounded-full bg-slate-50! text-dark hover:opacity-50",
                                    tab === item ? "bg-darkbrown! text-light hover:opacity-100" : "",
                                    disabled ? "opacity-40 cursor-not-allowed hover:opacity-40" : "",
                                ].join(" ")}
                            >
                                { item }
                            </Button>   
                        )
                     })}
                </div>

                <div className="flex gap-2 my-2">
                    {isFranchisor && (
                        <>
                            <Button 
                                className="bg-darkred! hover:opacity-90" 
                                onClick={ () => setReject(true) }
                                disabled={ ["APPROVED", "DELIVERED", "REJECTED"].includes(data!.status!) || onProcess }
                            >
                                <FormLoader onProcess={ onProcess } label="Reject Order" loadingLabel="Rejecting Order" />
                            </Button>
                            {hasMissingCategory && (
                                <Button
                                    className="bg-darkorange! hover:opacity-90"
                                    disabled={ ["APPROVED", "TO_FOLLOW", "TO FOLLOW"].includes(data!.status!) || enableSave(hasMeat!, hasSnowfrost!) || onProcess}
                                    onClick={() => {
                                        setMeatApproved(hasMeat)
                                        setSnowApproved(hasSnowfrost)
                                        setOpen(true)
                                    }}
                                >
                                    <FormLoader
                                        onProcess={onProcess}
                                        label="To Follow Order"
                                        loadingLabel="Marking as to follow"
                                    />
                                </Button>
                            )}
                            <Button className="bg-darkgreen! hover:opacity-90" 
                                disabled={ ["APPROVED"].includes(data!.status!) || enableSave(meatApproved!, snowApproved!) || onProcess }
                                onClick={ () => setOpen(true) }
                            >
                                <FormLoader onProcess={ onProcess } label="Save Order" loadingLabel="Saving Order" />
                            </Button>
                        </>
                    )}

                </div>
            </div>

            <div className="relative p-4 bg-white rounded-md shadow-sm animate-fade-in-up" key={tab}>
                <div className="top-2 left-2 flex-center-y gap-2">
                    <Checkbox 
                        id="meat" 
                        className="border border-gray shadow-sm w-5 h-5 data-[state=checked]:bg-darkgreen" 
                        checked={ tab === tabs[1] ? snowApproved : meatApproved }
                        onCheckedChange={(checked: boolean) => { 
                            tab === tabs[1] ? setSnowApproved(checked) 
                            : setMeatApproved(checked)
                        }}
                        disabled={ 
                            ["APPROVED", "DELIVERED", "REJECTED"].includes(data!.status!) || !isFranchisor || (tab === tabs[0] && data?.meatCategory === null) || (tab === tabs[1] && data?.snowfrostCategory === null) 
                        }
                    />
                    <label 
                        htmlFor="meat" 
                        className={
                            `text-[16px] font-semibold ${["APPROVED", "DELIVERED", "REJECTED"].includes(data!.status!) && "text-gray"}
                        `}
                    >
                        {tab === tabs[1] ? 
                            snowApproved ? 'Approved' : 'Not Approved'
                            : meatApproved ? 'Approved' : 'Not Approved'
                        }
                    </label>
                </div>

                <Image 
                    src="/images/kp_logo.png" 
                    alt="KP Logo" 
                    width={60} 
                    height={60} 
                    className="top-2 right-2 absolute" 
                />

                <div className="max-md:mt-8 max-md:mb-6">
                    <div className="flex justify-center items-center gap-2">
                        { tab === tabs[1] ? 
                            <Snowflake /> 
                            : <Ham /> 
                        }
                        <div className="font-semibold">{ tab } Receipt</div>
                    </div>

                    {isFranchisor ? (
                        <div className="text-center text-sm text-gray">
                            Showing only the order form receipt for this { tab.toLowerCase() }.
                        </div> 
                    ) : (
                        <div className="text-center text-sm text-gray">
                            Please review carefully your order form.
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 max-sm:grid-cols-1 max-sm:gap-1.5">
                    <div className="text-sm"><span className="font-bold">Order ID: </span>
                        { tab === tabs[1] ? 
                            data!.snowfrostCategory?.snowFrostOrderId 
                            : data!.meatCategory?.meatOrderId
                        }
                    </div>
                    <div className="ms-auto font-bold max-sm:ms-0">PURCHASE ORDER</div>
                    <div className="text-sm flex-center-y gap-2">
                        <span className="font-bold">Status: </span>
                        <OrderStatusBadge 
                            className="scale-110" 
                            status={data!.status} 
                        />
                    </div>
                    <div className="text-sm ms-auto inline-block max-sm:ms-0">
                        <span className="font-bold">Date:</span> { formatDateToWords(data!.orderDate) }
                    </div>
                    <div className="text-sm">
                        <span className="font-bold">Tel No: </span>{ "+63 945 501 8376" }
                    </div>
                    <div className="text-sm ms-auto max-sm:ms-0">
                        <span className="font-bold">Delivery to: </span>{ data!.branchName }
                    </div>
                    <div className="flex-center-y gap-2 text-sm">
                        <span className="font-bold">Expected Delivery: </span>{ data?.expectedDelivery ? formatDateToWords(data.expectedDelivery) : "Delivery date not set" } 
                        {data?.status === "PENDING" && (
                            <SquarePen 
                                className="w-4 h-4 text-gray" 
                                onClick={() => setOpenExpDel(true)}
                            />
                        )}
                    </div>
                </div>

                <div className="mt-4 table-wrapper">
                    <div className="thead grid grid-cols-[60px_1fr_1fr_100px_1fr_1fr]">
                        {columns.map((item, _) => (
                            <div key={_} className={`th ${item.style}`}>{ item.title }</div>
                        ))}
                    </div>
                    {tab === tabs[0] ? (
                        meatOrderRows.length > 0 ? (
                            <OrdersCard
                                orders={meatOrderRows}
                                inventories={inventories?.inventories ?? []}
                                isFranchisor={isFranchisor}
                            />
                        ) : (
                            <EmptyState message="No meat items in this order" />
                        )
                        ) : (
                        snowOrderRows.length > 0 ? (
                            <OrdersCard
                            orders={snowOrderRows}
                            inventories={inventories?.inventories ?? []}
                            isFranchisor={isFranchisor}
                            />
                        ) : (
                            <EmptyState message="No snowfrost items in this order" />
                        )
                    )}
                </div>
                <div className="text-gray text-sm text-end mx-4 mt-2">
                    Meat Order <span className="font-semibold text-dark">+ { data?.meatCategory ?  formatToPeso(data!.meatCategory!.categoryTotal) : formatToPeso(0) }</span>
                </div>
                <div className="text-gray text-sm text-end mx-4 mt-2">
                    Snowfrost Order <span className="font-semibold text-dark">+ { data?.snowfrostCategory ?formatToPeso(data!.snowfrostCategory!.categoryTotal) : formatToPeso(0) }</span>
                </div>
                <div className="text-gray text-sm text-end mx-4 mt-2">
                    Other Items <span className="font-semibold text-dark">+ { data?.othersCategory ? formatToPeso(data.othersCategory.othersTotal) : formatToPeso(0) }</span>
                </div>
                <div className="text-gray text-sm text-end mx-4 mt-2">
                    Delivery Fee 
                    {!data?.internalShipment ? (
                        <Badge className="ml-2 bg-darkbrown">{data?.deliveryType}</Badge>
                    ) : (
                        <span className="ml-1 font-semibold text-dark"> 
                            + { formatToPeso(data!.deliveryFee) }
                        </span>
                    )}
                </div>
                <Separator className="my-4 bg-gray" />
                <div className="flex-center-y justify-between">
                    <div className="flex-center-y gap-2">
                        {data!.status === "APPROVED"  && ( 
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex-center-y gap-2">
                                    <SquarePen className="w-4 h-4" /> Export Order
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="">
                                    <DropdownMenuItem
                                        onClick={() => exportForm("purchase", tab === tabs[0] ? "meat" : "snow")}
                                    >
                                        <ShoppingCart /> Purchase Order
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => exportForm("delivery", tab === tabs[0] ? "meat" : "snow")}
                                    >
                                        <Truck /> Delivery Receipt
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        {["PENDING", "TO FOLLOW", "TO_FOLLOW"].includes(data!.status) && (
                            <div className="flex-center-y gap-2">
                                <Button
                                    onClick={ () => setEdit(true) }
                                    variant="secondary"
                                    className="border border-slate-200 shadow-xs"
                                >
                                    <SquarePen /> Edit Order
                                </Button>
                        
                        
                                <Button
                                    onClick={ () => setUpdateShip(true) }
                                    variant="secondary"
                                    className="border border-slate-200 shadow-xs"
                                >
                                    <CalendarSync /> Update Shipment
                                </Button>
                            </div>
                        )}
                        
                    </div>
                    <div className="text-gray text-end mx-4">
                        Complete Order Total:  <span className="ml-2 font-semibold text-darkbrown inline-block scale-x-120">{ formatToPeso(data!.completeOrderTotalAmount) }</span>
                    </div>
                </div>
            </div>

            {data?.remarks && (
                <div className="border border-dashed border-gray w-full bg-light p-4">
                    <span className="font-semibold">Commissary Remarks: </span> { data?.remarks }
                </div>
            )}

            {open && <ConfirmSave 
                setOpen={ setOpen }
                order={ data! }
                meatApproved={ meatApproved! }
                snowApproved={ snowApproved! }
                onProcess={ onProcess }
                handleSubmit={ handleSubmit }
            />}

            {openExpDel && (
                <ExpectedDeliveryDatePicker 
                    date={expDel}
                    setDate={setExpDel}
                    open={openExpDel}
                    setOpen={setOpenExpDel}
                    onProcess={processExpDel}
                    handleSubmit={handleUpdateExpDel}
                />
            )}

            {toReject && <ConfirmReject
                orderId={ id }
                open={toReject}
                setOpen={setReject}
                setReload={setReload}
            />}

            {toUpdateShip && (
                <UpdateShipment 
                    setOpen={setUpdateShip}
                    setReload={setReload}
                    orderId={data!.orderId!}
                    internalShipment={data!.internalShipment}
                    deliveryType={data!.deliveryType}
                />
            )}
        </section>
    )
}
