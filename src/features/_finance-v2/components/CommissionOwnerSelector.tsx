"use client";

import { AppSelect } from "@/components/shared/AppSelect";

type OwnerOption = { label: string; value: string };

export function CommissionOwnerSelector({
    ownerOptions,
    selectedOwner,
    setSelectedOwner,
}: {
    ownerOptions: OwnerOption[];
    selectedOwner: string;
    setSelectedOwner: (value: string) => void;
}) {
    return (
        <div className="w-full max-w-sm rounded-md border bg-white p-3">
            <AppSelect
                label="Commission Owner"
                groupLabel="Owners"
                placeholder="Select Owner"
                items={ownerOptions}
                value={selectedOwner}
                onChange={setSelectedOwner}
            />
        </div>
    );
}
