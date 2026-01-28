/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { InventoryService } from "@/services/inventory.service";
import { SupplyOrder } from "@/types/supplyOrder";

export function useSupplyOrderApproval(
    selectedOrder: SupplyOrder,
    claims: { branch: { branchId: number } }, // adapt type if you have AuthClaims type
    setReload: React.Dispatch<React.SetStateAction<boolean>>,
) {
    const [onProcess, setProcess] = useState(false);
    console.log('Selected Order', selectedOrder);
    

    function enableSave(meatApproved: boolean, snowApproved: boolean) {
        if (
            meatApproved !== selectedOrder.meatCategory?.isApproved ||
            snowApproved !== selectedOrder.snowfrostCategory?.isApproved
        ) {
            return false;
        }
            return true;
    }

  /** ✅ handles submit flow (approve/reject/pending/to-follow) */
  async function handleSubmit(
    meatApproved: boolean,
    snowApproved: boolean,
    isRejected = false
  ) {
    try {
        setProcess(true);

        if (!selectedOrder) {
            toast.error("No order selected");
            return;
        }

        if (isRejected) {
            await SupplyOrderService.updateOrderStatus(
                selectedOrder.orderId!,
                "REJECTED",
                meatApproved,
                snowApproved
            );
            return toast.success(
                `Order ${selectedOrder.meatCategory!.meatOrderId} and ${selectedOrder.snowfrostCategory!.snowFrostOrderId} updated status to REJECTED`
            );
        }

        if (meatApproved && snowApproved) {
            const orderData = await SupplyOrderService.updateOrderStatus(
                selectedOrder.orderId!,
                "APPROVED",
                meatApproved,
                snowApproved
            );
            const logsData = await InventoryService.createInventoryOrder({
                branchId: claims.branch.branchId,
                type: "OUT",
                source: "ORDER",
                orderId: selectedOrder.orderId,
            });
            if (logsData && orderData) {
                return toast.success(
                    `Order ${selectedOrder.meatCategory!.meatOrderId} and ${selectedOrder.snowfrostCategory!.snowFrostOrderId} updated status to APPROVED`
                );
            }
        }

        if (!meatApproved && !snowApproved) {
            await SupplyOrderService.updateOrderStatus(
                selectedOrder.orderId!,
                "PENDING",
                meatApproved,
                snowApproved
            );
            return toast.success(
                `Order ${selectedOrder.meatCategory!.meatOrderId} and ${selectedOrder.snowfrostCategory!.snowFrostOrderId} updated status to PENDING`
            );
        }

        if (meatApproved || snowApproved) {
                await SupplyOrderService.updateOrderStatus(
                selectedOrder.orderId!,
                "TO_FOLLOW",
                meatApproved,
                snowApproved
            );
            return toast.success(
                `Order ${selectedOrder.meatCategory!.meatOrderId} and ${selectedOrder.snowfrostCategory!.snowFrostOrderId} updated status to TO FOLLOW`
            );
        }
    } catch (error: any) {
        toast.error(error?.message || `${error}`);
    } finally {
        setProcess(false);
        setReload((prev) => !prev);
    }
  }

    return {
        onProcess,
        enableSave,
        handleSubmit,
    };
}
