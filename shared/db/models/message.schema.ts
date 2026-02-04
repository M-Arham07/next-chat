import type { Message } from "#/shared/types/message.ts";
import mongoose, { Model } from "mongoose";

const messageSchema = new mongoose.Schema<Message>(
  {
    msgId: {
      type: String,
      required: true,
      unique: true,
    },

    threadId: {
      type: String, // or Types.ObjectId if threads are in another collection
      required: true,
      index: true,
    },

    sender: {
      type: String, // username
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "voice", "document", "deleted"],
      required: true,
    },

    content: {
      type: String, // text or file URL
      required: true,
    },

    replyToMsgId: {
      type: String,
      default: null,
    },

    readBy: {
      type: [String], // array of usernames
      default: [],
    },

    status: {
      type: String,
      enum: ["sending", "sent", "failed"],
      required: true,
      default: "sent",
    },

    // THE TIMESTAMP WILL BE PROVIDED BY CLIENT!
    timestamp: {
      type: String,
      required: true,
    },
  },
  {
    collection: "messages"

  }
);

export const Messages = mongoose.models.Messages || mongoose.model<Message>("Messages", messageSchema) as Model<Message> ;
