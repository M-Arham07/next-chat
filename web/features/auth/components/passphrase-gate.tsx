"use client";

import { FormEvent, useMemo, useState } from "react";
import { ShieldCheck, KeyRound, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function PassphraseGate() {
    const { recovery, submitPassphrase } = useAuth();
    const [passphrase, setPassphrase] = useState("");
    const [confirmPassphrase, setConfirmPassphrase] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const modalCopy = useMemo(() => {
        switch (recovery.status) {
            case "setup-required":
                return {
                    icon: ShieldCheck,
                    title: "Create your recovery passphrase",
                    description: "This passphrase encrypts your chat-key backup before it ever leaves the browser. Your server stores only ciphertext.",
                    cta: "Secure my chats",
                    showConfirm: true,
                    helper: "Keep it memorable. If you lose it, old encrypted chats cannot be restored on a new device.",
                };
            case "restore-required":
                return {
                    icon: KeyRound,
                    title: "Restore your encrypted chats",
                    description: "This browser has no local thread keys yet. Enter your recovery passphrase to decrypt the backup and recover your conversations.",
                    cta: "Restore chats",
                    showConfirm: false,
                    helper: "Your passphrase is only used locally to decrypt the backup. The server cannot read your messages.",
                };
            default:
                return null;
        }
    }, [recovery.status]);

    if (!modalCopy) {
        return null;
    }

    const Icon = modalCopy.icon;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLocalError(null);

        try {
            await submitPassphrase(passphrase, modalCopy.showConfirm ? confirmPassphrase : undefined);
            setPassphrase("");
            setConfirmPassphrase("");
        } catch (error) {
            setLocalError(error instanceof Error ? error.message : "Unable to continue");
        }
    };

    return (
        <Dialog open>
            <DialogContent
                showCloseButton={false}
                className="max-w-xl rounded-[28px] border-white/10 bg-background/92 p-0 backdrop-blur-2xl overflow-hidden"
            >
                <div className="relative p-8 sm:p-9">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-12 right-0 h-40 w-40 rounded-full bg-white/[0.05] blur-3xl" />
                        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/[0.03] blur-3xl" />
                    </div>

                    <div className="relative space-y-8">
                        <DialogHeader className="space-y-4 text-left">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                                <Icon className="h-5 w-5 text-foreground/90" />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="text-2xl tracking-tight">{modalCopy.title}</DialogTitle>
                                <DialogDescription className="max-w-lg text-sm leading-6 text-muted-foreground">
                                    {modalCopy.description}
                                </DialogDescription>
                            </div>
                        </DialogHeader>

                        <div className="grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-sm text-muted-foreground">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-4 w-4 text-foreground/75" />
                                <p>{modalCopy.helper}</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <KeyRound className="mt-0.5 h-4 w-4 text-foreground/75" />
                                <p>Recovery decrypts locally in your browser. The backup blob on the server stays unreadable without your passphrase.</p>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Recovery passphrase</label>
                                <Input
                                    type="password"
                                    value={passphrase}
                                    onChange={(event) => setPassphrase(event.target.value)}
                                    placeholder="Enter your recovery passphrase"
                                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04]"
                                />
                            </div>

                            {modalCopy.showConfirm && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Confirm passphrase</label>
                                    <Input
                                        type="password"
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

                            <Button
                                type="submit"
                                disabled={recovery.syncing || !passphrase.trim() || (modalCopy.showConfirm && !confirmPassphrase.trim())}
                                className="h-12 w-full rounded-2xl bg-foreground text-background hover:bg-foreground/90"
                            >
                                {recovery.syncing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Working securely...
                                    </>
                                ) : modalCopy.cta}
                            </Button>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
