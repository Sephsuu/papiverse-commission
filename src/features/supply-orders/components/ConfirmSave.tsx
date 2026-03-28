import { ModalTitle } from "@/components/shared/ModalTitle";
import { AlertDialog, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button, UpdateButton } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SupplyOrder } from "@/types/supplyOrder";
import { format, isAfter } from "date-fns";
import { CalendarIcon, ChevronDown, MoveRight } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

export function ConfirmSave({ setOpen, order, meatApproved, snowApproved, onProcess, handleSubmit }: {
    setOpen: Dispatch<SetStateAction<boolean>>;
    order: SupplyOrder,
    meatApproved: boolean, 
    snowApproved: boolean,
    onProcess: boolean,
    handleSubmit: (i: boolean, j: boolean, effectiveDate?: string) => void;
}) {
    const [effectiveDateOpen, setEffectiveDateOpen] = useState(false);
    const [effectiveDate, setEffectiveDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const today = new Date();
    const selectedEffectiveDate = effectiveDate ? new Date(effectiveDate) : undefined;

    return (
        <AlertDialog open>
            <AlertDialogContent>
                <ModalTitle
                    label="Confirm Order Approval?"
                    isAlertDialog={true}
                />
                <form
                    className="flex flex-col gap-4"
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit(meatApproved, snowApproved, effectiveDate);
                        setOpen(prev => !prev);
                    }}
                >
                    <div className="flex-center flex-col gap-2">
                        <div className="text-center">Meat Order Approval</div>
                        {order.meatCategory?.isApproved === meatApproved ?
                            <div className={`text-center font-bold ${meatApproved ? "text-darkgreen" : "text-darkred"}`}>
                                { meatApproved ? 'Approved' : 'Not Approved' }
                            </div> 
                            :
                            <div className="flex-center gap-2" >
                                <div className={`text-center font-bold ${order.meatCategory?.isApproved ? "text-darkgreen" : "text-darkred"}`}>
                                    { order.meatCategory?.isApproved ? 'Approved' : 'Not Approved' }
                                </div>
                                <MoveRight className="w-6 h-6" />
                                <div className={`text-center font-bold ${meatApproved ? "text-darkgreen" : "text-darkred"}`}>
                                    { meatApproved ? 'Approved' : 'Not Approved' }
                                </div>
                            </div>
                        }
                    </div>
                    <Separator className="h-2 bg-gray" />
                    <div className="flex-center flex-col gap-2">
                        <div className="text-center">Snowfrost Order Approval</div>
                        {order.snowfrostCategory?.isApproved === snowApproved ?
                            <div className={`text-center font-bold ${snowApproved ? "text-darkgreen" : "text-darkred"}`}>
                                { snowApproved ? 'Approved' : 'Not Approved' }
                            </div> 
                            :
                            <div className="flex-center gap-2" >
                                <div className={`text-center font-bold ${order.snowfrostCategory?.isApproved ? "text-darkgreen" : "text-darkred"}`}>
                                    { order.snowfrostCategory?.isApproved ? 'Approved' : 'Not Approved' }
                                </div>
                                <MoveRight className="w-6 h-6" />
                                <div className={`text-center font-bold ${snowApproved ? "text-darkgreen" : "text-darkred"}`}>
                                    { snowApproved ? 'Approved' : 'Not Approved' }
                                </div>
                            </div>
                        }
                    </div>
    
                        <Popover open={effectiveDateOpen} onOpenChange={setEffectiveDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                        "h-auto w-full justify-between border border-slate-300 shadow-sm bg-light px-4 py-3 text-left font-normal hover:bg-light/40",
                                        !effectiveDate && "text-muted-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-xs border">
                                            <CalendarIcon className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs uppercase tracking-[0.18em] text-gray">
                                                Effective date
                                            </span>
                                            <span className="text-sm font-semibold text-md">
                                                {selectedEffectiveDate
                                                    ? format(selectedEffectiveDate, "PPP")
                                                    : "Select effective date"}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedEffectiveDate}
                                    disabled={(date) => isAfter(date, today)}
                                    onSelect={(date) => {
                                        if (!date) return;
                                        setEffectiveDate(format(date, "yyyy-MM-dd"));
                                        setEffectiveDateOpen(false);
                                    }}
                                    className="rounded-md border shadow-sm"
                                    captionLayout="dropdown"
                                />
                            </PopoverContent>
                        </Popover>
                    <div className="flex-center-y justify-end gap-2">
                        <AlertDialogCancel onClick={ () => setOpen(prev => !prev) }>Cancel</AlertDialogCancel>
                        <UpdateButton
                            type="submit"
                            onProcess={ onProcess }
                            label="Save Approval"
                            loadingLabel="Saving Approval"
                        />
                    </div>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
