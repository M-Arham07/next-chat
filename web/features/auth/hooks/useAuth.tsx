'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from "@/supabase/client";
import { type Profile } from "@chat/shared/schema/profiles/profile"
import type { EncryptedKeyBackupPayload } from "@/features/chat/lib/e2ee";
import {
  createOrReplaceEncryptedBackup,
  forgetEncryptedBackup,
  loadEncryptedBackupStatus,
  rehydrateUnlockedPassphraseForUser,
  restoreEncryptedBackup,
  restoreEncryptedBackupIfUnlocked,
  syncEncryptedBackupIfUnlocked,
  verifyBackupPassphrase,
} from "@/features/chat/lib/e2ee";
import { loadAllThreadKeys, loadIdentityKeyPair, loadRegisteredDevice } from "@/features/chat/lib/e2ee/storage";

type RecoveryStatus = "checking" | "setup-required" | "restore-required" | "ready" | "error";

type RecoveryState = {
  status: RecoveryStatus
  backup: EncryptedKeyBackupPayload | null
  hasLocalKeys: boolean
  error: string | null
  syncing: boolean
}

type AuthContextType = {
  profile: Profile | null
  loading: boolean
  recovery: RecoveryState
  submitPassphrase: (passphrase: string, confirmPassphrase?: string) => Promise<void>
  refreshRecovery: () => Promise<void>
  forgetRecovery: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  recovery: {
    status: "checking",
    backup: null,
    hasLocalKeys: false,
    error: null,
    syncing: false,
  },
  submitPassphrase: async () => undefined,
  refreshRecovery: async () => undefined,
  forgetRecovery: async () => undefined,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [recovery, setRecovery] = useState<RecoveryState>({
    status: "checking",
    backup: null,
    hasLocalKeys: false,
    error: null,
    syncing: false,
  })

  const assessRecovery = async (resolvedProfile: Profile | null) => {
    if (!resolvedProfile?.id) {
      setRecovery({
        status: "ready",
        backup: null,
        hasLocalKeys: false,
        error: null,
        syncing: false,
      })
      return
    }

    setRecovery((current) => ({ ...current, status: "checking", error: null }))

    try {
      const [backupStatus, localThreadKeys, identity, device] = await Promise.all([
        loadEncryptedBackupStatus(),
        loadAllThreadKeys(resolvedProfile.id),
        loadIdentityKeyPair(resolvedProfile.id),
        loadRegisteredDevice(resolvedProfile.id),
      ])

      const hasLocalKeys = localThreadKeys.length > 0
      const backup = backupStatus.exists ? (backupStatus.backup ?? null) : null
      const unlockedForDevice = backup ? await rehydrateUnlockedPassphraseForUser(resolvedProfile.id) : false
      let resolvedHasLocalKeys = hasLocalKeys

      if (backup && !resolvedHasLocalKeys && unlockedForDevice) {
        const restoredBundle = await restoreEncryptedBackupIfUnlocked(resolvedProfile.id, backup)
        resolvedHasLocalKeys = (restoredBundle?.threadKeys.length ?? 0) > 0
      }

      let status: RecoveryStatus = "ready"

      if (!backup) {
        status = "setup-required"
      } else if (!resolvedHasLocalKeys) {
        if (!unlockedForDevice) {
          status = "restore-required"
        } else if (!identity || !device) {
          status = "restore-required"
        }
      } else if (!identity || !device) {
        status = "restore-required"
      }

      setRecovery({
        status,
        backup,
        hasLocalKeys: resolvedHasLocalKeys,
        error: backup && !unlockedForDevice && hasLocalKeys
          ? "Backup sync is paused on this device until you unlock it again."
          : null,
        syncing: false,
      })
    } catch (error) {
      setRecovery({
        status: "error",
        backup: null,
        hasLocalKeys: false,
        error: error instanceof Error ? error.message : "Failed to inspect encrypted backup state",
        syncing: false,
      })
    }
  }

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true;

    const fetchProfile = async (userId: string | undefined) => {
      if (!userId) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (isMounted) {
        if (!error && data) {
          setProfile(data as Profile);
          await assessRecovery(data as Profile)
        } else {
          setProfile(null);
          await assessRecovery(null)
        }
        setLoading(false);
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      fetchProfile(data.user?.id);
    })

    return () => {
      isMounted = false;
    }
  }, [])

  const submitPassphrase = async (passphrase: string, confirmPassphrase?: string) => {
    if (!profile?.id) {
      throw new Error("Profile is unavailable")
    }

    setRecovery((current) => ({ ...current, syncing: true, error: null }))

    try {
      if (recovery.backup) {
        const isValid = await verifyBackupPassphrase(passphrase, recovery.backup)

        if (!isValid) {
          throw new Error("Incorrect recovery passphrase")
        }

        if (!recovery.hasLocalKeys) {
          await restoreEncryptedBackup(profile.id, passphrase, recovery.backup)
        }

        await syncEncryptedBackupIfUnlocked(profile.id)
      } else {
        if (!confirmPassphrase || passphrase !== confirmPassphrase) {
          throw new Error("Passphrases do not match")
        }

        await createOrReplaceEncryptedBackup(profile.id, passphrase)
      }

      await assessRecovery(profile)
    } catch (error) {
      setRecovery((current) => ({
        ...current,
        status: current.backup ? "restore-required" : "setup-required",
        error: error instanceof Error ? error.message : "Failed to process recovery passphrase",
        syncing: false,
      }))
      throw error
    }
  }

  const refreshRecovery = async () => {
    await assessRecovery(profile)
  }

  const forgetRecovery = async () => {
    if (!profile?.id) {
      throw new Error("Profile is unavailable")
    }

    setRecovery((current) => ({ ...current, syncing: true, error: null }))

    try {
      await forgetEncryptedBackup(profile.id)
      await assessRecovery(profile)
    } catch (error) {
      setRecovery((current) => ({
        ...current,
        syncing: false,
        error: error instanceof Error ? error.message : "Failed to destroy encrypted backup",
      }))
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ profile, loading, recovery, submitPassphrase, refreshRecovery, forgetRecovery }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
