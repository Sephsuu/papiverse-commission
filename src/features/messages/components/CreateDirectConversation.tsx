import { AppAvatar } from "@/components/shared/AppAvatar";
import { ModalTitle } from "@/components/shared/ModalTitle";
import { AddButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MessagingService } from "@/services/messaging.service";
import { Claim } from "@/types/claims";
import { Conversation } from "@/types/messaging";
import { User } from "@/types/user";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

function pairExists(list: number[][], x: number, y: number) {
    return list.some(([a, b]) =>
        (a === x && b === y) || (a === y && b === x)
    );
}

export function CreateDirectConversation({ setOpen, users, claims, conversations, setReload }: {
    users: User[];
    setOpen: (i: boolean) => void;
    claims: Claim;
    conversations: Conversation[];
    setReload: Dispatch<SetStateAction<boolean>>
}) {
    console.log(conversations);
    const convoParticipants: number[][] = conversations
        .filter(item => item.participants.length === 2)
        .map(item =>
            item.participants
            .map(p => p.id)
            .filter((id): id is number => id !== undefined)
        );
    const [onProcess, setProcess] = useState(false)
    const [selectedConvo, setSelectedConvo] = useState<number | undefined>(undefined); 

    async function handleSubmit() {
        try {
            setProcess(true)
            if (pairExists(convoParticipants, selectedConvo!, claims.userId)) toast.error('Pair exists')
            else {
                const data = await MessagingService.createDirectConversation({
                    type: "direct",
                    name: "none",
                    participantIds: [selectedConvo!, claims.userId]
                });
                if (data) {
                    toast.success("You can now message the selected user.")
                    setReload(prev => !prev)
                    setOpen(!open)
                }
            }
        } catch (error) { toast.error(`${error}`) }
        finally { setProcess(false) }
    }

    return (
        <Dialog open onOpenChange={ setOpen }>
            <DialogContent className="max-h-10/11 overflow-y-auto pb-0">
                <ModalTitle label="Create Direct Conversation" />
                <div className="space-y-4">
                    <div className="font-semibold sticky top-0">Select A User To Message</div>
                    <div className="space-x-4 space-y-2">
                        {users.map((item) => (
                            <button 
                                onClick={ () => setSelectedConvo(item.id) }
                                className={`flex-center-y gap-2 bg-slate-50 rounded-md shadow-sm p-4 w-full ${selectedConvo === item.id && "!bg-orange-100"}`}
                                key={item.id}
                            >
                                <AppAvatar fallback="KP" />
                                <div className="text-start">
                                    <div className="font-semibold text-sm">{ item.firstName } { item.lastName }</div>
                                    <div className="text-xs text-gray">{ item.branch?.branchName }</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                    className="sticky bottom-0 flex justify-end gap-4 bg-white pt-4 pb-8"
                >
                    <DialogClose className="text-sm">Close</DialogClose>
                    <AddButton
                        type="submit"
                        onProcess={onProcess}
                        label="Create Convo"
                        loadingLabel="Creating Convo"
                    />
                </form>
            </DialogContent>
        </Dialog>
    )
}