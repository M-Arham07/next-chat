import { Message } from "@chat/shared";
import { messageSchema } from "@chat/shared/schema";
import { Profile } from "@chat/shared/schema/profiles/profile";
import { RefObject } from "react";

export const handleReceiveMessage = (
    receivedMsg: Message,
    profileRef: RefObject<Profile>,
    addMessages: (msgs: Message[]) => void
): void => {
    console.log("received a message");

    // ZOD PARSE ?

    const parsed = messageSchema.safeParse(receivedMsg);

    if (!parsed.success) {
        console.log("Invalid message received");
        return;
    }

   

    const isEcho = receivedMsg.sender === profileRef.current?.id;

    console.log(`Received a message from ${receivedMsg.sender}! isEcho ${isEcho} `);

    // (WE WILL ALREADY RECEIVE SORTED MESSAGES FROM BACKEND!)

    addMessages([receivedMsg]);

    return;
};
