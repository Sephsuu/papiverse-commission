import { ModalTitle } from "@/components/shared/ModalTitle";
import { AppInput } from "@/components/shared/AppInput";
import { AppSelect } from "@/components/shared/AppSelect";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { FormLoader } from "@/components/ui/loader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SupplyOrderPaymentService } from "@/services/supplyOrderPayment.service";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

export function CreateSupplyOrderPayment({
    supplyOrderId,
    setOpen,
    setReload,
}: {
    supplyOrderId: number;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setReload: Dispatch<SetStateAction<boolean>>;
}) {
    const [onProcess, setProcess] = useState(false);
    const [date, setDate] = useState<Date | undefined>(() => new Date());
    const [paymentDate, setPaymentDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
    const [dateOpen, setDateOpen] = useState(false);
    const [paymentMode, setPaymentMode] = useState("");
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");
    const paymentModeOptions = [
        "BDO",
        "EASTWEST",
        "GCASH",
        "BPI",
        "GO_TYME",
        "UNION_BANK",
        "INTERNAL",
        "CASH",
    ];

    useEffect(() => {
        if (!date) return;
        setPaymentDate(format(date, "yyyy-MM-dd"));
        setDateOpen(false);
    }, [date]);

    async function handleSubmit() {
        try {
            setProcess(true);

            if (!supplyOrderId || !paymentDate || !paymentMode.trim() || !amount) {
                toast.info("Please fill up all required fields.");
                setProcess(false);
                return;
            }

            if (Number(amount) <= 0) {
                toast.info("Amount must be greater than zero.");
                setProcess(false);
                return;
            }

            await SupplyOrderPaymentService.createPayment({
                supplyOrderId,
                paymentDate,
                paymentMode: paymentMode.trim().toUpperCase(),
                amount: Number(amount),
                remarks: remarks.trim(),
            });

            toast.success("Payment added successfully.");
            setReload((prev) => !prev);
            setOpen(false);
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    return (
        <Dialog open onOpenChange={setOpen}>
            <DialogContent>
                <ModalTitle
                    label="Add Supply Order"
                    spanLabel="Payment"
                    spanLabelClassName="!text-darkgreen"
                />

                <form
                    className="stack-sm"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="flex flex-col gap-1">
                        <div>Payment Date</div>
                        <Popover open={dateOpen} onOpenChange={setDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant={"outline"}
                                    className={cn(
                                        "justify-start text-left font-normal border border-gray",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon />
                                    {date ? format(date, "PPP") : <span>Select payment date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-50">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border shadow-sm"
                                    captionLayout="dropdown"
                                />
                            </PopoverContent>
                            <input
                                type="hidden"
                                name="paymentDate"
                                value={paymentDate}
                                required
                            />
                        </Popover>
                    </div>

                    <AppSelect
                        label="Payment Mode"
                        groupLabel="Modes"
                        placeholder="Select payment mode"
                        items={paymentModeOptions}
                        value={paymentMode}
                        onChange={setPaymentMode}
                        triggerClassName="border border-gray"
                    />

                    <AppInput
                        label="Amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        labelCharacter="₱"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />

                    <AppInput
                        label="Remarks"
                        placeholder="Partial payment"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />

                    <div className="flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <Button
                            type="submit"
                            disabled={onProcess}
                            size="sm"
                            className="!bg-darkgreen hover:opacity-90"
                        >
                            <FormLoader onProcess={onProcess} label="Add Payment" loadingLabel="Adding Payment" />
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
