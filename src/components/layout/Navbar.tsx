"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  User,
  ChevronDown,
  Bell,
  FileText,
  Trophy,
  BarChart2,
  Users,
  Settings,
  LogOut,
  Trash2,
  CheckCheck,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import { notificationService } from "../../lib/services/notification-service";
import { NotificationResponse } from "../../types/notification";
import { getProfilePicture } from "@/src/lib/services/profile.services";
// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ─── Notification Dropdown ───────────────────────────────────────────────────

const NotificationDropdown: React.FC = () => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    notificationService
      .getNotifications(0, 5)
      .then((page) => setNotifications(page.content))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { }
  }, []);

  const handleDeleteRead = useCallback(async () => {
    try {
      await notificationService.deleteReadNotifications();
      setNotifications((prev) => prev.filter((n) => !n.read));
    } catch { }
  }, []);

 const handleItemClick = useCallback(
  async (notification: NotificationResponse) => {
    // 1. لو الإشعار مش مقروء، نحدثه في الباكند والـ State أولاً
    if (!notification.read) {
      try {
        // نبلغ الباكند فوراً
        await notificationService.markAsRead(notification.id);
        
        // نحدث القائمة المحلية عشان لو رجعنا نلاقي النقطة الزرقاء اختفت
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        
        // ننقص عداد الإشعارات غير المقروءة بمقدار 1
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // 2. نقفل الـ Dropdown عشان لما يرجع يلاقي الشاشة نظيفة
    setIsOpen(false);

    // 3. التوجيه الفعلي للرابط
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  },
  [router]
);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((o) => !o)}
        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full border-2 border-white px-0.5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
              <button
                onClick={handleDeleteRead}
                title="Clear read notifications"
                className="text-slate-400 hover:text-red-500 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              /* Skeleton loader */
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="h-2 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <Bell size={28} className="opacity-30" />
                <p className="text-xs">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleItemClick(notification)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50 ${!notification.read ? "bg-blue-50/50" : "bg-white"
                    }`}
                >
                  {/* Unread dot */}
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notification.read ? "bg-blue-500" : "bg-transparent"
                      }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-slate-700 leading-snug line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-2.5 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
            >
              View All Notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Navbar ─────────────────────────────────────────────────────────────────

const Navbar = () => {
  const { data: session, status } = useSession();
  const [userImage, setUserImage] = useState<string | null>(null);
 const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  useEffect(() => {
  const fetchUserImage = async () => {
    const handle = session?.user?.handle;

    if (!handle) return;

    const res = await getProfilePicture(handle);

    console.log("Navbar Picture:", res.data);

    if (res.ok && res.data?.picture_url) {
      setUserImage(res.data.picture_url);
    }
  };

  if (status === "authenticated") {
    fetchUserImage();
  }
}, [status, session]);

  return (
   <header className={`fixed top-0 left-0 w-full z-50 border-b transition-colors ${
      isAuthPage 
        ? "bg-transparent border-transparent"  // ← شفاف في اللوجن
        : "bg-white border-slate-100"           // ← أبيض في باقي الصفحات
    }`}>      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Left Side: Logo & Main Nav */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            {/* Logo Wrapper */}
            <div className="flex items-center gap-1.5">
               {/* <div className="w-5 h-7 bg-[#1e3a8a] rounded-[2px] relative overflow-hidden">
                  <div className="absolute bottom-0 w-full h-1/2 bg-[#ef4444]"></div>
               </div> */}
<span className={`text-2xl font-bold tracking-tight ${
  isAuthPage ? "text-white" : "text-[#0f172a]"
}`}>ICoder</span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          {status === "authenticated" && (
            <nav className="hidden md:flex items-center gap-7">
              <Link href="/problems" className="text-slate-500 hover:text-blue-600 font-medium transition text-[14px] flex items-center gap-2">
                <FileText size={18} className="text-slate-400" /> Problems
              </Link>
              <Link href="/contests" className="text-slate-500 hover:text-blue-600 font-medium transition text-[14px] flex items-center gap-2">
                <Trophy size={18} className="text-slate-400" /> Contests
              </Link>
              <Link href="/submissions" className="text-slate-500 hover:text-blue-600 font-medium transition text-[14px] flex items-center gap-2">
                <BarChart2 size={18} className="text-slate-400" /> Submissions
              </Link>
              <Link href="/groups" className="text-slate-500 hover:text-blue-600 font-medium transition text-[14px] flex items-center gap-2">
                <Users size={18} className="text-slate-400" /> Groups
              </Link>
            </nav>
          )}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3">
          {status === "unauthenticated" ? (
            <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className={isAuthPage ? "text-white font-semibold" : "text-slate-600 font-semibold"}>
  <Link href="/login">Login</Link>
</Button>

<Button asChild className={isAuthPage 
  ? "bg-orange-500 hover:bg-orange-600 text-white px-5 rounded-lg font-semibold" 
  : "bg-[#1e3a8a] hover:bg-blue-800 text-white px-5 rounded-lg font-semibold shadow-sm"
}>
  <Link href="/register">Sign Up</Link>
</Button>
            </div>
          ) : status === "authenticated" ? (
            <div className="flex items-center gap-4">
              {/* Notification Bell + Dropdown */}
              <NotificationDropdown />

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 group outline-none">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {userImage ? (
  <img src={userImage} alt="User" className="w-full h-full object-cover" />
) : (
  <User size={20} className="text-slate-400" />
)}
                    </div>
                    <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52 mt-2 p-1.5 rounded-xl shadow-lg border-slate-100">
                  <DropdownMenuLabel className="px-3 py-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                    <p className="text-sm font-bold text-slate-700 truncate mt-0.5">
                      {session?.user?.handle || session?.user?.name}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-50" />

                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2 focus:bg-slate-50">
                    <Link href={`/profile/${session?.user?.handle}`} className="flex items-center gap-2 w-full">
                      <User size={16} className="text-slate-400" /> My Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2 focus:bg-slate-50">
                    <Link href={`/profile/${session?.user?.handle}/update-profile`} className="flex items-center gap-2 w-full">
                      <Settings size={16} className="text-slate-400" /> Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-slate-50" />

                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="rounded-lg cursor-pointer py-2 text-red-500 focus:bg-red-50 focus:text-red-600 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            /* Loading State */
            <div className="w-9 h-9 rounded-full bg-slate-50 animate-pulse"></div>
          )}
        </div>
      </div>
    </header>
  );
};

export { Navbar };