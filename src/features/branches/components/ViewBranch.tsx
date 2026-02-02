"use client"

import { ModalTitle } from "@/components/shared/ModalTitle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormLoader } from "@/components/ui/loader";
import { handleChange } from "@/lib/form-handle";
import { formatToPeso } from "@/lib/formatter";
import { DeliveryService } from "@/services/delivery.service";
import { Branch } from "@/types/branch";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

export function ViewBranch({
    toView,
    setReload,
    setView
}: {
    toView: Branch;
    setReload: Dispatch<SetStateAction<boolean>>;
    setView: Dispatch<SetStateAction<Branch | undefined>>;
}) {
    const [onProcess, setProcess] = useState(false);
    const [fee, setFee] = useState<number | "">(toView.deliveryFee!);
    const [toEdit, setEdit] = useState(false);

    async function handleSubmit() {
        try {
            setProcess(true)
            const data = await DeliveryService.updateDeliveryFee(toView.id!, fee === "" ? 0 : fee);
            if (data) {
                toast.success("Delivery fee updated successfully.")
                setReload(prev => !prev)
                setView(undefined)
            }
        } catch (error) {
            toast.error(String(error));
        } finally { setProcess(false) }
    }

    return (
        <Dialog open onOpenChange={(open) => { if (!open) setView(undefined); }}>
            <DialogContent className="max-h-10/11 overflow-y-auto">
                <ModalTitle
                    label="Branch Information"
                    spanLabel={toView.name}
                />

                <div className="space-y-4 text-sm">
                    <div className="rounded-md border p-3">
                        <div className="font-semibold mb-2">Basic Details</div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="font-medium text-gray-600">Branch Code</div>
                            <div>{toView.code}</div>

                            <div className="font-medium text-gray-600">Status</div>
                            <div>{toView.status}</div>

                            <div className="font-medium text-gray-600">Internal</div>
                            <div>{toView.isInternal ? "Yes" : "No"}</div>
                        </div>
                    </div>

                    <div className="flex-center justify-between! rounded-md border bg-slate-50 p-3">
                        <div>
                            <div className="font-medium text-gray-600">Delivery Fee</div>
                            {toEdit ? (
                                <div className="bg-light! flex border border-gray rounded-md w-40">
                                    <input disabled value="₱" className="w-10 text-center" /> 
                                    <Input
                                        type="number"
                                        min="1"
                                        value={fee}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (value === "") {
                                                setFee("");
                                                return;
                                            }

                                            const num = Number(value);
                                                if (!Number.isNaN(num) && num >= 1) {
                                                setFee(num);
                                            }
                                        }}
                                        className="text-lg border-0 pl-2 mx-auto w-full bg-light!"
                                    />
                                </div>
                            ) : (
                                <div>{formatToPeso(toView.deliveryFee!)}</div>
                            )}
                        </div>
                        {toEdit ? (
                            <div className="flex-center-y gap-2">
                                <Button 
                                    onClick={handleSubmit}
                                    size="sm"
                                    className="bg-darkgreen! w-20 hover:opacity-90"
                                    disabled={onProcess}
                                >
                                    <FormLoader onProcess={onProcess} label="Save" loadingLabel="Saving" />
                                </Button>
                                <Button 
                                    onClick={() => setEdit(false)}
                                    size="sm"
                                    variant="secondary"
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <Button 
                                onClick={() => setEdit(true)}
                                size="sm"
                                className="w-20 bg-darkgreen! hover:opacity-90"
                            >
                                Edit
                            </Button>
                        )}
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
