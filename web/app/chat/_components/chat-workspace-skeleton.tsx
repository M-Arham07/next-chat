"use client";

import { useEffect, useState } from "react";
import { Shield, MessageSquareMore, KeyRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const STATUS_COPY = {
    auth: [
        "Checking your session",
        "Preparing your encrypted workspace",
        "Loading your chat identity",
    ],
    bootstrap: [
        "Loading secure threads",
        "Decrypting recent conversations",
        "Warming up your private inbox",
    ],
    recovery: [
        "Waiting for your recovery passphrase",
        "Protecting access to your encrypted chats",
        "Keeping your message history sealed",
    ],
} as const;

type ChatWorkspaceSkeletonProps = {
    stage?: keyof typeof STATUS_COPY;
};

export function ChatWorkspaceSkeleton({
    stage = "bootstrap",
}: ChatWorkspaceSkeletonProps) {
    const [copyIndex, setCopyIndex] = useState(0);
    const copy = STATUS_COPY[stage];

    useEffect(() => {
        const interval = window.setInterval(() => {
            setCopyIndex((current) => (current + 1) % copy.length);
        }, 2200);

        return () => window.clearInterval(interval);
    }, [copy.length]);

    return (
        <div className="h-screen bg-background overflow-hidden">
            <div className="flex h-full flex-col md:hidden">
                <section className="relative flex-1 overflow-hidden bg-gradient-to-br from-background via-background to-muted/10 px-5 pt-6 pb-5">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-white/[0.04] blur-3xl" />
                        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-white/[0.03] blur-3xl" />
                    </div>

                    <div className="relative flex h-full flex-col">
                        <div className="flex items-center justify-between">
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                                <Shield className="h-5 w-5 text-foreground/80" />
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                                Encrypted
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Secure Chat</p>
                            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Loading conversations</h2>
                            <motion.div
                                key={`${stage}-${copyIndex}-mobile`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl"
                            >
                                <MessageSquareMore className="h-4 w-4" />
                                {copy[copyIndex]}
                            </motion.div>
                        </div>

                        <div className="mt-8 space-y-3">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="rounded-[28px] border border-white/8 bg-white/[0.03] px-4 py-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-11 w-11 rounded-full bg-white/8" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-32 bg-white/8" />
                                            <Skeleton className="h-3 w-40 bg-white/6" />
                                        </div>
                                        <Skeleton className="h-3 w-10 bg-white/6" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto rounded-[28px] border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                    <KeyRound className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-28 bg-white/8" />
                                    <Skeleton className="h-3 w-full bg-white/6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="hidden h-full md:flex">
                <aside className="w-16 border-r border-border/40 bg-card/65 backdrop-blur-xl px-3 py-4 flex flex-col items-center">
                    <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-foreground/80" />
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                        {[0, 1, 2, 3].map((index) => (
                            <Skeleton key={index} className="h-11 w-11 rounded-2xl bg-white/6" />
                        ))}
                    </div>
                    <div className="mt-auto">
                        <Skeleton className="h-9 w-9 rounded-full bg-white/6" />
                    </div>
                </aside>

                <div className="flex-1 grid grid-cols-[380px_1fr]">
                    <section className="border-r border-border/40 bg-card/40 backdrop-blur-xl flex flex-col">
                        <div className="px-6 pt-6 pb-4 border-b border-border/30 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Secure Chat</p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">Loading conversations</h2>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
                                    Encrypted
                                </div>
                            </div>
                            <Skeleton className="h-11 w-full rounded-2xl bg-white/6" />
                        </div>

                        <div className="flex-1 px-4 py-4 space-y-3">
                            {Array.from({ length: 7 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-12 w-12 rounded-full bg-white/8" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-32 bg-white/8" />
                                            <Skeleton className="h-3 w-40 bg-white/6" />
                                        </div>
                                        <Skeleton className="h-3 w-10 bg-white/6" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/10">
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute left-16 top-16 h-72 w-72 rounded-full bg-white/[0.03] blur-3xl" />
                            <div className="absolute right-16 bottom-16 h-80 w-80 rounded-full bg-white/[0.04] blur-3xl" />
                        </div>

                        <div className="relative h-full flex flex-col">
                            <div className="px-8 py-6 border-b border-border/30 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-12 w-12 rounded-full bg-white/8" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-28 bg-white/8" />
                                        <Skeleton className="h-3 w-20 bg-white/6" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-10 w-10 rounded-2xl bg-white/6" />
                                    <Skeleton className="h-10 w-10 rounded-2xl bg-white/6" />
                                    <Skeleton className="h-10 w-10 rounded-2xl bg-white/6" />
                                </div>
                            </div>

                            <div className="flex-1 px-8 py-8 space-y-4">
                                <div className="flex justify-center">
                                    <motion.div
                                        key={copyIndex}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.35 }}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl"
                                    >
                                        <MessageSquareMore className="h-4 w-4" />
                                        {copy[copyIndex]}
                                    </motion.div>
                                </div>

                                <div className="flex justify-start">
                                    <div className="w-[52%] rounded-[28px] rounded-bl-lg border border-white/10 bg-white/[0.04] p-4 space-y-2">
                                        <Skeleton className="h-3 w-40 bg-white/8" />
                                        <Skeleton className="h-3 w-52 bg-white/6" />
                                        <Skeleton className="h-3 w-24 bg-white/6" />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <div className="w-[48%] rounded-[28px] rounded-br-lg border border-white/10 bg-white/[0.05] p-4 space-y-2">
                                        <Skeleton className="h-3 w-44 bg-white/8" />
                                        <Skeleton className="h-3 w-32 bg-white/6" />
                                    </div>
                                </div>

                                <div className="flex justify-start">
                                    <div className="w-[58%] rounded-[28px] rounded-bl-lg border border-white/10 bg-white/[0.04] p-3">
                                        <Skeleton className="h-40 w-full rounded-[20px] bg-white/8" />
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 pb-8">
                                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl flex items-center gap-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                        <KeyRound className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3 w-32 bg-white/8" />
                                        <Skeleton className="h-3 w-full bg-white/6" />
                                    </div>
                                    <Skeleton className="h-11 w-11 rounded-2xl bg-white/8" />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
