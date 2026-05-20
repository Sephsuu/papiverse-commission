import { ModalTitle } from "@/components/shared/ModalTitle";
import { AppInput } from "@/components/shared/AppInput";
import { AppSelect } from "@/components/shared/AppSelect";
import { Button, UpdateButton } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SupplyOrderPaymentService } from "@/services/supplyOrderPayment.service";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

export function UpdateSupplyOrderPayment({
    toUpdate,
    setUpdate,
    setReload,
}: {
    toUpdate: any;
    setUpdate: Dispatch<SetStateAction<any | undefined>>;
    setReload: Dispatch<SetStateAction<boolean>>;
}) {
    const [onProcess, setProcess] = useState(false);
    const [paymentDate, setPaymentDate] = useState(toUpdate.paymentDate ?? "");
    const [paymentMode, setPaymentMode] = useState(toUpdate.paymentMode ?? "");
    const [amount, setAmount] = useState(String(toUpdate.amount ?? ""));
    const [remarks, setRemarks] = useState(toUpdate.remarks ?? "");
    const [date, setDate] = useState<Date | undefined>(
        toUpdate.paymentDate ? new Date(toUpdate.paymentDate) : undefined
    );
    const [dateOpen, setDateOpen] = useState(false);
    const paymentModeOptions = ["BDO", "EASTWEST", "GCASH", "BPI", "GO_TYME", "UNION_BANK", "INTERNAL", "CASH"];

    useEffect(() => {
        if (!date) return;
        setPaymentDate(format(date, "yyyy-MM-dd"));
        setDateOpen(false);
    }, [date]);

    async function handleSubmit() {
        try {
            setProcess(true);
            if (!paymentDate || !paymentMode || !amount) {
                toast.info("Please fill up all required fields.");
                return;
            }
            await SupplyOrderPaymentService.updatePayment({
                id: toUpdate.paymentId,
                supplyOrderId: toUpdate.supplyOrderId,
                paymentDate,
                paymentMode,
                amount: Number(amount),
                remarks: remarks.trim(),
            });
            toast.success("Payment updated successfully.");
            setUpdate(undefined);
            setReload((prev) => !prev);
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => { if (!open) setUpdate(undefined) }}>
            <DialogContent>
                <ModalTitle label="Update Supply Order" spanLabel="Payment" spanLabelClassName="!text-blue" />
                <form className="stack-sm" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <div className="flex flex-col gap-1">
                        <div>Payment Date</div>
                        <Popover open={dateOpen} onOpenChange={setDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant={"outline"}
                                    className={cn("justify-start text-left font-normal border border-gray", !date && "text-muted-foreground")}
                                >
                                    <CalendarIcon />
                                    {date ? format(date, "PPP") : <span>Select payment date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-50">
                                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border shadow-sm" captionLayout="dropdown" />
                            </PopoverContent>
                            <input type="hidden" name="paymentDate" value={paymentDate} required />
                        </Popover>
                    </div>

                    <AppSelect label="Payment Mode" groupLabel="Modes" items={paymentModeOptions} value={paymentMode} onChange={setPaymentMode} />
                    <AppInput label="Amount" type="number" min="0.01" step="0.01" labelCharacter="₱" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                    <AppInput label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />

                    <div className="flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <UpdateButton type="submit" onProcess={onProcess} label="Update Payment" loadingLabel="Updating Payment" />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
