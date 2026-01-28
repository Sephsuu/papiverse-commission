import { AppHeader } from "@/components/shared/AppHeader";
import { ModalTitle } from "@/components/shared/ModalTitle";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { format, isAfter } from "date-fns";
import { Dispatch, SetStateAction } from "react";

export function DatePickerModal({
  date,
  setDate,
  open,
  setOpen,
}: {
  date: string;
  setDate: (value: string) => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const toYMD = (d: Date | undefined) =>
        d ? format(d, "yyyy-MM-dd") : "";

    const today = new Date();
    const currentYear = today.getFullYear();

    const fromYear = currentYear - 5;
    const toYear = currentYear;

    const disableFutureDates = (d: Date) => isAfter(d, today);

    const handleChange = (d: Date | undefined) => {
        if (!d) return;
        setDate(toYMD(d));
        setOpen(false); // optional UX improvement
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="my-auto -mt-12 min-h-[70vh]">
                <DialogTitle>
                    <AppHeader label="Select a date" />
                    <Calendar
                        mode="single"
                        selected={date ? new Date(date) : undefined}
                        onSelect={handleChange}
                        disabled={disableFutureDates}
                        fromYear={fromYear}
                        toYear={toYear}
                        className="w-full grid"
                />
                </DialogTitle>
            </DialogContent>
        </Dialog>
    );
}
