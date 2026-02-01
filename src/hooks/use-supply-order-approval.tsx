/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SupplyOrderService } from "@/services/supplyOrder.service";
import { InventoryService } from "@/services/inventory.service";
import { SupplyOrder } from "@/types/supplyOrder";

export function useSupplyOrderApproval(
  selectedOrder: SupplyOrder | null,
  claims: { branch: { branchId: number } },
  setReload: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const [onProcess, setProcess] = useState(false);

  const hasBothCategories =
    !!selectedOrder?.meatCategory && !!selectedOrder?.snowfrostCategory;

  function enableSave(meatApproved: boolean, snowApproved: boolean) {
    if (!selectedOrder) return false;

    return (
      meatApproved === selectedOrder.meatCategory?.isApproved &&
      snowApproved === selectedOrder.snowfrostCategory?.isApproved
    );
  }

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

      const orderId = selectedOrder.orderId!;
      let status: "APPROVED" | "PENDING" | "TO_FOLLOW" | "REJECTED";
      let sendApprovals = false;

      /** 🔴 REJECTED */
      if (isRejected) {
        status = "REJECTED";
        sendApprovals = hasBothCategories;
      }
      /** 🟢 APPROVED */
      else if (meatApproved && snowApproved) {
        status = "APPROVED";
        sendApprovals = true;
      }
      /** 🟡 PENDING */
      else if (!meatApproved && !snowApproved) {
        status = "PENDING";
        sendApprovals = true;
      }
      /** 🔵 TO_FOLLOW */
      else {
        status = "TO_FOLLOW";
        sendApprovals = hasBothCategories;
      }

      await SupplyOrderService.updateOrderStatus(
        orderId,
        status,
        sendApprovals ? meatApproved : undefined,
        sendApprovals ? snowApproved : undefined
      );

      /** inventory creation ONLY for approved */
      if (status === "APPROVED") {
        await InventoryService.createInventoryOrder({
          branchId: claims.branch.branchId,
          type: "OUT",
          source: "ORDER",
          orderId,
        });
      }

      toast.success(`Updated status to ${status}`);
    } catch (error: any) {
        if (status === "APPROVED") return
      toast.error(error?.message || String(error));
    } finally {
      setProcess(false);
      setReload(prev => !prev);
    }
  }

  return {
    onProcess,
    enableSave,
    handleSubmit,
  };
}
