"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    KeyRound,
    Loader2,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/features/auth/hooks/useAuth";

const RecoveryScreenSkeleton = () => {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="absolute right-4 top-4 z-10">
                <ThemeToggle />
            </div>

            <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
                <section className="relative overflow-hidden border-b border-border/40 px-6 py-8 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-white/[0.04] blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl" />
                    </div>

                    <div className="relative mx-auto flex h-full max-w-2xl flex-col justify-center">
                        <Skeleton className="mb-6 h-12 w-12 rounded-2xl bg-white/8" />
                        <Skeleton className="h-4 w-28 bg-white/8" />
                        <Skeleton className="mt-5 h-12 w-[22rem] max-w-full bg-white/10" />
                        <Skeleton className="mt-4 h-4 w-[28rem] max-w-full bg-white/8" />
                        <Skeleton className="mt-2 h-4 w-[24rem] max-w-full bg-white/6" />

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5"
                                >
                                    <Skeleton className="h-10 w-10 rounded-2xl bg-white/8" />
                                    <Skeleton className="mt-4 h-4 w-28 bg-white/8" />
                                    <Skeleton className="mt-2 h-3 w-full bg-white/6" />
                                    <Skeleton className="mt-2 h-3 w-4/5 bg-white/6" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center px-6 py-8 lg:px-12 lg:py-12">
                    <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-background/92 p-6 backdrop-blur-2xl lg:p-8">
                        <Skeleton className="h-5 w-36 bg-white/8" />
                        <Skeleton className="mt-4 h-10 w-72 max-w-full bg-white/10" />
                        <Skeleton className="mt-3 h-4 w-full bg-white/6" />
                        <Skeleton className="mt-10 h-12 w-full rounded-2xl bg-white/8" />
                        <Skeleton className="mt-4 h-12 w-full rounded-2xl bg-white/8" />
                        <Skeleton className="mt-6 h-12 w-full rounded-2xl bg-white/10" />
                    </div>
                </section>
            </div>
        </main>
    );
};

