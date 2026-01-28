import { io, Socket } from "socket.io-client";
import { MESSAGING_URL } from "./urls";

let socket: Socket | null = null;

export const getMessagesSocket = (userId: number, conversationId?: number): Socket => {
    if (!socket) {
        socket = io(MESSAGING_URL, {
            transports: ["websocket"],
            query: {
                conversationId,
                userId
            }
        })
    }
    return socket;
}