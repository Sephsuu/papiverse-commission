"use client";

import { AppHeader } from "@/components/shared/AppHeader";
import { AppSelect } from "@/components/shared/AppSelect";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	addYears,
	endOfMonth,
	endOfQuarter,
	endOfWeek,
	format,
	isAfter,
	isSameMonth,
	startOfMonth,
	startOfQuarter,
	startOfWeek
} from "date-fns";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

export type InventoryReportPeriodMode = "DAY" | "WEEK" | "MONTH" | "QUARTER";

export function DatePickerModal({
	date,
	mode,
	setDate,
	setEndDate,
	open,
	setOpen,
	setMode
}: {
	date: string;
	mode: InventoryReportPeriodMode;
	setDate: (value: string) => void;
	setEndDate: (value: string) => void;
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	setMode: (value: InventoryReportPeriodMode) => void;
}) {
	const toYMD = (d: Date | undefined) => (d ? format(d, "yyyy-MM-dd") : "");
	const today = useMemo(() => new Date(), []);
	const disableFutureDates = (d: Date) => isAfter(d, today);
	const selectedDate = useMemo(() => (date ? new Date(date) : undefined), [date]);
	const baseDate = selectedDate ?? today;
	const [periodMode, setPeriodMode] = useState<InventoryReportPeriodMode>(mode);
	const [periodAnchor, setPeriodAnchor] = useState<Date | undefined>(selectedDate);
	const [monthYearCursor, setMonthYearCursor] = useState(new Date(baseDate.getFullYear(), 0, 1));
	const [quarterYear, setQuarterYear] = useState(baseDate.getFullYear());
	const [quarterNumber, setQuarterNumber] = useState(
		Math.floor(baseDate.getMonth() / 3) + 1
	);
	const selectedDay = useMemo(() => (date ? new Date(date) : undefined), [date]);

	useEffect(() => {
		if (!open) return;

		const nextBaseDate = selectedDate ?? today;
		setPeriodMode(mode);
		setPeriodAnchor(selectedDate);
		setMonthYearCursor(new Date(nextBaseDate.getFullYear(), 0, 1));
		setQuarterYear(nextBaseDate.getFullYear());
		setQuarterNumber(Math.floor(nextBaseDate.getMonth() / 3) + 1);
	}, [mode, open, selectedDate, today]);

	const selectedRange = useMemo(() => {
		if (periodMode === "QUARTER") {
			const quarterAnchor = new Date(quarterYear, (quarterNumber - 1) * 3, 1);
			const start = startOfQuarter(quarterAnchor);
			const rawEnd = endOfQuarter(quarterAnchor);
			return { start, end: isAfter(rawEnd, today) ? today : rawEnd };
		}

		if (!periodAnchor) return null;

		if (periodMode === "DAY") {
			return { start: periodAnchor, end: periodAnchor };
		}

		if (periodMode === "WEEK") {
			const start = startOfWeek(periodAnchor, { weekStartsOn: 0 });
			const rawEnd = endOfWeek(periodAnchor, { weekStartsOn: 0 });
			return { start, end: isAfter(rawEnd, today) ? today : rawEnd };
		}

		const start = startOfMonth(periodAnchor);
		const rawEnd = endOfMonth(periodAnchor);
		return { start, end: isAfter(rawEnd, today) ? today : rawEnd };
	}, [periodAnchor, periodMode, quarterNumber, quarterYear, today]);

	const rangeLabel = useMemo(() => {
		if (!selectedRange) return "Select a period";

		if (periodMode === "DAY") {
			return format(selectedRange.start, "MMMM dd, yyyy");
		}

		if (periodMode === "WEEK") {
			return `${format(selectedRange.start, "MMM dd")} - ${format(selectedRange.end, "MMM dd, yyyy")}`;
		}

		if (periodMode === "MONTH") {
			return format(selectedRange.start, "MMMM yyyy");
		}

		const quarterLabels = ["First Quarter", "Second Quarter", "Third Quarter", "Fourth Quarter"];
		return `${quarterLabels[quarterNumber - 1]} ${quarterYear}`;
	}, [periodMode, quarterNumber, quarterYear, selectedRange]);

	const quarterOptions = useMemo(() => {
		const labels = ["First Quarter", "Second Quarter", "Third Quarter", "Fourth Quarter"];

		return labels.map((label, index) => {
			const value = index + 1;
			const quarterAnchor = new Date(quarterYear, index * 3, 1);
			const start = startOfQuarter(quarterAnchor);
			const rawEnd = endOfQuarter(quarterAnchor);
			const end = isAfter(rawEnd, today) ? today : rawEnd;
			const disabled = isAfter(start, today);

			return {
				label,
				value,
				disabled,
				helper: `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}`,
			};
		});
	}, [quarterYear, today]);

	const handleMonthPick = (monthIndex: number) => {
		const nextMonth = new Date(monthYearCursor.getFullYear(), monthIndex, 1);
		if (isAfter(startOfMonth(nextMonth), today)) return;

		setPeriodAnchor(nextMonth);
	};

	const handleApply = () => {
		if (!selectedRange) return;

		setDate(toYMD(selectedRange.start));
		setEndDate(toYMD(selectedRange.end));
		setMode(periodMode);
		setOpen(false);
	};

	const handleDayChange = (d: Date | undefined) => {
		if (!d) return;
		setDate(toYMD(d));
		setEndDate(toYMD(d));
		setMode("DAY");
		setOpen(false);
	};

	const handleWeekPick = (d: Date | undefined) => {
		if (!d) return;
		setPeriodAnchor(d);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				setOpen(v);
			}}
		>
			<DialogContent className="my-auto max-h-[90vh] overflow-y-auto sm:max-w-xl">
				<DialogTitle>
					<AppHeader label="Select a period" />
				</DialogTitle>
				<div className="space-y-3">
					<div className="grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1">
						{[
							{ label: "Daily", value: "DAY" },
							{ label: "Weekly", value: "WEEK" },
							{ label: "Monthly", value: "MONTH" },
							{ label: "Quarterly", value: "QUARTER" },
						].map((item) => (
							<button
								key={item.value}
								type="button"
								onClick={() => {
									setPeriodMode(item.value as InventoryReportPeriodMode);
									if (item.value === "WEEK" && !periodAnchor && selectedDay) {
										setPeriodAnchor(selectedDay);
									}
								}}
								className={`w-full rounded-md px-3 py-2 text-sm font-semibold transition ${
									periodMode === item.value ? "bg-white shadow" : "opacity-70"
								}`}
							>
								{item.label}
							</button>
						))}
					</div>

					<div className="flex items-center justify-between gap-2 rounded-md border bg-white p-3">
						<div className="text-sm">
							<div className="font-semibold">Selected period</div>
							<div className="text-slate-600">{rangeLabel}</div>
						</div>

						{periodMode === "DAY" ? null : (
							<Button
								type="button"
								className="bg-darkgreen! hover:opacity-90"
								disabled={!selectedRange}
								onClick={handleApply}
							>
								Apply
							</Button>
						)}
					</div>

					{periodMode === "DAY" ? (
						<Calendar
							mode="single"
							selected={selectedDay}
							onSelect={handleDayChange}
							disabled={disableFutureDates}
							className="w-full"
						/>
					) : periodMode === "MONTH" ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<button
									type="button"
									className="rounded-md border px-3 py-2 text-sm font-semibold"
									onClick={() => setMonthYearCursor(addYears(monthYearCursor, -1))}
								>
									Prev year
								</button>
								<div className="text-lg font-semibold text-slate-900">
									{format(monthYearCursor, "yyyy")}
								</div>
								<button
									type="button"
									className="rounded-md border px-3 py-2 text-sm font-semibold"
									onClick={() => setMonthYearCursor(addYears(monthYearCursor, 1))}
									disabled={monthYearCursor.getFullYear() >= today.getFullYear()}
								>
									Next year
								</button>
							</div>

							<div className="grid grid-cols-3 gap-2">
								{Array.from({ length: 12 }, (_, index) => {
									const monthDate = new Date(monthYearCursor.getFullYear(), index, 1);
									const disabled = isAfter(startOfMonth(monthDate), today);
									const active = periodAnchor ? isSameMonth(periodAnchor, monthDate) : false;

									return (
										<button
											key={index}
											type="button"
											disabled={disabled}
											onClick={() => handleMonthPick(index)}
											className={`rounded-md border px-3 py-4 text-sm font-semibold transition ${
												active
													? "border-darkbrown bg-light text-darkbrown"
													: "bg-white text-slate-700"
											} ${disabled ? "cursor-not-allowed opacity-40" : "hover:bg-slate-50"}`}
										>
											{format(monthDate, "MMMM")}
										</button>
									);
								})}
							</div>
						</div>
					) : periodMode === "QUARTER" ? (
						<div className="space-y-4">
							<div className="space-y-2">
								<div className="text-sm font-semibold text-slate-700">Year</div>
								<AppSelect
									placeholder="Select year"
									items={Array.from({ length: 5 }, (_, index) => String(today.getFullYear() - 4 + index))}
									value={String(quarterYear)}
									onChange={(value) => setQuarterYear(Number(value))}
								/>
							</div>

							<div className="grid gap-2">
								{quarterOptions.map((quarter) => (
									<button
										key={quarter.value}
										type="button"
										disabled={quarter.disabled}
										onClick={() => setQuarterNumber(quarter.value)}
										className={`rounded-md border px-4 py-3 text-left transition ${
											quarterNumber === quarter.value
												? "border-darkbrown bg-light"
												: "bg-white"
										} ${quarter.disabled ? "cursor-not-allowed opacity-40" : "hover:bg-slate-50"}`}
									>
										<div className="text-sm font-semibold text-slate-900">{quarter.label}</div>
										<div className="text-xs text-slate-500">{quarter.helper}</div>
									</button>
								))}
							</div>
						</div>
					) : (
						<div className="space-y-3">
							<Calendar
								mode="single"
								selected={periodAnchor}
								onSelect={handleWeekPick}
								disabled={disableFutureDates}
								className="w-full"
							/>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
