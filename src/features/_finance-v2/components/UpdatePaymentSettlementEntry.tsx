import { AppSelect } from "@/components/shared/AppSelect";
import { Button, UpdateButton } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { PaymentSettlementService, SettlementEntryType } from "@/services/paymentSettlement.service";
import { format } from "date-fns";
import { ArrowLeftRight, CalendarIcon } from "lucide-react";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

type Person = { id: number; displayName: string };
type LedgerEntry = {
    id: number;
    fromPersonId: number;
    toPersonId: number;
    amount: number;
    entryType: SettlementEntryType;
    description: string;
    recordedAt?: string;
};

interface Props {
    toUpdate: LedgerEntry;
    people: Person[];
    setUpdate: React.Dispatch<React.SetStateAction<LedgerEntry | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

function getWeekLabelFromDate(date: Date) {
    const day = date.getDate();
    if (day <= 7) return "WEEK 1";
    if (day <= 14) return "WEEK 2";
    if (day <= 21) return "WEEK 3";
    return "WEEK 4";
}

function toLocalDateTimeString(date: Date) {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

function parseRecordedAt(value?: string) {
    if (!value) return new Date();
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return new Date();
    return parsed;
}

export function UpdatePaymentSettlementEntry({ toUpdate, people, setUpdate, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [dateOpen, setDateOpen] = useState(false);
    const [fromPersonId, setFromPersonId] = useState(String(toUpdate.fromPersonId));
    const [toPersonId, setToPersonId] = useState(String(toUpdate.toPersonId));
    const [entryType, setEntryType] = useState<SettlementEntryType>(toUpdate.entryType);
    const [amount, setAmount] = useState(String(toUpdate.amount ?? ""));
    const [description, setDescription] = useState(toUpdate.description ?? "");
    const [recordedAtDate, setRecordedAtDate] = useState<Date>(() => parseRecordedAt(toUpdate.recordedAt));

    const personItems = useMemo(
        () => people.map((person) => ({ label: person.displayName, value: String(person.id) })),
        [people]
    );

    React.useEffect(() => {
        if (!fromPersonId || !toPersonId) return;
        if (fromPersonId !== toPersonId) return;

        const nextTo = personItems.find((item) => item.value !== fromPersonId);
        setToPersonId(nextTo?.value ?? "");
    }, [fromPersonId, toPersonId, personItems]);

    async function handleSubmit() {
        try {
            setProcess(true);

            if (!fromPersonId || !toPersonId || !amount.trim() || !description.trim()) {
                toast.info("Please fill up all fields.");
                return;
            }

            if (fromPersonId === toPersonId) {
                toast.info("From and To person must be different.");
                return;
            }

            if (Number(amount) <= 0) {
                toast.info("Amount must be greater than zero.");
                return;
            }

            const payload = {
                fromPersonId: Number(fromPersonId),
                toPersonId: Number(toPersonId),
                amount: Number(amount),
                entryType,
                weekLabel: getWeekLabelFromDate(recordedAtDate),
                description: description.trim(),
                recordedAt: toLocalDateTimeString(recordedAtDate),
            };

            const data = await PaymentSettlementService.updateLedgerEntry(toUpdate.id, payload);

            if (data) {
                toast.success("Payment settlement entry updated successfully.");
                setReload((prev) => !prev);
                setUpdate(undefined);
            }
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => { if (!open) setUpdate(undefined); }}>
            <DialogContent>
                <DialogTitle className="flex items-center gap-2">
                    <Image
                        src="/images/kp_logo.png"
                        alt="KP Logo"
                        width={40}
                        height={40}
                    />
                    <div className="text-xl font-semibold">Update Settlement Entry</div>
                </DialogTitle>

                <form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                        <AppSelect
                            label="From Person"
                            groupLabel="People"
                            placeholder="Select person"
                            items={personItems}
                            value={fromPersonId}
                            onChange={setFromPersonId}
                            labelClassName="text-md"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 px-3"
                            onClick={() => {
                                const prevFrom = fromPersonId;
                                setFromPersonId(toPersonId);
                                setToPersonId(prevFrom);
                            }}
                            disabled={!fromPersonId || !toPersonId}
                        >
                            <ArrowLeftRight className="h-4 w-4" />
                            Swap
                        </Button>
                        <AppSelect
                            label="To Person"
                            groupLabel="People"
                            placeholder="Select person"
                            items={personItems}
                            value={toPersonId}
                            onChange={setToPersonId}
                            labelClassName="text-md"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <AppSelect
                            label="Entry Type"
                            groupLabel="Types"
                            items={[
                                { label: "DEBT", value: "DEBT" },
                                { label: "PAYMENT", value: "PAYMENT" },
                            ]}
                            value={entryType}
                            onChange={(value) => setEntryType(value as SettlementEntryType)}
                            labelClassName="text-md"
                        />
                        <div className="flex flex-col gap-1">
                            <div>Amount</div>
                            <div className="relative">
                                <span className="absolute mx-3 top-1/2 -translate-y-1/2">₱</span>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    className="pl-8 border border-gray"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div>Recorded At</div>
                        <Popover open={dateOpen} onOpenChange={setDateOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="h-10 flex items-center justify-between rounded-md border border-gray px-3 text-sm"
                                >
                                    <span>{recordedAtDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                                    <CalendarIcon className="h-4 w-4" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-50" align="start">
                                <Calendar
                                    mode="single"
                                    selected={recordedAtDate}
                                    onSelect={(value) => {
                                        if (!value) return;
                                        const nextDate = new Date(value);
                                        nextDate.setHours(
                                            recordedAtDate.getHours(),
                                            recordedAtDate.getMinutes(),
                                            recordedAtDate.getSeconds(),
                                            recordedAtDate.getMilliseconds()
                                        );
                                        setRecordedAtDate(nextDate);
                                        setDateOpen(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div>Description</div>
                        <Textarea
                            className="border border-gray"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="mt-1 flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <UpdateButton
                            type="submit"
                            onProcess={onProcess}
                            label="Update Entry"
                            loadingLabel="Updating Entry"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

