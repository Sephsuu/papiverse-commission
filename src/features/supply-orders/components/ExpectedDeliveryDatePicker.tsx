"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button, UpdateButton } from "@/components/ui/button";
import { format, isAfter, startOfWeek, endOfWeek, addDays, startOfDay, isBefore } from "date-fns";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

type Mode = "DAY" | "WEEK";

export function ExpectedDeliveryDatePicker({
    date,
    setDate,
    open,
    setOpen,
    onProcess,
    handleSubmit
}: {
    date: string | null;
    setDate: (value: string) => void;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    onProcess: boolean,
    handleSubmit: () => void
}) {
    const toYMD = (d: Date | undefined) => (d ? format(d, "yyyy-MM-dd") : "");

    const today = new Date();

    const minSelectable = addDays(today, 2);

    const disableInvalidDates = (d: Date) => {
        const day = startOfDay(d);
        return isBefore(day, minSelectable);
    };

    const selectedDay = useMemo(() => (date ? new Date(date) : undefined), [date]);

    const handleDayChange = (d: Date | undefined) => {
        if (!d) return;
        setDate(toYMD(d));
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
            }}
        >
            <DialogContent className="my-auto max-h-[85vh] max-h-[85dvh] overflow-y-auto">
                <DialogTitle className="space-y-3">
                    <AppHeader label="Expected Delivery Date" hidePapiverseLogo />
                    <Calendar
                        mode="single"
                        selected={selectedDay}
                        onSelect={handleDayChange}
                        disabled={disableInvalidDates}
                        className="w-full grid mb-12"
                    />
                    <form 
                        onSubmit={e => {
                            e.preventDefault();
                            handleSubmit();
                        }}
                        className="absolute bottom-8 right-8 flex-center-y gap-6"
                    >
                        <DialogClose className="font-normal text-[16px]">Cancel</DialogClose>
                        <UpdateButton 
                            type="submit"
                            onProcess={onProcess}
                            label="Save Date"
                            loadingLabel="Saving Date"
                        />
                    </form>
                </DialogTitle>
            </DialogContent>
        </Dialog>
    );
}
