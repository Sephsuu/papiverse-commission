"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Search, User, MessageCircle, Ellipsis, BellRing } from "lucide-react";
import { AppHeader } from "@/components/shared/AppHeader";
import { useFetchData } from "@/hooks/use-fetch-data";
import { InquiryService } from "@/services/inquiry.service";
import { PapiverseLoading, SectionLoading } from "@/components/ui/loader";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { formatDateTime } from "@/lib/formatter";
import { AppRUDSelection } from "@/components/shared/AppRUDSelection";
import { useCrudState } from "@/hooks/use-crud-state";
import { UpdateInquiry } from "./components/UpdateInquiry";
import { AppTabSwitcher } from "@/components/shared/AppTabSwitcher";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import useNotifications from "@/hooks/use-notification";
import { NotificationSheet } from "@/components/shared/NotificationSheet";

const tabs = ["NEW", "RESOLVED", "IN_PROGRESS"];

export function InquiriesPage() {
    const [reload, setReload] = useState(false);
    const [tab, setTab] = useState(tabs[0])
    
    const { claims, loading: authLoading } = useAuth();
    const { data: inquiries, loading: inquiriesLoading } = useFetchData<Inquiry>(
        InquiryService.getInquiriesByStatus,
        [reload],
        [tab]
    )    
    const { setSearch, filteredItems: filtered } = useSearchFilter<Inquiry>(inquiries, ["fullName"]);
    const { toUpdate, setUpdate, showNotif, setShowNotif } = useCrudState<Inquiry>();
    const { filteredNotifications, loading: notifLoading } = useNotifications({ claims, type: "INQUIRY" })

    return (
        <section className="stack-md reveal">
            <AppHeader label="All Inquiries" />
            <div className="flex-center-y justify-between">
                <input
                    className="py-1 pl-3 rounded-md bg-light shadow-xs w-100 max-md:w-full"
                    placeholder="Find an inquiry"
                    onChange={ e => setSearch(e.target.value) }
                />
                <div className="flex-center-y gap-2">
                    <AppTabSwitcher 
                        tabs={ tabs }
                        selectedTab={ tab }
                        setSelectedTab={ setTab }
                    />
                    {filteredNotifications && (
                        <Button 
                            onClick={ () => setShowNotif?.(true) }
                            className="my-auto bg-light shadow-sm border-1 hover:bg-slate-200"
                            size="sm"
                        >   
                            <BellRing className="text-dark" />
                            {filteredNotifications.length > 0 && (
                                <Badge className="bg-darkred">{ filteredNotifications.length }</Badge>
                            )}
                            
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-1 flex-col rounded-2xl border border-slate-100 bg-white/80 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 text-[11px] text-slate-500 md:px-4 md:py-3 md:text-xs">
                    <div className="flex flex-1 items-center gap-2">
                        <span className="font-medium uppercase tracking-wide">Inquiry List</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            {filtered.length} shown
                        </span>
                    </div>
                </div>

                <ScrollArea className="h-[400px] md:h-[480px] px-2 py-2 md:px-3 md:py-3">
                    {filtered.length === 0 ? (
                        <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-xs text-slate-400">
                            <MessageCircle className="h-6 w-6" />
                            <span>No inquiries found.</span>
                        </div>
                    ) : !inquiriesLoading ? (
                        <div className="flex flex-col gap-2 md:gap-3">
                            {filtered.map((inq) => (
                                <div
                                    key={inq.inquiryId}
                                    className="group relative flex flex-col gap-2 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-orange-50/40 px-3 py-3 text-xs shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-[1px] hover:border-orange-200 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] md:px-4 md:py-3"
                                >
                                    <div className="flex flex-col gap-1.5 md:flex-row md:items-start md:justify-between">
                                        <div className="flex flex-col gap-0.5 w-full">
                                            <div className="flex-center-y justify-between gap-2">
                                                <div className="flex flex-col">
                                                    <span className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                                                        <User className="w-5 h-5 text-darkbrown" />
                                                        {inq.fullName}
                                                    </span>
                                                    <span className="m-1.5 flex items-center gap-1 text-xs text-slate-500">
                                                        <Mail className="h-4 w-4 text-slate-400" />
                                                        {inq.email}
                                                    </span>
                                                </div>
                                                <div className="ms-auto">
                                                    <AppRUDSelection 
                                                        icon={Ellipsis}
                                                        className="ms-auto"
                                                        item={ inq }
                                                        setUpdate={ setUpdate }
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 md:text-[11px]">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                                                    <Phone className="h-3 w-3 text-slate-400" />
                                                    {inq.contact}
                                                </span>

                                                {inq.createdAt && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-orange-700">
                                                        {formatDateTime(inq.createdAt)}
                                                    </span>
                                                )}

                                                {inq.status && (
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            inq.status === "NEW"
                                                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                                                : inq.status === "RESOLVED"
                                                                ? "border-slate-200 bg-slate-50 text-slate-500"
                                                                : "border-yellow-600 bg-slate-50 text-yellow-600"
                                                        }
                                                    >
                                                        {inq.status === "NEW"
                                                            ? "New Inquiry"
                                                            : inq.status === "RESOLVED"
                                                            ? "Resolved"
                                                            : "In Progress"}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="my-1 h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />

                                    <div className="relative rounded-xl bg-white/70 px-3 py-2 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-100 group-hover:bg-white group-hover:ring-orange-100">
                                        <span className="absolute -left-1.5 top-2 h-1.5 w-1.5 rounded-full bg-orange-400" />
                                        {inq.message}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <SectionLoading />
                    )}
                </ScrollArea>
            </div>

            {toUpdate && (
                <UpdateInquiry 
                    toUpdate={ toUpdate }
                    setUpdate={ setUpdate }
                    setReload={ setReload }
                />
            )}

            {showNotif && (
                <NotificationSheet
                    notifications={ filteredNotifications }
                    setOpen={ setShowNotif }
                />
            )}
        </section>
    );
}
