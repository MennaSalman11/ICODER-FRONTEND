"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Bell,
    CheckCheck,
    Trash2,
    Loader2,
    ChevronDown,
    InboxIcon,
} from "lucide-react";
import { notificationService } from "../../lib/services/notification-service";
import { NotificationResponse } from "../../types/notification";

// ─── Date Formatter (Fixed to support both camelCase and snake_case safely) ───

function formatDate(iso: string | null | undefined): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
}

// ─── Notification Type Badge ──────────────────────────────────────────────────

function typeBadgeClass(type: string): string {
    switch (type?.toLowerCase()) {
        case "contest":
            return "bg-purple-100 text-purple-700";
        case "group":
            return "bg-green-100 text-green-700";
        case "submission":
            return "bg-blue-100 text-blue-700";
        case "system":
            return "bg-slate-100 text-slate-600";
        default:
            return "bg-slate-100 text-slate-500";
    }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
    const router = useRouter();

    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [page, setPage] = useState(0);
    const [isLast, setIsLast] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const [clearingRead, setClearingRead] = useState(false);

    // ── Initial Fetch ──────────────────────────────────────────────────────────
    useEffect(() => {
        setInitialLoading(true);
        notificationService
            .getNotifications(0, 10)
            .then((res) => {
                setNotifications(res.content);
                setIsLast(res.last);
                setPage(0);
            })
            .catch(() => { })
            .finally(() => setInitialLoading(false));
    }, []);

    // ── Load More ──────────────────────────────────────────────────────────────
    const handleLoadMore = useCallback(async () => {
        const nextPage = page + 1;
        setLoadingMore(true);
        try {
            const res = await notificationService.getNotifications(nextPage, 10);
            setNotifications((prev) => [...prev, ...res.content]);
            setIsLast(res.last);
            setPage(nextPage);
        } catch {
            //
        } finally {
            setLoadingMore(false);
        }
    }, [page]);

    // ── Mark All as Read ───────────────────────────────────────────────────────
    const handleMarkAllAsRead = useCallback(async () => {
        setMarkingAll(true);
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch {
            //
        } finally {
            setMarkingAll(false);
        }
    }, []);

    // ── Clear Read ─────────────────────────────────────────────────────────────
    const handleClearRead = useCallback(async () => {
        setClearingRead(true);
        try {
            await notificationService.deleteReadNotifications();
            setNotifications((prev) => prev.filter((n) => !n.read));
        } catch {
            //
        } finally {
            setClearingRead(false);
        }
    }, []);

    // ── Item Click (Fixed dynamic token parsing & safe frontend routing) ───────
    const handleItemClick = useCallback(
        async (notification: NotificationResponse) => {
            // 1. Mark as read first
            if (!notification.read) {
                try {
                    await notificationService.markAsRead(notification.id);
                    setNotifications((prev) =>
                        prev.map((n) =>
                            n.id === notification.id ? { ...n, read: true } : n
                        )
                    );
                } catch {
                    //
                }
            }

            if (!notification.action_url) return;

            // 2. Try to extract token using dynamic safe checks
            try {
                // If it's a relative URL or partial path, pass window.location.origin to prevent crash
                const targetUrl = notification.action_url.startsWith('http') 
                    ? notification.action_url 
                    : `${window.location.origin}${notification.action_url.startsWith('/') ? '' : '/'}${notification.action_url}`;
                
                const url = new URL(targetUrl);
                const token = url.searchParams.get("token");
                if (token) {
                    router.push(`/groups/invite?token=${encodeURIComponent(token)}`);
                    return;
                }
            } catch (e) {
                // Fallback Regex if URL parsing fails for any reason
                const match = notification.action_url.match(/[?&]token=([^&]+)/);
                if (match?.[1]) {
                    router.push(`/groups/invite?token=${encodeURIComponent(match[1])}`);
                    return;
                }
            }

            // 3. Fallback to normal navigation if no token found
            console.log("[Notification] Standard action_url:", notification.action_url);
            router.push(notification.action_url);
        },
        [router]
    );

    const unreadCount = notifications.filter((n) => !n.read).length;

    // ── Render (Unchanged UI Structure) ────────────────────────────────────────
    return (
        <main className="min-h-screen bg-slate-50 pt-20 pb-16">
            <div className="max-w-2xl mx-auto px-4">

                {/* ── Page Header ── */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Bell size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 leading-none">
                                Notifications
                            </h1>
                            {unreadCount > 0 && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {unreadCount} unread
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleMarkAllAsRead}
                            disabled={markingAll || notifications.every((n) => n.read)}
                            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                        >
                            {markingAll ? (
                                <Loader2 size={13} className="animate-spin" />
                            ) : (
                                <CheckCheck size={13} />
                            )}
                            Mark all read
                        </button>

                        <button
                            onClick={handleClearRead}
                            disabled={clearingRead || notifications.every((n) => !n.read)}
                            className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                        >
                            {clearingRead ? (
                                <Loader2 size={13} className="animate-spin" />
                            ) : (
                                <Trash2 size={13} />
                            )}
                            Clear read
                        </button>
                    </div>
                </div>

                {/* ── Notification List ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                    {/* Initial Loading Skeleton */}
                    {initialLoading && (
                        <div className="divide-y divide-slate-50">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-start gap-4 px-5 py-4 animate-pulse">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3.5 bg-slate-100 rounded w-4/5" />
                                        <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                                    </div>
                                    <div className="h-5 w-16 bg-slate-100 rounded-full" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!initialLoading && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                            <InboxIcon size={48} className="opacity-25" />
                            <div className="text-center">
                                <p className="font-semibold text-slate-500">All caught up!</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    No notifications yet. Check back later.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Notification Items */}
                    {!initialLoading && notifications.length > 0 && (
                        <ul className="divide-y divide-slate-50">
                            {notifications.map((notification) => (
                                <li key={notification.id}>
                                    <button
                                        onClick={() => handleItemClick(notification)}
                                        className={`w-full text-left flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80 group ${!notification.read ? "bg-blue-50/50" : "bg-white"
                                            }`}
                                    >
                                        {/* Unread Dot */}
                                        <span
                                            className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${!notification.read
                                                ? "bg-blue-500"
                                                : "bg-slate-200 group-hover:bg-slate-300"
                                                }`}
                                        />

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm leading-snug ${!notification.read
                                                    ? "text-slate-800 font-medium"
                                                    : "text-slate-600"
                                                    }`}
                                            >
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {formatDate(
                                                    notification.createdAt || 
                                                    (notification as unknown as Record<string, string>).created_at
                                                )}
                                            </p>
                                        </div>

                                        {/* Type Badge */}
                                        <span
                                            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${typeBadgeClass(
                                                notification.type
                                            )}`}
                                        >
                                            {notification.type ?? "info"}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* ── Load More ── */}
                    {!initialLoading && !isLast && notifications.length > 0 && (
                        <div className="px-5 py-4 border-t border-slate-50">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-xl hover:bg-slate-50 transition"
                            >
                                {loadingMore ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <ChevronDown size={16} />
                                )}
                                {loadingMore ? "Loading…" : "Load more"}
                            </button>
                        </div>
                    )}
                </div>

                {/* End-of-list message */}
                {!initialLoading && isLast && notifications.length > 0 && (
                    <p className="text-center text-xs text-slate-400 mt-6">
                        You&apos;ve reached the end of your notifications.
                    </p>
                )}
            </div>
        </main>
    );
}