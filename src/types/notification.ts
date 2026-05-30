// src/types/notification.ts

export interface NotificationResponse {
    id: number;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
    referenceId?: number;
    action_url?: string;
}

export interface MessageResponse {
    message: string;
}
