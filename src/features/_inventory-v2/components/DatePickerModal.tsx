"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, isAfter, startOfWeek, endOfWeek } from "date-fns";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

type Mode = "DAY" | "WEEK";

export function DatePickerModal({
	date,
	setDate,
	open,
	setOpen,
	setByWeek
}: {
	date: string;
	setDate: (value: string) => void;
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	setByWeek: (i: boolean) => void;
}) {
	const toYMD = (d: Date | undefined) => (d ? format(d, "yyyy-MM-dd") : "");

	const today = new Date();

	const disableFutureDates = (d: Date) => isAfter(d, today);

	const [mode, setMode] = useState<Mode>("DAY");

	const [weekAnchor, setWeekAnchor] = useState<Date | undefined>(
		date ? new Date(date) : undefined
	);

	const selectedDay = useMemo(() => (date ? new Date(date) : undefined), [date]);

	const weekRange = useMemo(() => {
		if (!weekAnchor) return null;
		const start = startOfWeek(weekAnchor, { weekStartsOn: 0 });
		const end = endOfWeek(weekAnchor, { weekStartsOn: 0 });
		return { start, end };
	}, [weekAnchor]);

	const weekLabel = useMemo(() => {
		if (!weekRange) return "Select a week (Sun–Sat)";
		return `${format(weekRange.start, "MMM dd")} - ${format(
			weekRange.end,
			"MMM dd, yyyy"
		)}`;
	}, [weekRange]);

	const handleDayChange = (d: Date | undefined) => {
		if (!d) return;
		setDate(toYMD(d));
		setByWeek(false);
		setOpen(false);
	};

	const handleWeekPick = (d: Date | undefined) => {
		if (!d) return;
		setWeekAnchor(d);
	};

	const applyWeek = () => {
		if (!weekRange) return;
		const startStr = toYMD(weekRange.start);
		const endStr = toYMD(weekRange.end);

		setDate(startStr);
		setByWeek(true);
		setOpen(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				setOpen(v);
			}}
		>
			<DialogContent className="my-auto min-h-[95vh] overflow-y-auto">
				<DialogTitle className="space-y-3">
					<AppHeader label="Select a date" />

					<div className="flex w-full gap-2 rounded-md bg-slate-100 p-1">
						<button
							type="button"
							onClick={() => setMode("DAY")}
							className={`w-full rounded-md px-3 py-2 text-sm font-semibold transition ${
								mode === "DAY" ? "bg-white shadow" : "opacity-70"
							}`}
						>
							Day
						</button>
						<button
							type="button"
							onClick={() => {
								setMode("WEEK");
								if (!weekAnchor && selectedDay) setWeekAnchor(selectedDay);
							}}
							className={`w-full rounded-md px-3 py-2 text-sm font-semibold transition ${
								mode === "WEEK" ? "bg-white shadow" : "opacity-70"
							}`}
						>
							Weekly (Sun–Sat)
						</button>
					</div>

					{mode === "DAY" ? (
						<Calendar
							mode="single"
							selected={selectedDay}
							onSelect={handleDayChange}
							disabled={disableFutureDates}
							className="w-full grid"
						/>
					) : (
						<div className="space-y-3">
							<div className="flex items-center justify-between gap-2 rounded-md border bg-white p-3">
								<div className="text-sm">
									<div className="font-semibold">Selected week</div>
									<div className="text-slate-600">{weekLabel}</div>
								</div>

								<Button
									type="button"
									className="bg-darkgreen! hover:opacity-90"
									disabled={!weekRange}
									onClick={applyWeek}
								>
									Apply week
								</Button>
							</div>

							<Calendar
								mode="single"
								selected={weekAnchor}
								onSelect={handleWeekPick}
								disabled={disableFutureDates}
								className="w-full grid"
							/>
						</div>
					)}
				</DialogTitle>
			</DialogContent>
		</Dialog>
	);
}
