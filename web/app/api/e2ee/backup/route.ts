import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { getProfileServer } from "@/supabase/getProfileServer";

const backupPayloadSchema = z.object({
    encryptedBlob: z.string().min(1),
    salt: z.string().min(1),
    iv: z.string().min(1),
    kdfAlgorithm: z.literal("PBKDF2-SHA256"),
    kdfIterations: z.number().int().positive(),
    backupVersion: z.number().int().positive(),
});

export async function GET(_request: NextRequest): Promise<NextResponse> {
    try {
        const profile = await getProfileServer();

        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("user_key_backups")
            .select("encrypted_blob, salt, iv, kdf_algorithm, kdf_iterations, backup_version, updated_at")
            .eq("user_id", profile.id)
            .maybeSingle();

        if (error) {
            throw new Error(error.message);
        }

        if (!data) {
            return NextResponse.json({ exists: false }, { status: 200 });
        }

        return NextResponse.json({
            exists: true,
            backup: {
                encryptedBlob: data.encrypted_blob,
                salt: data.salt,
                iv: data.iv,
                kdfAlgorithm: data.kdf_algorithm,
                kdfIterations: data.kdf_iterations,
                backupVersion: data.backup_version,
                updatedAt: data.updated_at,
            },
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to load key backup" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const profile = await getProfileServer();

        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = backupPayloadSchema.parse(await request.json());
        const supabase = await createClient();

        const { error } = await supabase
            .from("user_key_backups")
            .upsert({
                user_id: profile.id,
                encrypted_blob: payload.encryptedBlob,
                salt: payload.salt,
                iv: payload.iv,
                kdf_algorithm: payload.kdfAlgorithm,
                kdf_iterations: payload.kdfIterations,
                backup_version: payload.backupVersion,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to save key backup" },
            { status: 500 },
        );
    }
}

export async function DELETE(_request: NextRequest): Promise<NextResponse> {
    try {
        const profile = await getProfileServer();

        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from("user_key_backups")
            .delete()
            .eq("user_id", profile.id);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete key backup" },
            { status: 500 },
        );
    }
}
