import { AppSelect } from "@/components/shared/AppSelect";
import { AddButton, Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PaymentSettlementService, SettlementEntryType } from "@/services/paymentSettlement.service";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeftRight, CalendarIcon } from "lucide-react";

type Person = { id: number; displayName: string };

interface Props {
    setOpen: Dispatch<SetStateAction<boolean>>;
    setReload: Dispatch<SetStateAction<boolean>>;
    settlementGroupId: number;
    people: Person[];
}

function toLocalDateTimeInputValue(date: Date) {
    const pad = (value: number) => String(value).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getWeekLabelFromDate(date: Date) {
    const day = date.getDate();
    if (day <= 7) return "WEEK 1";
    if (day <= 14) return "WEEK 2";
    if (day <= 21) return "WEEK 3";
    return "WEEK 4";
}

export function CreatePaymentSettlementEntry({ setOpen, setReload, settlementGroupId, people }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [dateOpen, setDateOpen] = useState(false);
    const [fromPersonId, setFromPersonId] = useState(people[0]?.id ? String(people[0].id) : "");
    const [toPersonId, setToPersonId] = useState(people[1]?.id ? String(people[1].id) : "");
    const [entryType, setEntryType] = useState<SettlementEntryType>("DEBT");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [recordedAtDate, setRecordedAtDate] = useState<Date>(new Date());

    const personItems = useMemo(
        () => people.map((person) => ({ label: person.displayName, value: String(person.id) })),
        [people]
    );
    const fromPersonItems = personItems;
    const toPersonItems = personItems;

    React.useEffect(() => {
        if (!fromPersonId || !toPersonId) return;
        if (fromPersonId !== toPersonId) return;

        const nextTo = personItems.find((item) => item.value !== fromPersonId);
        setToPersonId(nextTo?.value ?? "");
    }, [fromPersonId, toPersonId, personItems]);

    async function handleSubmit() {
        try {
            setProcess(true);

            if (!settlementGroupId) {
                toast.info("Please select a settlement group first.");
                setProcess(false);
                return;
            }

            if (!fromPersonId || !toPersonId || !amount.trim() || !description.trim()) {
                toast.info("Please fill up all fields.");
                setProcess(false);
                return;
            }

            if (fromPersonId === toPersonId) {
                toast.info("From and To person must be different.");
                setProcess(false);
                return;
            }

            if (Number(amount) <= 0) {
                toast.info("Amount must be greater than zero.");
                setProcess(false);
                return;
            }

            const payload = {
                settlementGroupId,
                fromPersonId: Number(fromPersonId),
                toPersonId: Number(toPersonId),
                amount: Number(amount),
                entryType,
                weekLabel: getWeekLabelFromDate(recordedAtDate),
                description: description.trim(),
                recordedAt: recordedAtDate.toISOString(),
            };

            const data = await PaymentSettlementService.createLedgerEntry(settlementGroupId, payload);

            if (data) {
                toast.success("Payment settlement entry created successfully.");
                setReload((prev) => !prev);
                setOpen(false);
            }
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    return (
        <Dialog open onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle className="flex items-center gap-2">
                    <Image
                        src="/images/kp_logo.png"
                        alt="KP Logo"
                        width={40}
                        height={40}
                    />
                    <div className="text-xl font-semibold">Create Settlement Entry</div>
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
                            items={fromPersonItems}
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
                            items={toPersonItems}
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
                        <div className="flex flex-col gap-1">
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
                                        setRecordedAtDate(value);
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
                        <AddButton
                            type="submit"
                            onProcess={onProcess}
                            label="Create Entry"
                            loadingLabel="Creating Entry"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
