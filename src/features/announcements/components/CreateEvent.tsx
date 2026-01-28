import { ModalTitle } from "@/components/shared/ModalTitle";
import { AddButton, Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ModalLoader } from "@/components/ui/loader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { handleChange } from "@/lib/form-handle";
import { cn, hasEmptyField, updateField } from "@/lib/utils";
import { EventService } from "@/services/event.service";
import { KPEvent } from "@/types/event";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

export function CreateEvent({
    setOpen,
    setReload,
    selectedDay
}: {
    setOpen: (i: boolean) => void
    setReload: Dispatch<SetStateAction<boolean>>
    selectedDay: string
}) {
    const { claims, loading: authLoading } = useAuth();
    const [onProcess, setProcess] = useState(false);

    const [event, setEvent] = useState<Partial<KPEvent>>({
        title: "",
        description: "",
        date: selectedDay,
        time: "",
        createdBy: claims.userId
    });

    const [date, setDate] = useState<Date | undefined>(undefined);
    const [dateOpen, setDateOpen] = useState(false);

    useEffect(() => {
        if (!selectedDay) return;
        setDate(new Date(selectedDay + "T00:00:00"));
    }, [selectedDay]);


    useEffect(() => {
        if (!date) return;
        const formatted = format(date, "yyyy-MM-dd");
        updateField(setEvent, "date", formatted);
    }, [date]);

    async function handleSubmit() {
        try {
            setProcess(true)
            if (hasEmptyField(event)) return toast.info('Please fill up all fields')
            const data = await EventService.createEvent(event);
            if (data) {
                toast.success("Event created successfully")
                setReload(prev => !prev)
                setOpen(false)
            }
        } catch (error) {
            toast.error(`${error}`)
        } finally {
            setProcess(false)
        }
    }

    if (authLoading) return <ModalLoader />
    return (
        <Dialog open onOpenChange={setOpen}>
            <DialogContent>
                <ModalTitle label="Create an Event" />

                <form 
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                    className="space-y-4"
                >
                    <div className="flex flex-col gap-1">
                        <div>Event Title</div>
                        <Input
                            className="w-full border-1 border-gray rounded-md max-md:w-full"
                            value={event.title}
                            onChange={(e) =>
                                updateField(setEvent, "title", e.target.value)
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <div>Description</div>
                        <Textarea
                            className="w-full border-1 border-gray h-20 rounded-md max-md:w-full"
                            placeholder="Enter description here..."
                            value={event.description}
                            onChange={(e) =>
                                updateField(setEvent, "description", e.target.value)
                            }
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="flex flex-col gap-1 w-full">
                            <div>Event Date</div>

                            <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "justify-start text-left font-normal border-1 border-gray",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Event Date</span>}
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
                            </Popover>

                            <input
                                type="hidden"
                                name="date"
                                value={event.date}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <div>Event Time</div>
                            <Input
                                className="w-full border-1 border-gray rounded-md max-md:w-full"
                                type="time"
                                value={event.time}
                                onChange={(e) =>
                                    updateField(setEvent, "time", e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <AddButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Create Event"
                            loadingLabel="Creating Event"
                        />
                    </div>
                    
                </form>
            </DialogContent>
        </Dialog>
    );
}
