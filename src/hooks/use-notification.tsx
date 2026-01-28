/* eslint-disable @typescript-eslint/no-explicit-any */

import { BASE_URL, WEBSOCKET_URL } from "@/lib/urls";
import { Claim } from "@/types/claims";
import { NotificationResponse } from "@/types/notification";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client, Stomp } from "@stomp/stompjs";

const useNotifications = ({
    claims,
    onNewNotification,
    type
}: {
    claims: Claim;
    onNewNotification?: any;
    type?: string;
}) => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    const stompClientRef = useRef<Client | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(
                `${BASE_URL}/notifications/initial-feed/${claims.userId}/${claims.branch.branchId}`
            );
            const data = await res.json();
            setNotifications(data);
            setUnreadCount(data.filter((n: NotificationResponse) => !n.read).length);
        } catch (err: any) {
            setError(err.message);
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    }, [claims.branch.branchId, claims.userId]);

    const handleNewNotification = useCallback(
        (notification: NotificationResponse) => {
            setNotifications((prev) => [notification, ...prev]);

            if (!notification.read) {
                setUnreadCount((prev) => prev + 1);
            }

            if (onNewNotification) {
                onNewNotification(notification);
            }
        },
        [onNewNotification]
    );

    const markAsRead = useCallback(async (notificationId: number) => {
        try {
            const response = await fetch(`${BASE_URL}/api/notifications/${notificationId}/read`, {
                method: "PUT",
            });
            if (!response.ok) throw new Error("Failed to mark as read");

            setNotifications((prev) =>
                prev.map((n) =>
                    n.notificationId === notificationId ? { ...n, read: true } : n
                )
            );

            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        const unreadNotifications = notifications.filter((n) => !n.read);

        try {
            await Promise.all(
                unreadNotifications.map((n) =>
                    fetch(`/api/notifications/${n.notificationId}/read`, { method: "PUT" })
                )
            );

            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    }, [notifications]);

    const deleteNotification = useCallback(
        async (notificationId: number) => {
            try {
                const response = await fetch(`/api/notifications/${notificationId}`, {
                    method: "DELETE",
                });
                if (!response.ok) throw new Error("Failed to delete notification");

                const wasUnread =
                    notifications.find((n) => n.notificationId === notificationId)?.read ===
                    false;

                setNotifications((prev) =>
                    prev.filter((n) => n.notificationId !== notificationId)
                );

                if (wasUnread) {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }
            } catch (err) {
                console.error("Failed to delete notification:", err);
            }
        },
        [notifications]
    );

    // -----------------------------
    //  WEBSOCKET SETUP WITH STATUS
    // -----------------------------
    useEffect(() => {
        if (!claims.branch.branchId) return;

        fetchNotifications();

        // Create SockJS connection
        const socket = new SockJS(WEBSOCKET_URL!);

        socket.onopen = () => console.log("🟢 SockJS connected");
        socket.onclose = () => {
            console.log("🔴 SockJS closed");
            setIsConnected(false);
        };
        socket.onerror = (err) => console.log("⚠ SockJS error:", err);

        // Create STOMP client on top of SockJS
        const client = Stomp.over(socket);
        client.debug = () => {}; // disable logs

        client.connect(
            {},
            () => {
                console.log("🔥 STOMP Connected!");
                setIsConnected(true);

                // Branch-level subscription
                client.subscribe(
                    `/topic/notifications.branch.${claims.branch.branchId}`,
                    (msg) => handleNewNotification(JSON.parse(msg.body))
                );

                // User-level subscription
                if (claims.userId) {
                    client.subscribe(
                        `/topic/notifications.user.${claims.userId}`,
                        (msg) => handleNewNotification(JSON.parse(msg.body))
                    );
                }

                client.subscribe("/topic/notifications.delete", (msg) => {
                    const { deletedIds } = JSON.parse(msg.body);
                    setNotifications(prev =>
                        prev.filter(n => !deletedIds.includes(n.notificationId))
                    );
                    setFilteredNotifications(prev =>
                        prev.filter(n => !deletedIds.includes(n.notificationId))
                    );
                });

                stompClientRef.current = client;
            },
            (error: any) => {
                console.error("❌ STOMP Connection Error:", error);
                setIsConnected(false);
            }
        );

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                console.log("🛑 STOMP Disconnected");
                setIsConnected(false);
            }
        };
    }, [claims.branch.branchId, claims.userId]);

    useEffect(() => {
        if (!type) {
            setFilteredNotifications([]);
        } else {
            setFilteredNotifications(
                notifications.filter(n => n.type === type)
            );
        }
    }, [notifications, type]);


    return {
        notifications,
        filteredNotifications,
        loading,
        error,
        unreadCount,
        isConnected, // <-- EXPOSE CONNECTION STATUS
        markAsRead,
        markAllAsRead,
        deleteNotification,
    };
};

export default useNotifications;
