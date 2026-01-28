import { ModalTitle } from "@/components/shared/ModalTitle";
import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { AnnouncementService } from "@/services/announcement.service";
import { Announcement } from "@/types/announcement";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    toDelete: Announcement;
    setDelete: React.Dispatch<React.SetStateAction<Announcement | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteAnnouncement({ toDelete, setDelete, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);

    async function handleDelete() {
        try {
            setProcess(true);
            await AnnouncementService.deleteAnnouncement(toDelete.announcementId!);
            toast.success(`Announcement deleted successfully.`)
        } catch (error) { toast.error(`${error}`) }
        finally { 
            setProcess(false); 
            setDelete(undefined);
            setReload(prev => !prev); 
        }
    }

    return(
        <Dialog open={ !!toDelete } onOpenChange={ (open) => { if (!open) setDelete(undefined) } }>
            <DialogContent>
                <ModalTitle 
                    label="Delete" 
                    spanLabel={ `Announcement?` } 
                    spanLabelClassName="!text-darkred"
                />
                    <form 
                        className="flex justify-end items-center gap-4"
                        onSubmit={ e => {
                            e.preventDefault();
                            handleDelete();
                        }}
                    >
                        <DialogClose>Close</DialogClose>
                        <DeleteButton 
                            type="submit"
                            onProcess={ onProcess }
                            label="Delete Post"
                            loadingLabel="Deleting Post"
                        />
                    </form>
            </DialogContent>
        </Dialog>
    );
}