"use client";

import {
    FormEvent,
    Fragment,
    useEffect,
    useRef,
    useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessagesSkeleton } from "@/components/ui/skeleton";

import {
    EllipsisIcon,
    Info,
    Link as LinkIcon,
    Send,
} from "lucide-react";

import { Claim } from "@/types/claims";
import { Conversation, Message } from "@/types/messaging";

import {
    connectWebSocket,
    disconnectWebSocket,
    sendMessage,
    sendStopTyping,
    sendTyping,
    MessagingService,
    WSMessage, // assumes you have REST methods here (e.g., getMessages)
} from "@/services/messaging.service";
import { AppAvatar } from "@/components/shared/AppAvatar";
import useNotifications from "@/hooks/use-notification";
import { NEXT_URL } from "@/lib/urls";

interface Props {
    claims: Claim;
    selected: Conversation;
}

type TypingUser = { userId: number; name: string };

export function MessagesCanvas({ claims, selected }: Props) {
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!selected) return;

        const fetchMessages = async () => {
            try {
                setLoading(true);
                const data = await MessagingService.getMessages(
                    selected.id,
                    claims.userId
                );
                setMessages(data || []);
            } catch (e) {
                console.error("Failed to load messages:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [selected.id, claims.userId]);

    useEffect(() => {
        if (!selected) return;

        connectWebSocket(
            claims.userId,
            selected.id,
            (newMessage: Message) => {
                setMessages((prev) => [...prev, newMessage]);
            },
            (typingUser: { userId: number }) => {
                if (typingUser.userId === claims.userId) return;

                setTypingUsers((prev) => {
                    if (prev.some((u) => u.userId === typingUser.userId)) {
                        return prev;
                    }

                    const participant =
                        selected.participants.find(
                            (p) => p.id === typingUser.userId
                        ) || null;

                    const name = participant?.firstName || "Someone";
                    return [...prev, { userId: typingUser.userId, name }];
                });
            },
            // onStopTyping
            (stoppedUser: { userId: number }) => {
                setTypingUsers((prev) =>
                    prev.filter((u) => u.userId !== stoppedUser.userId)
                );
            }
        );

        return () => {
            setTypingUsers([]);
            disconnectWebSocket();
        };
    }, [claims.userId, selected.id, selected.participants]);

    // Scroll to bottom on new messages / typing
    useEffect(() => {
        if (!messagesEndRef.current) return;
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages, typingUsers]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMessageInput(value);

        // notify typing
        sendTyping({
            conversationId: selected.id,
            userId: claims.userId,
        });

        // throttle stopTyping
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            sendStopTyping({
                conversationId: selected.id,
                userId: claims.userId,
            });
        }, 2000);
    };

    const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const content = messageInput.trim();
        if (!content) return;

        const msg: WSMessage = {
            id: Date.now(),
            senderId: claims.userId,
            content,
            messageType: "text",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            conversationId: selected.id,
        };

        sendMessage(msg);
        setMessageInput("");

        // Immediately stop typing when message sent
        sendStopTyping({
            conversationId: selected.id,
            userId: claims.userId,
        });
    };

    const renderHeaderTitle = () => {
        if (selected.name !== "none") return selected.name;

        if (selected.participants.length > 2) {
            return selected.participants
                .slice(0, 3)
                .map((p) => p.lastName)
                .join(", ");
        }

        const [first, second] = selected.participants;
        const other =
            first.id !== claims.userId
                ? first
                : second;

        return `${other?.firstName ?? ""} ${other?.lastName ?? ""}`.trim();
    };

    if (loading) return <MessagesSkeleton />;

    return (
        <section className="relative flex flex-col col-span-3 border-1 h-[95vh]">
            {/* Header */}
            <div className="flex px-4 py-2 gap-2 sticky top-0 shadow-sm bg-light z-10">
                <AppAvatar
                    fallback={
                        selected.participants.length === 2 &&
                        selected.participants.find(u => u.id !== claims.userId)?.firstName &&
                        selected.participants.find(u => u.id !== claims.userId)?.lastName
                            ? `${selected.participants.find(u => u.id !== claims.userId)!.firstName?.[0] ?? ""}${
                                selected.participants.find(u => u.id !== claims.userId)!.lastName?.[0] ?? ""
                            }`
                            : "KP"
                    }
                    src={
                        selected.participants.length === 2
                            ? selected.participants.find(u => u.id !== claims.userId)?.imageUrl
                                ? `${NEXT_URL}/${selected.participants.find(u => u.id !== claims.userId)?.imageUrl}`
                                : undefined
                            : "/images/kp_logo.png"
                    }
                />

                <div className="my-auto font-semibold text-sm truncate text-[16px]">
                    {renderHeaderTitle()}
                </div>
                <div className="ms-auto flex gap-2">
                    <button type="button">
                        <Info className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button type="button">
                        <EllipsisIcon className="w-4 h-4" strokeWidth={2} />
                    </button>
                </div>
            </div>

            <div className="flex-col w-full flex-1 bg-white overflow-y-auto pb-13 pt-2 px-2">
                {messages.map((message, index) => {
                    const isOwn = message.senderId === claims.userId;
                    const prev = index > 0 ? messages[index - 1] : null;
                    const showSender =
                        !prev || prev.senderId !== message.senderId;

                    const sender = selected.participants.find(
                        (p) => p.id === message.senderId
                    );

                    return (
                        <Fragment key={message.id ?? index}>
                            
                            {showSender && (
                                <div
                                    className={`text-gray text-[10px] -mb-1.5 ${
                                        isOwn
                                            ? "text-end pr-10"
                                            : "pl-10 text-start"
                                    }`}
                                >
                                    {sender?.firstName}
                                </div>
                            )}

                            {/* ✅ Message Row */}
                            <div
                                className={`flex items-end ${
                                    isOwn ? "justify-end" : "justify-start"
                                } my-2`}
                            >
                                {/* ✅ LEFT AVATAR SPACE (ALWAYS RESERVED) */}
                                {!isOwn && (
                                    <div className="w-8 flex justify-center">
                                        {showSender && (
                                            <AppAvatar
                                                fallback={
                                                    sender?.firstName && sender?.lastName
                                                        ? `${sender.firstName[0]}${sender.lastName[0]}`
                                                        : "KP"
                                                }
                                                src={`${NEXT_URL}/${sender?.imageUrl}`}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* ✅ MESSAGE BUBBLE */}
                                <div
                                    className={`w-fit max-w-[60%] text-xs p-2 ${
                                        isOwn
                                            ? "bg-darkorange text-light mr-2 rounded-t-lg rounded-bl-lg"
                                            : "bg-light ml-2 rounded-t-lg rounded-br-lg"
                                    }`}
                                >
                                    {message.content}
                                </div>

                                {/* ✅ RIGHT AVATAR SPACE (ALWAYS RESERVED) */}
                                {isOwn && (
                                    <div className="w-8 flex justify-center">
                                        {showSender && (
                                            <AppAvatar
                                                fallback={
                                                    sender?.firstName && sender?.lastName
                                                        ? `${sender.firstName[0]}${sender.lastName[0]}`
                                                        : "KP"
                                                }
                                                src={`${NEXT_URL}/${sender?.imageUrl}`}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </Fragment>
                    );
                })}

                {/* ✅ Typing Indicator */}
                {typingUsers.length > 0 && (
                    <div className="w-fit max-w-[60%] text-xs bg-gray-200 p-2 my-2 ml-10 rounded-t-lg rounded-br-lg italic">
                        {typingUsers.map((u) => u.name).join(", ")}{" "}
                        {typingUsers.length === 1 ? "is" : "are"} typing...
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>


            {/* Message input */}
            <form
                className="absolute w-full bottom-0 px-4 border-t-1 bg-white"
                onSubmit={handleSendMessage}
            >
                <div className="flex items-center w-full bg-white py-2 gap-2">
                    <button type="button" className="mx-1">
                        <LinkIcon className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <Input
                        value={messageInput}
                        onChange={handleInputChange}
                        className="w-full border-0 focus:!outline-none focus:!ring-0"
                        placeholder="Enter your message here"
                    />
                    <div className="flex gap-2">
                        {/* <button type="button">
                            <SmilePlus className="w-4 h-4" strokeWidth={2} />
                        </button>
                        <button type="button">
                            <Mic className="w-4 h-4" strokeWidth={2} />
                        </button> */}
                        <Button
                            type="submit"
                            disabled={!messageInput.trim()}
                            size="sm"
                            className="bg-blue rounded-full text-xs h-fit py-1.5"
                        >
                            <Send className="!w-3 !h-3" />
                            Send
                        </Button>
                    </div>
                </div>
            </form>
        </section>
    );
}
