export interface NotificationResponse {
    notificationId: number;
    branchId: number | null;
    branchName: string | null;
    recipientId: number | null;
    type: string;
    title: string;
    message: string;
    link: string;
    createdAt: string; 
    read: boolean;
    deleted: boolean;
    metadata: string;
}
