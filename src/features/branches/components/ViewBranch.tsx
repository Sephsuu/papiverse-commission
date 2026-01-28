import { ModalTitle } from "@/components/shared/ModalTitle";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Branch } from "@/types/branch";
import { Dispatch, SetStateAction } from "react";

export function ViewBranch({
    toView,
    setView
}: {
    toView: Branch;
    setView: Dispatch<SetStateAction<Branch | undefined>>;
}) {
    return (
        <Dialog open onOpenChange={(open) => { if (!open) setView(undefined); }}>
            <DialogContent className="max-h-10/11 overflow-y-auto">
                <ModalTitle
                    label="Branch Information"
                    spanLabel={toView.branchName}
                />

                <div className="space-y-4 text-sm">
                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Basic Details</div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="font-medium text-gray-600">Branch ID</div>
                            <div>{toView.branchId}</div>

                            <div className="font-medium text-gray-600">Status</div>
                            <div>{toView.branchStatus}</div>

                            <div className="font-medium text-gray-600">Internal</div>
                            <div>{toView.isInternal ? "Yes" : "No"}</div>
                        </div>
                    </div>

                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Location Details</div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="font-medium text-gray-600">Province</div>
                            <div>{toView.province}</div>

                            <div className="font-medium text-gray-600">City</div>
                            <div>{toView.city}</div>

                            <div className="font-medium text-gray-600">Barangay</div>
                            <div>{toView.barangay}</div>

                            <div className="font-medium text-gray-600">Street</div>
                            <div>{toView.streetAddress}</div>

                            <div className="font-medium text-gray-600">Zip Code</div>
                            <div>{toView.zipCode}</div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-5">
                    <DialogClose className="text-sm">Close</DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
}
