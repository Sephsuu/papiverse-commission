import { ModalTitle } from "@/components/shared/ModalTitle";
import { UpdateButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { ModalLoader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { InquiryService } from "@/services/inquiry.service";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

const statuses = [
    { value: "NEW", label: "NEW" },
    { value: "RESOLVED", label: "RESOLVED" },
    { value: "IN_PROGRESS", label: "IN PROGRESS" },
]

export function UpdateInquiry({ toUpdate, setUpdate, setReload }: {
    toUpdate: Inquiry;
    setUpdate: Dispatch<SetStateAction<Inquiry | undefined>>
    setReload: Dispatch<SetStateAction<boolean>>
}) {
    const { claims, loading: authLoading } = useAuth();
    const [onProcess, setProcess] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

    async function handleSubmit() {
        try {
            setProcess(true)
            if (!selectedStatus) return toast.info("Please select status to update")
            const data = await InquiryService.updateInquiryStatus(toUpdate.inquiryId, selectedStatus, claims.userId);
            if (data) {
                toast.success("Inquiry status updated successfully")
                setReload(prev => !prev)
                setUpdate(undefined)
            }
        } catch (error) {
            toast.error(`${error}`)
        } finally {
            setProcess(false);
        }
    }

    if (authLoading) return <ModalLoader />
    return (
        <Dialog open onOpenChange={ (open) => { if (!open) setUpdate(undefined) }}>
            <DialogContent>
                <ModalTitle label="Update Inquiry Status" />
                <div className="space-y-4">
                    <div className="font-bold scale-x-105 origin-left text-center">Select Updated Status</div>
                    <div className="flex-center gap-2">
                        {statuses.map((item) => (
                            <button
                                disabled={ toUpdate.status === item.value }
                                key={ item.value }
                                onClick={ () => setSelectedStatus(item.value) }
                                className={`border-[1.5px] bg-light border-darkbrown hover:shadow-sm hover:shadow-darkbrown rounded-md py-2 px-4 disabled:opacity-50 ${selectedStatus === item.value && "!bg-darkbrown text-white font-semibold"}`}
                            >
                                { item.label }
                            </button>
                        ))}
                    </div>
                </div>
                <form 
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                    className="flex justify-end gap-4 mt-4"
                >
                    <DialogClose className="text-sm">Close</DialogClose>
                    <UpdateButton 
                        type="submit"
                        onProcess={ onProcess }
                        label="Update Status"
                        loadingLabel="Update Status"
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}