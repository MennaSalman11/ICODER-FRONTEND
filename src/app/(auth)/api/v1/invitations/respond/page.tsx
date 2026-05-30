"use client";

import React, { Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { groupService } from "../../../../../../lib/services/group-service";

// ─── Types ────────────────────────────────────────────────────────────────────

type PageState = "idle" | "accepting" | "rejecting" | "accepted" | "rejected" | "error";

// ─── Inner Component (needs useSearchParams) ──────────────────────────────────

function InvitePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    // 1. تجميع كل الـ Hooks والـ States في البداية لضمان استقرار الهيكل
    const [state, setState] = useState<PageState>("idle");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState<string>("");

    // مغلفة بـ useCallback للحفاظ على الأداء ومنع إعادة التعيين مع كل Render
    const handleRespond = useCallback(async (response: "ACCEPTED" | "REJECTED") => {
        if (!token) return;

        setState(response === "ACCEPTED" ? "accepting" : "rejecting");
        setErrorMsg("");
        setSuccessMsg("");
        try {
            const res = await groupService.respondToInvitation(token, response);
            console.log("Invitation Response:", res);

            setState(response === "ACCEPTED" ? "accepted" : "rejected");
            setSuccessMsg(res?.message || (response === "ACCEPTED"
                ? "You have successfully joined the group!"
                : "You have declined the group invitation."));

            setTimeout(() => {
                router.push(response === "ACCEPTED" ? "/groups" : "/");
            }, 2500);
        } catch (err: unknown) {
            setState("error");
            const message =
                err instanceof Error ? err.message : "Something went wrong. Please try again.";
            setErrorMsg(message);
        }
    }, [token, router]);

    const isLoading = state === "accepting" || state === "rejecting";

    // 2. الـ Guard Condition يجي هنا بعد الـ Hooks عادي جداً ومن غير قلق
    if (!token) {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <AlertTriangle size={32} className="text-amber-500" />
                </div>
                <h1 className="text-xl font-bold text-slate-800">Invalid Invitation Link</h1>
                <p className="text-sm text-slate-500 max-w-xs">
                    This invitation link is missing a token. Please use the link from your
                    email or notification exactly as provided.
                </p>
                <button
                    onClick={() => router.push("/groups")}
                    className="mt-2 px-5 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition"
                >
                    Go to Groups
                </button>
            </div>
        );
    }

    // ── Success: Accepted ─────────────────────────────────────────────────────
    if (state === "accepted") {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center animate-bounce-once">
                    <CheckCircle2 size={36} className="text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">You&apos;re in!</h2>
                <p className="text-sm text-slate-500">
                    {successMsg}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Loader2 size={12} className="animate-spin" />
                    Redirecting to your groups…
                </div>
            </div>
        );
    }

    // ── Success: Rejected ─────────────────────────────────────────────────────
    if (state === "rejected") {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <XCircle size={36} className="text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Invitation Declined</h2>
                <p className="text-sm text-slate-500">
                    {successMsg}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Loader2 size={12} className="animate-spin" />
                    Redirecting…
                </div>
            </div>
        );
    }

    // ── Main Invitation Card ──────────────────────────────────────────────────
    return (
        <>
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Users size={38} className="text-blue-600" />
            </div>

            {/* Text */}
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    Group Invitation
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                    You&apos;ve been invited to join a group on{" "}
                    <span className="font-semibold text-slate-700">iCoder</span>. Accept
                    to start collaborating with the team.
                </p>
            </div>

            {/* Token preview (truncated for aesthetics) */}
            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono truncate">
                    Token: {token.slice(0, 24)}…
                </span>
            </div>

            {/* Error Banner */}
            {state === "error" && (
                <div className="w-full flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 leading-snug">{errorMsg}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-1">
                {/* Accept */}
                <button
                    onClick={() => handleRespond("ACCEPTED")}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-600 active:scale-95 text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-green-200"
                >
                    {state === "accepting" ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <CheckCircle2 size={16} />
                    )}
                    {state === "accepting" ? "Accepting…" : "Accept Invitation"}
                </button>

                {/* Reject */}
                <button
                    onClick={() => handleRespond("REJECTED")}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-600 hover:text-slate-800 font-semibold text-sm border border-slate-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {state === "rejecting" ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <XCircle size={16} />
                    )}
                    {state === "rejecting" ? "Declining…" : "Decline"}
                </button>
            </div>

            {/* Footer note */}
            <p className="text-xs text-slate-400 text-center">
                This invitation link is single-use. It will expire once acted upon.
            </p>
        </>
    );
}

// ─── Page Shell ───────────────────────────────────────────────────────────────

export default function GroupInvitePage() {
    return (
        <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 px-8 py-10 flex flex-col items-center gap-6">
                    <Suspense
                        fallback={
                            <div className="flex flex-col items-center gap-4 py-8">
                                <Loader2 size={32} className="animate-spin text-blue-400" />
                                <p className="text-sm text-slate-400">Loading invitation…</p>
                            </div>
                        }
                    >
                        <InvitePageInner />
                    </Suspense>
                </div>

                {/* Brand watermark */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    iCoder · Competitive Programming Platform
                </p>
            </div>
        </main>
    );
}