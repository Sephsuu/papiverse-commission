import { BASE_URL } from "@/lib/urls";
import { requestData } from "./_config";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

/* ============================
    🔵 TYPES
============================ */

export interface WSMessage {
    id: number;
    senderId: number;
    content: string;
    messageType: string;
    createdAt: string;
    updatedAt: string;
    conversationId: number;
}

export interface TypingDTO {
    conversationId: number;
    userId: number;
}

export interface ConversationUpdate {
    conversationId: number;
    lastMessage?: string;
    updatedAt?: string;
    participants?: number[];
}

/* ============================
    🔵 HTTP API SERVICE
============================ */

const url = `${BASE_URL}/messaging`;

export class MessagingService {
    static async getConversations(id: number) {
        return await requestData(
            `${url}/conversations/${id}?page=1&limit=20`,
            "GET"
        );
    }

    static async getMessages(conversationId: number, userId: number) {
        return await requestData(
            `${url}/conversations/${conversationId}/messages?userId=${userId}&page=1&limit=20`,
            "GET"
        );
    }

    static async createDirectConversation(conversation: {
        name: string;
        type: string;
        participantIds: number[];
    }) {
        return await requestData(
            `${url}/conversations`,
            "POST",
            undefined,
            conversation
        );
    }
}

/* ============================
    🔵 WEBSOCKET CONFIG
============================ */

const SOCKET_URL = process.env.NEXT_PUBLIC_API_WEBSOCKET;

let stompClient: Client;

/* --------------------------
    🔵 Conversation Updates 
-------------------------- */

export const connectConversationUpdates = (
    userId: number,
    onConversationUpdate: (update: ConversationUpdate) => void
) => {
    const client = new Client({
        webSocketFactory: () => new SockJS(SOCKET_URL!),
        reconnectDelay: 5000,
        onConnect: () => {
            client.subscribe(`/topic/user.${userId}.conversations`, (msg) => {
                const update: ConversationUpdate = JSON.parse(msg.body);
                onConversationUpdate(update);
            });
        },
    });

    client.activate();
    return client;
};

/* --------------------------
    🔵 Messaging, Typing, StopTyping
-------------------------- */

export const connectWebSocket = (
    userId: number,
    conversationId: number,
    onMessageReceived?: (message: WSMessage) => void,
    onTyping?: (dto: TypingDTO) => void,
    onStopTyping?: (dto: TypingDTO) => void
) => {
    stompClient = new Client({
        webSocketFactory: () => new SockJS(SOCKET_URL!),
        reconnectDelay: 5000,
        onConnect: () => {
            console.log("✅ Connected to WebSocket");

            /* 💬 MESSAGES */
            stompClient.subscribe(
                `/topic/conversation.${conversationId}`,
                (msg) => {
                    const body: WSMessage = JSON.parse(msg.body);
                    onMessageReceived?.(body);
                }
            );

            /* ✍️ TYPING */
            stompClient.subscribe(
                `/topic/conversation.${conversationId}.typing`,
                (msg) => {
                    const body: TypingDTO = JSON.parse(msg.body);
                    onTyping?.(body);
                }
            );

            /* 🛑 STOP TYPING */
            stompClient.subscribe(
                `/topic/conversation.${conversationId}.stopTyping`,
                (msg) => {
                    const body: TypingDTO = JSON.parse(msg.body);
                    onStopTyping?.(body);
                }
            );
        },

        onStompError: (frame) => {
            console.error("❌ STOMP error:", frame.headers["message"], frame.body);
        },
    });

    stompClient.activate();
};

export const disconnectWebSocket = () => {
    if (stompClient && stompClient.active) {
        stompClient.deactivate();
    }
};

/* --------------------------
    🔵 Publish message events
-------------------------- */

export const sendMessage = (message: WSMessage) => {
    if (stompClient?.connected) {
        stompClient.publish({
            destination: "/app/sendMessage",
            body: JSON.stringify(message),
        });
    }
};

export const sendTyping = (dto: TypingDTO) => {
    if (stompClient?.connected) {
        stompClient.publish({
            destination: "/app/typing",
            body: JSON.stringify(dto),
        });
    }
};

export const sendStopTyping = (dto: TypingDTO) => {
    if (stompClient?.connected) {
        stompClient.publish({
            destination: "/app/stopTyping",
            body: JSON.stringify(dto),
        });
    }
};
