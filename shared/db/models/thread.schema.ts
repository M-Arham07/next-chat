import mongoose, { Schema, type HydratedDocument } from "mongoose";
import type { Thread } from "../../types/index.ts";

type ThreadSchemaType = Omit<Thread, "createdAt">; // createdAt comes from timestamps
type ThreadDoc = HydratedDocument<ThreadSchemaType>;

const participantSchema = new Schema(
    {
        username: { type: String, required: true },
        image: { type: String, required: true },
        role: { type: String, enum: ["admin", "member"], default: "member" },

        joinedAt: {
            type: Date,
            required: function (this: any) {
                const thread = this.ownerDocument() as ThreadDoc;
                return thread?.type === "group";
            }
        },

        leftAt: {
            type: Date,
            required: function (this: any) {
                const thread = this.ownerDocument() as ThreadDoc;
                return thread?.type === "group";
            }
        }
    },
    { _id: false }
);

const threadSchema = new Schema<ThreadSchemaType>(
    {
        threadId: { type: String, required: true, unique: true },

        type: { type: String, enum: ["direct", "group"], required: true },

        particpants: {
            type: [participantSchema],
            required: true,
            validate: {
                validator: function (this: any, participants: any[]) {
                    const doc = this as ThreadDoc; // cast for property access

                    if (!Array.isArray(participants)) return false;

                    // count by type
                    if (doc.type === "direct" && participants.length !== 2) return false;
                    if (doc.type === "group" && participants.length < 2) return false;

                    // duplicate usernames (case-insensitive)
                    const usernames = participants
                        .map(p => (p?.username ?? "").trim().toLowerCase())
                        .filter(Boolean);

                    if (usernames.length !== participants.length) return false;
                    if (new Set(usernames).size !== usernames.length) return false;

                    return true;
                },
                message: function (this: any) {
                    const doc = this as ThreadDoc;
                    return doc.type === "direct"
                        ? "Direct threads must have exactly 2 unique participants"
                        : "Group threads must have at least 2 unique participants";
                }
            }
        },

        createdBy: {
            type: String,
            required: function (this: ThreadDoc) {
                return this.type === "group";
            }
        },

        groupName: {
            type: String,
            required: function (this: ThreadDoc) {
                return this.type === "group";
            }
        },

        groupImage: {
            type: String,
            required: function (this: ThreadDoc) {
                return this.type === "group";
            }
        }
    },
    { timestamps: true, collection: "threads" }
);

export const Threads = mongoose.models.Thread || mongoose.model<ThreadSchemaType>("Thread", threadSchema);
