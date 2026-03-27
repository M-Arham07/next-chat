import { RefObject } from "react";
import { Message, MessageContentType, MessageStatusType } from "@chat/shared";
import { type SocketClientType } from "../../lib/socket-client";
import { GetFileUrl } from "../../lib/upload-utils";
import { messageSchema } from "@chat/shared/schema";
import { MAX_FILE_SIZE, MAX_VIDEO_SIZE_FOR_BROWSER } from "@chat/shared/constants";
import { Profile } from "@chat/shared/schema/profiles/profile";
import type { ChatAppStore } from "../../store/chatapp.store";

export interface MobileFilePayload {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

interface UseSendMessageParams {
  profileRef: RefObject<Profile>;
  socketRef: RefObject<SocketClientType | null>;
  replyingToMsg: Message | null;
  set: (key: keyof ChatAppStore, value: any) => void;
  addMessages: (msgs: Message[]) => void;
  updateMessageContent: (threadId: string, msgId: string, content: string) => void;
  updateMessageStatus: (threadId: string, msgId: string, newStatus: MessageStatusType) => void;
  setUploadingProgress: (msgId: string, percent: number) => void;
}

export const useSendMessage = ({
  profileRef,
  socketRef,
  replyingToMsg,
  set,
  addMessages,
  updateMessageContent,
  updateMessageStatus,
  setUploadingProgress,
}: UseSendMessageParams) => {
  const handleSendMessage = async (
    threadId: string,
    type: Omit<MessageContentType, "deleted">,
    content: string | MobileFilePayload
  ): Promise<void> => {
    const isFile = type !== "text" && typeof content === "object";

    // Use local URI as optimistic preview for media, or the text string
    const previewContent = isFile
      ? (content as MobileFilePayload).uri
      : (content as string);

    const newMessage: Message = {
      msgId:
        process.env.NODE_ENV === "production"
          ? crypto.randomUUID()
          : (Date.now() - Math.random()).toString(),
      threadId,
      sender: profileRef.current.id,
      type: type as MessageContentType,
      content: previewContent,
      timestamp: new Date().toISOString(),
      replyToMsgId: replyingToMsg?.msgId,
      status: "sending",
    };

    if (!messageSchema.safeParse(newMessage).success) {
      console.error("[useSendMessage] Message failed schema validation");
      return;
    }

    // File size guard
    if (isFile) {
      const file = content as MobileFilePayload;
      const limit = type === "video" ? MAX_VIDEO_SIZE_FOR_BROWSER : MAX_FILE_SIZE;
      if (file.size && file.size > limit) {
        console.error(`[useSendMessage] File exceeds ${limit / 1024 / 1024}MB limit`);
        updateMessageStatus(threadId, newMessage.msgId, "failed");
        return;
      }
    }

    // Optimistically add message to UI
    addMessages([newMessage]);
    set("replyingToMsg", null);

    // Upload file if needed
    if (isFile) {
      const file = content as MobileFilePayload;
      try {
        const { url } = await GetFileUrl(file, (percent) => {
          setUploadingProgress(newMessage.msgId, percent);
        });
        updateMessageContent(threadId, newMessage.msgId, url);
        newMessage.content = url;
      } catch (err) {
        console.error("[useSendMessage] Upload failed", err);
        updateMessageStatus(threadId, newMessage.msgId, "failed");
        return;
      }
    }

    // Emit via socket with 10s timeout
    socketRef?.current?.timeout(10000).emit(
      "message:new",
      newMessage,
      (err: any, res: any) => {
        if (err || !res?.ok) {
          updateMessageStatus(threadId, newMessage.msgId, "failed");
          return;
        }
        updateMessageStatus(threadId, newMessage.msgId, "sent");
      }
    );
  };

  return { handleSendMessage };
};
