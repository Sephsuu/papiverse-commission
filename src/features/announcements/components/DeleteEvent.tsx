import { ModalTitle } from "@/components/shared/ModalTitle";
import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { EventService } from "@/services/event.service";
import { KPEvent } from "@/types/event";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    toDelete: KPEvent;
    setDelete: React.Dispatch<React.SetStateAction<KPEvent | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteEvent({ toDelete, setDelete, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);

    async function handleDelete() {
        try {
            setProcess(true);
            await EventService.deleteEvent(toDelete.id!);
            toast.success(`Event ${toDelete.title} deleted successfully.`);
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
            setDelete(undefined);
            setReload(prev => !prev);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => { if (!open) setDelete(undefined) }}>
            <DialogContent>
                <ModalTitle 
                    label="Delete"
                    spanLabel={`${toDelete.title}?`}
                    spanLabelClassName="!text-darkred"
                />
                <form 
                    onSubmit={e => {
                        e.preventDefault();
                        handleDelete();
                    }}
                    className="flex justify-end items-center gap-4"
                >
                    <DialogClose>Close</DialogClose>
                    <DeleteButton 
                        type="submit"
                        onProcess={onProcess}
                        label="Delete Event"
                        loadingLabel="Deleting Event"
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}
