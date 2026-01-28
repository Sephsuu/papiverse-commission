"use client";

import { NotificationResponse } from "@/types/notification";
import Link from "next/link";
import { format } from "date-fns";
import { BellOff, Megaphone } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationSection({
    notifications,
    unreadCount
}: {
    notifications: NotificationResponse[];
    unreadCount?: number;
}) {

    const isEmpty = !notifications || notifications.length === 0;

    return (
        <section className="p-4 h-screen">
            <div className="font-semibold text-lg">Notifications</div>
            {/* 🔥 Fallback */}
            {isEmpty && (
                <div className="flex flex-col items-center justify-center h-[70vh] text-center text-slate-500">
                    <BellOff className="w-12 h-12 mb-3 opacity-40" />
                    <p className="text-sm">No notifications yet.</p>
                </div>
            )}

            {!isEmpty && (
                <ScrollArea className="h-full pr-2">
                    {notifications.map((notif, i) => (
                        <Link
                            key={i}
                            href={notif.link}
                            className="flex gap-3 p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all my-2"
                        >
                            {/* Icon */}
                            <div className="mt-1">
                                {notif.type === "ANNOUNCEMENT" && (
                                    <Megaphone className="w-5 h-5 text-blue-600" />
                                )}
                                {notif.type === "SUPPLY ORDER" && (
                                    <Megaphone className="w-5 h-5 text-yellow-600" />
                                )}
                                {notif.type === "PRODUCT" && (
                                    <Megaphone className="w-5 h-5 text-green-600" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-900">
                                    {notif.title}
                                </div>

                                <div className="text-xs text-gray-600 line-clamp-2">
                                    {notif.message}
                                </div>

                                <div className="text-xs text-gray-400 mt-1">
                                    {format(new Date(notif.createdAt), "MMM dd, yyyy • hh:mm a")}
                                </div>
                            </div>

                        </Link>
                    ))}
                </ScrollArea>
            )}
        </section>
    );
}