export default function RecoveryPage() {
    const router = useRouter();
    const { profile, loading, recovery, submitPassphrase, forgetRecovery } = useAuth();
    const [passphrase, setPassphrase] = useState("");
    const [confirmPassphrase, setConfirmPassphrase] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);
    const [showForgetWarning, setShowForgetWarning] = useState(false);

    useEffect(() => {
        if (!loading && !profile) {
            router.replace("/register/onboarding");
        }
    }, [loading, profile, router]);

    useEffect(() => {
        if (recovery.status === "ready") {
            router.replace("/chat");
        }
    }, [recovery.status, router]);

    const view = useMemo(() => {
        if (recovery.status === "restore-required") {
            return {
                eyebrow: "Recover Secure Access",
                title: "Restore your encrypted chat keys",
                description:
                    "This device does not have your local thread keys yet. Enter the passphrase you created earlier to recover them locally and resume decrypting your chats.",
                cta: "Restore and continue",
                helper:
                    "Your passphrase never leaves the browser. The backup stored on the server stays encrypted and unreadable without it.",
                showConfirm: false,
                icon: KeyRound,
            };
        }

        return {
            eyebrow: "Finish Secure Setup",
            title: "Create your recovery passphrase",
            description:
                "Before you enter chat, create a recovery passphrase. It encrypts your backup locally so a future device can restore your chat keys without your server ever seeing them.",
            cta: "Create secure backup",
            helper:
                "This passphrase cannot be reset. If you lose it, your old encrypted chats cannot be recovered on a new device.",
            showConfirm: true,
            icon: ShieldCheck,
        };
    }, [recovery.status]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLocalError(null);

        try {
            await submitPassphrase(passphrase, view.showConfirm ? confirmPassphrase : undefined);
        } catch (error) {
            setLocalError(error instanceof Error ? error.message : "Unable to continue");
        }
    };

    const handleForgetRecovery = async () => {
        setLocalError(null);

        try {
            await forgetRecovery();
            setPassphrase("");
            setConfirmPassphrase("");
            setShowForgetWarning(false);
        } catch (error) {
            setLocalError(error instanceof Error ? error.message : "Unable to destroy encrypted backup");
        }
    };

    if (loading || recovery.status === "checking") {
        return <RecoveryScreenSkeleton />;
    }

    const Icon = view.icon;

    return (
        <main className="min-h-screen overflow-hidden bg-background text-foreground">
            <div className="noise-overlay fixed inset-0 z-0" />
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -left-24 top-8 h-[28rem] w-[28rem] rounded-full bg-linear-to-br from-muted to-transparent blur-3xl opacity-60" />
                <div className="absolute -right-20 bottom-0 h-[32rem] w-[32rem] rounded-full bg-linear-to-tr from-muted/80 to-transparent blur-3xl opacity-40" />
            </div>

            <div className="absolute right-4 top-4 z-50">
                <ThemeToggle />
            </div>

            <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
                <section className="flex items-center border-b border-border/40 px-6 py-8 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="mx-auto flex w-full max-w-2xl flex-col"
                    >
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05]">
                            <Icon className="h-6 w-6 text-foreground/90" />
                        </div>

                        <p className="mt-8 text-xs uppercase tracking-[0.32em] text-muted-foreground">
                            {view.eyebrow}
                        </p>
                        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                            {view.title}
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                            {view.description}
                        </p>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                                <ShieldCheck className="h-5 w-5 text-foreground/85" />
                                <h2 className="mt-4 text-sm font-semibold">Client-side only</h2>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Your backup is encrypted in the browser before upload. The server stores ciphertext only.
                                </p>
                            </div>
                            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                                <LockKeyhole className="h-5 w-5 text-foreground/85" />
                                <h2 className="mt-4 text-sm font-semibold">Recovery without exposure</h2>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    On a new device, the same passphrase restores your chat keys locally without handing them to the server.
                                </p>
                            </div>
                            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                                <CheckCircle2 className="h-5 w-5 text-foreground/85" />
                                <h2 className="mt-4 text-sm font-semibold">One short step</h2>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Finish this once, then you continue straight into chat with recovery already in place.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </section>

                <section className="flex items-center justify-center px-6 py-8 lg:px-12 lg:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.05 }}
                        className="w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-background/92 shadow-2xl shadow-black/20 backdrop-blur-2xl"
                    >
                        <div className="border-b border-border/50 px-6 py-6 lg:px-8">
                            <p className="text-sm font-medium text-muted-foreground">Encrypted recovery setup</p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                                {view.showConfirm ? "Protect future device restores" : "Unlock your backup"}
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                {view.helper}
                            </p>
                        </div>

                        <form className="space-y-5 px-6 py-6 lg:px-8 lg:py-8" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="recovery-passphrase">
                                    Recovery passphrase
                                </label>
                                <Input
                                    id="recovery-passphrase"
                                    type="password"
                                    autoComplete={view.showConfirm ? "new-password" : "current-password"}
                                    value={passphrase}
                                    onChange={(event) => setPassphrase(event.target.value)}
                                    placeholder={view.showConfirm ? "Create a memorable passphrase" : "Enter your passphrase"}
                                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04]"
                                />
                            </div>

                            {view.showConfirm && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground" htmlFor="confirm-recovery-passphrase">
                                        Confirm passphrase
                                    </label>
                                    <Input
                                        id="confirm-recovery-passphrase"
                                        type="password"
                                        autoComplete="new-password"
                                        value={confirmPassphrase}
                                        onChange={(event) => setConfirmPassphrase(event.target.value)}
                                        placeholder="Re-enter the passphrase"
                                        className="h-12 rounded-2xl border-white/10 bg-white/[0.04]"
                                    />
                                </div>
                            )}

                            {(localError || recovery.error) && (
                                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    {localError || recovery.error}
                                </div>
                            )}

                            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                                <div className="flex items-start gap-3">
                                    <KeyRound className="mt-0.5 h-4 w-4 text-foreground/75" />
                                    <p>
                                        {view.showConfirm
                                            ? "This passphrase becomes the only way to unlock the encrypted backup on a new device."
                                            : "Restoring decrypts your backup locally, then saves the recovered keys back into this browser only."}
                                    </p>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={
                                    recovery.syncing ||
                                    !passphrase.trim() ||
                                    (view.showConfirm && !confirmPassphrase.trim())
                                }
                                className="h-12 w-full rounded-2xl bg-foreground text-background hover:bg-foreground/90"
                            >
                                {recovery.syncing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Securing your backup...
                                    </>
                                ) : (
                                    <>
                                        {view.cta}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>

                            {!view.showConfirm && (
                                <div className="space-y-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setShowForgetWarning((current) => !current)}
                                        className="h-11 w-full rounded-2xl border border-red-500/20 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                                    >
                                        Forgot recovery key?
                                    </Button>

                                    {showForgetWarning && (
                                        <div className="rounded-[24px] border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                                <div className="space-y-3">
                                                    <p>
                                                        This destroys your encrypted backup and clears any local key state for this browser.
                                                        Old encrypted messages tied to that backup will become unreadable unless another
                                                        device already still has the keys.
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        disabled={recovery.syncing}
                                                        onClick={handleForgetRecovery}
                                                        className="h-10 rounded-2xl"
                                                    >
                                                        {recovery.syncing ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Destroying encrypted access...
                                                            </>
                                                        ) : (
                                                            "Destroy old encrypted access"
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>
                    </motion.div>
                </section>
            </div>
        </main>
    );
}
