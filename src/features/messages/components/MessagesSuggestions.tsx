"use client"

import { MessagingService } from "@/services/messaging.service";
import { Conversation } from "@/types/messaging";
import { User } from "@/types/user";
import { Send } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

interface Props {
    userId: number;
    conversations: Conversation[];
    setRealod: Dispatch<SetStateAction<boolean>>
}

export default function MessagesSuggestions({ userId, conversations, setRealod }: Props) {
    const allParticipantIds = conversations.filter(i => i.type === 'direct').flatMap(conv => conv.participants);
    const participantIdSet = new Set(allParticipantIds);
    // const usersNotInConversations = users.filter(user => !participantIdSet.has(user.id!) && userId !== user.id);
    
    async function handleCreateConversation(otherUser: User) {
        try {
            const data = await MessagingService.createDirectConversation({
                name: 'none',
                type: 'direct',
                participantIds: [userId, otherUser.id!]
            })
            if (data) {  toast.success(`Created new chat with ${otherUser.firstName}`) }
        } catch (error) { toast.error(`${error}`) }
    }
    return(
        <section>
            <div className="fle flex-col">
                <div className="p-4">
                    <div className="text-lg font-semibold">Suggestions</div>
                    <div>
                        {/* {usersNotInConversations.map((item, index) => (
                            <div 
                                key={ index }
                                className="flex items-center gap-1 bg-white shadow-sm my-1 p-2 rounded-md"
                            >
                                <div className="w-8 h-8 text-light rounded-full bg-darkbrown flex font-semibold justify-center items-center p-2">
                                    KP
                                </div>
                                <div>
                                    <div className="text-xs font-semibold truncate">{ `${item.firstName} ${item.lastName}` }</div>
                                    <div className="text-[10px] text-gray truncate">{ item.branch?.branchName }</div>
                                </div>
                                <button
                                    onClick={ () => handleCreateConversation(item) }
                                    className="ms-auto bg-blue rounded-sm p-1"
                                >
                                    <Send className="w-2.5 h-2.5 text-light" />
                                </button>
                            </div>
                        ))} */}
                    </div>
                </div>
            </div>
         
        </section>
    );
}