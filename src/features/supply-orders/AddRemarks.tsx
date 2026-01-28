import { AddButton } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { Claim } from "@/types/claims";
import { SupplyOrder } from "@/types/supplyOrder";
import { Dialog } from "@radix-ui/react-dialog";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
    claims: Claim;
    order: SupplyOrder;
    setOrder: React.Dispatch<React.SetStateAction<SupplyOrder | undefined>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AddRemarks({ claims, order, setOrder, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [remarks, setRemarks] = useState(order.remarks);

    async function handleSubmit() {
        try {
            setProcess(true);
            const data = await SupplyOrderService.addRemarks(order.orderId!, remarks);
            if (data) toast.success('Remarks added successfully!')
        } catch (error) { toast.error(`${error}`) }
        finally {
            setReload(prev => !prev);
            setOrder(undefined);
        } 
    }

    return(
        <Dialog open onOpenChange={ (open) => { if (!open) { setOrder(undefined) } } }>
            <DialogContent>
                <DialogTitle>{ claims.roles[0] === 'FRANCHISOR' && "Add a" } Remarks</DialogTitle>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={ e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div>
                        <Textarea 
                            value={ remarks ? remarks : claims.roles[0] === "FRANCHISEE" ? "No remarks." : remarks  }
                            className="border-1 border-gray"
                            placeholder="Enter your remarks for this supply order"
                            onChange={(e) => setRemarks(e.target.value)}
                            readOnly={ claims.roles[0] === 'FRANCHISEE' }
                        />
                    </div>
                    {claims.roles[0] === 'FRANCHISOR' && (
                        <div className="flex justify-end gap-4">
                            <DialogClose className="text-sm">Close</DialogClose>
                            <AddButton 
                                type="submit"
                                onProcess={ onProcess }
                                label="Add Remark"
                                loadingLabel="Adding Remark"
                            />
                        </div>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );  
}