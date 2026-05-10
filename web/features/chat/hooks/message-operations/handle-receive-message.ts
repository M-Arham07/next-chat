import { Message } from "@chat/shared";
import { messageSchema } from "@chat/shared/schema";
import { Profile } from "@chat/shared/schema/profiles/profile";
import { RefObject } from "react";
import { hydrateMessagesForDisplay } from "@/features/chat/lib/e2ee";

export const handleReceiveMessage = async (
    receivedMsg: Message,
    profileRef: RefObject<Profile | null>,
    addMessages: (msgs: Message[]) => void,
): Promise<void> => {
    const parsed = messageSchema.safeParse(receivedMsg);

    if (!parsed.success) {
        return;
    }

    if (!profileRef.current?.id) {
        return;
    }

    const [hydratedMessage] = await hydrateMessagesForDisplay(profileRef.current.id, [receivedMsg]);
    addMessages([hydratedMessage]);
};
