// src/types/notification.ts

export interface NotificationResponse {
    id: number;
    message: string;
    type: string;
    read: boolean;
    created_at: string;
    reference_id?: number;
    action_url?: string;
}

export interface MessageResponse {
    message: string;
}
