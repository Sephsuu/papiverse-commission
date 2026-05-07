import { AddButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PaymentSettlementService } from "@/services/paymentSettlement.service";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

interface Props {
    setOpen: Dispatch<SetStateAction<boolean>>;
    setReload: Dispatch<SetStateAction<boolean>>;
}

export function CreatePaymentSettlementGroup({ setOpen, setReload }: Props) {
    const [onProcess, setProcess] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [personOne, setPersonOne] = useState("");
    const [personTwo, setPersonTwo] = useState("");

    async function handleSubmit() {
        try {
            setProcess(true);
            const first = personOne.trim();
            const second = personTwo.trim();
            const names = [first, second].filter(Boolean);

            if (!name.trim() || !description.trim() || !first || !second) {
                toast.info("Please fill up all fields.");
                setProcess(false);
                return;
            }

            if (first.toLowerCase() === second.toLowerCase()) {
                toast.info("Person 1 and Person 2 must be different.");
                setProcess(false);
                return;
            }

            const data = await PaymentSettlementService.createSettlementGroup({
                name: name.trim(),
                description: description.trim(),
                personNames: names,
            });

            if (data) {
                toast.success("Settlement group created successfully.");
                setReload((prev) => !prev);
                setOpen(false);
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
                <DialogTitle className="flex items-center gap-2">
                    <Image
                        src="/images/kp_logo.png"
                        alt="KP Logo"
                        width={40}
                        height={40}
                    />
                    <div className="text-xl font-semibold">Create Settlement Group</div>
                </DialogTitle>

                <form
                    className="flex flex-col gap-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="flex flex-col gap-1">
                        <div>Group Name</div>
                        <Input
                            className="border border-gray"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <div>Description</div>
                        <Textarea
                            className="border border-gray"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <div>Person 1</div>
                            <Input
                                className="border border-gray"
                                value={personOne}
                                onChange={(e) => setPersonOne(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div>Person 2</div>
                            <Input
                                className="border border-gray"
                                value={personTwo}
                                onChange={(e) => setPersonTwo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-1 flex justify-end gap-4">
                        <DialogClose className="text-sm">Close</DialogClose>
                        <AddButton
                            type="submit"
                            onProcess={onProcess}
                            label="Create Group"
                            loadingLabel="Creating Group"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
