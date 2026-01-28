import { AppAvatar } from "@/components/shared/AppAvatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Announcement } from "@/types/announcement";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { AnnouncementImages } from "./AnnouncementImages";
import { NEXT_URL } from "@/lib/urls";
import { formatCustomDate } from "@/lib/formatter";

export function ViewAnnouncement({ toView, setView }: {
    toView: Announcement;
    setView: Dispatch<SetStateAction<Announcement | undefined>>
}) {
    return (
        <Dialog open onOpenChange={ (open) => { if (!open) setView(undefined) }}>
            <DialogContent className="h-10/11 overflow-y-auto">
                <DialogTitle className="!h-fit">
                    <div className="flex items-center gap-2 px-4">
                        <AppAvatar 
                            className="w-10 h-10"
                            fallback={ `${toView.firstName![0]}${toView.lastName![0]}` } 
                        />
                        <div>
                            <div className="font-semibold">{ `${toView.firstName} ${toView.lastName}` }</div>
                            <div className="text-gray text-xs mt-1">{ toView.branchName }</div>
                        </div>
                    </div>
                    <div className="px-4 text-sm mt-4 font-normal">{ toView.content }</div>
                    <div className="px-2 mt-2">
                        {toView?.announcementImages.map((item, i) => (
                            <img
                                src={`${NEXT_URL}${item}`}
                                className="w-full mt-1"
                                key={ i }
                            />
                        ))}
                    </div>
                    <div className="text-xs text-gray text-end font-normal">{ formatCustomDate(toView.datePosted) }</div>
                </DialogTitle>
            </DialogContent>
        </Dialog>
    )
}