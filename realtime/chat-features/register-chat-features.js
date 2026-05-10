import { joinAllRooms } from "./join-all-rooms.ts";
import { handleNewMessage } from "./lib/handle-new-message.ts";
import { deleteMessage } from "./lib/delete-message.ts";
import { handleTypingStart, handleTypingStop } from "./handle-typing.ts";
import { logger } from "../lib/logger.ts";
export function registerChatFeatures(io, socket) {
    socket.on("message:new", async (newMessage, ack) => {
        handleNewMessage(socket, newMessage, ack);
    });
    socket.on("message:delete", (msgToDelete, ack) => {
        logger.info(`received message to delete: ${JSON.stringify(msgToDelete)}`);
        deleteMessage(socket, msgToDelete, ack);
    });
    // Realtime typing indicator: 
    socket.on("typing:start", (threadId, username) => handleTypingStart(socket, threadId, username));
    socket.on("typing:stop", (threadId, username) => handleTypingStop(socket, threadId, username));
}
//# sourceMappingURL=register-chat-features.js.map