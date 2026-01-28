import { User } from "./user";

export interface Conversation {
    id: number;
    type: string;
    name: string;
    updatedAt: string,
    updated_message: string,
    updatedMessage: string,
    participants: User[];
}

export interface Message {
    id?: number | string;
    tempId?: string;
    senderId: number;
    content: string;
    messageType: string;
    createdAt: string;
    updatedAt: string;
    parentMessage?: number | null;
    conversationId?: number;
    isOptimistic?: boolean
}