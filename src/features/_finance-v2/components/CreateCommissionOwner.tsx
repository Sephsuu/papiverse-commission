import { ModalTitle } from "@/components/shared/ModalTitle";
import { AddButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { handleChange } from "@/lib/form-handle";
import { CommissionOwnerService } from "@/services/commissionOwner.service";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

export function CreateCommissionOwner({ setOpen, setReload }: {
    setOpen: Dispatch<SetStateAction<boolean>>;
    setReload: Dispatch<SetStateAction<boolean>>;
}) {
    const [onProcess, setProcess] = useState(false);
    const [owner, setOwner] = useState({ name: "" });

    async function handleSubmit() {
        try {
            setProcess(true);

            if (!owner.name.trim()) {
                toast.info("Please fill up all fields!");
                setProcess(false);
                return;
            }

            const data = await CommissionOwnerService.createCommissionOwner({
                name: owner.name.trim(),
            });

            if (data) {
                toast.success(`Commission owner ${owner.name} created successfully.`);
                setReload((prev) => !prev);
                setOpen(!open);
            }
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    return (
        <Dialog open onOpenChange={setOpen}>
            <DialogContent>
                <ModalTitle label="Create Commission Owner" />
                <div className="flex flex-col gap-1">
                    <div>Owner Name</div>
                    <Input
                        className="w-full border border-gray max-md:w-full"
                        name="name"
                        value={owner.name}
                        onChange={(e) => handleChange(e, setOwner)}
                    />
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                    className="mt-2 flex justify-end gap-4"
                >
                    <DialogClose className="text-sm">Close</DialogClose>
                    <AddButton
                        type="submit"
                        onProcess={onProcess}
                        label="Create Owner"
                        loadingLabel="Creating Owner"
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}
