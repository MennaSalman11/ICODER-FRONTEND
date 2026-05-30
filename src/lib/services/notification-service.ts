// src/lib/services/notification-service.ts

import { apiClient } from "./api-client";
import { getUserToken } from "../server-utils";
import { PageResponse } from "../../types/group";
import { NotificationResponse, MessageResponse } from "../../types/notification";

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090/api/v1";

/** PATCH helper — mirrors the apiClient style but for PATCH requests */
async function patch<T>(endpoint: string, body?: unknown): Promise<T> {
    const { token } = await getUserToken();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) throw new Error(`Patch Error: ${response.statusText}`);
    return response.json();
}

export const notificationService = {
    /**
     * GET /notifications
     * Fetch a paginated list of notifications for the current user.
     */
    getNotifications: (
        page = 0,
        size = 10
    ): Promise<PageResponse<NotificationResponse>> =>
        apiClient.get<PageResponse<NotificationResponse>>(
            `/notifications?page=${page}&size=${size}`
        ),

    /**
     * GET /notifications/unread-count
     * Returns the number of unread notifications.
     */
    getUnreadCount: (): Promise<number> =>
        apiClient.get<number>("/notifications/unread-count"),

    /**
     * PATCH /notifications/:id/read
     * Mark a single notification as read.
     */
    markAsRead: (id: number): Promise<MessageResponse> =>
        patch<MessageResponse>(`/notifications/${id}/read`),

    /**
     * PATCH /notifications/read-all
     * Mark all notifications as read.
     */
    markAllAsRead: (): Promise<MessageResponse> =>
        patch<MessageResponse>("/notifications/read-all"),

    /**
     * DELETE /notifications/read
     * Delete all read notifications for the current user.
     */
    deleteReadNotifications: (): Promise<MessageResponse> =>
        apiClient.delete<MessageResponse>("/notifications/read"),
};
