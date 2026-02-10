import { NotificationResponse } from "@/types/notification";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Dispatch, SetStateAction, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { NotificationService } from "@/services/notification.service";
import { BellOff } from "lucide-react";

export function NotificationSheet({ setOpen, notifications }: {
    setOpen: Dispatch<SetStateAction<boolean>>
    notifications: NotificationResponse[];
}) {
    const [onProcess, setProcess] = useState(false);
    const [toDelete, setDelete] = useState<number[]>([]);

    async function handleDelete() {
        try {
            setProcess(true);
            const data = await NotificationService.bulkDelete({ toDelete: toDelete });
            if (data) {
                toast.success("Notification read successfully.");
            }
        } catch (error) { 
            toast.error(`${error}`); 
        }
        finally { 
            setProcess(false); 
        }
    }

    const isEmpty = notifications.length === 0;

    return (
        <Sheet open onOpenChange={ setOpen }>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>

                {/* Toolbar */}
                <div className="flex-center-y gap-2 ml-4 max-sm:grid! max-sm:mx-4">
                    <div
                        className="flex-center-y gap-2 border border-slate-300 w-fit px-4 py-2 shadow-sm rounded-md text-sm max-sm:w-full"
                    >
                        <Checkbox 
                            disabled={isEmpty}
                            checked={toDelete.length === notifications.length && notifications.length > 0}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setDelete(notifications.map(n => n.notificationId));
                                } else {
                                    setDelete([]);
                                }
                            }}
                            className="bg-white border-slate-500"
                        />
                        <div>Select All</div>
                    </div>

                    <Button
                        onClick={ handleDelete }
                        disabled={ toDelete.length === 0 || onProcess || isEmpty }
                        className="w-fit bg-darkgreen! hover:opacity-90 max-sm:w-full"
                    >
                        {notifications.length === toDelete.length && !isEmpty
                            ? "Mark all as read"
                            : "Mark selected as read"}
                    </Button>
                </div>

                {/* 👇 Empty State */}
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center text-slate-500">
                        <BellOff className="w-12 h-12 mb-3 opacity-40" />
                        <p className="text-sm">No notifications to display.</p>
                    </div>
                ) : (
                    <ScrollArea className="flex flex-col px-4 h-full pb-35">
                        {notifications.map((item) => (
                            <div
                                key={item.notificationId}
                                className="
                                    relative w-full my-2 max-w-sm rounded-xl border shadow-sm bg-slate-50 
                                    hover:shadow-md transition-all duration-200 overflow-hidden
                                "
                            >
                                {/* Checkbox */}
                                <div className="absolute top-3 right-3 z-20">
                                    <Checkbox
                                        checked={ toDelete.includes(item.notificationId) }
                                        onCheckedChange={(checked) => {
                                            setDelete((prev) => {
                                                if (checked) {
                                                    return [...prev, item.notificationId];
                                                } else {
                                                    return prev.filter(id => id !== item.notificationId);
                                                }
                                            });
                                        }}
                                        className="w-5 h-5 bg-white"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-1">
                                    <h3 className="text-sm font-semibold">{item.title}</h3>
                                    <p className="text-xs text-slate-600">{item.message}</p>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                )}

            </SheetContent>
        </Sheet>
    );
}
