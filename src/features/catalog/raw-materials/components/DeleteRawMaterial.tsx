import { ModalTitle } from "@/components/shared/ModalTitle";
import { DeleteButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { RawMaterialService } from "@/services/rawMaterial.service";
import { Supply } from "@/types/supply";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    toDelete: Supply;
    setDelete: React.Dispatch<React.SetStateAction<Supply | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteRawMaterial({ toDelete, setDelete, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        try {
            setProcess(true);
            await RawMaterialService.deleteRawMaterial(toDelete.sku!);
            toast.success(`Raw material ${toDelete.name} deleted successfully.`);
            setReload(prev => !prev)
            setDelete(undefined);
            router.refresh();
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => { if (!open) setDelete(undefined) }}>
            <DialogContent>
                <ModalTitle
                    label="Delete"
                    spanLabel={`${toDelete.name}?`}
                    spanLabelClassName="!text-darkred"
                />
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleDelete();
                    }}
                    className="flex justify-end items-center gap-4"
                >
                    <DialogClose>Close</DialogClose>
                    <DeleteButton
                        type="submit"
                        onProcess={onProcess}
                        label="Delete Raw Material"
                        loadingLabel="Deleting Raw Material"
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}
