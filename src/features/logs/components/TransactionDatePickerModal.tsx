"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { format, isAfter } from "date-fns";
import { Dispatch, SetStateAction, useMemo } from "react";

type TransactionDatePickerModalProps = {
    date: string;
    open: boolean;
    setDate: (value: string) => void;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export function TransactionDatePickerModal({
    date,
    open,
    setDate,
    setOpen,
}: TransactionDatePickerModalProps) {
    const today = useMemo(() => new Date(), []);
    const selectedDate = useMemo(() => (date ? new Date(date) : undefined), [date]);

    const handleSelect = (value: Date | undefined) => {
        if (!value) return;

        setDate(format(value, "yyyy-MM-dd"));
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="my-auto max-h-9/10 overflow-y-auto">
                <DialogTitle className="space-y-3">
                    <AppHeader label="Select a date" />

                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelect}
                        disabled={(value) => isAfter(value, today)}
                        className="w-full grid"
                    />
                </DialogTitle>
            </DialogContent>
        </Dialog>
    );
}
