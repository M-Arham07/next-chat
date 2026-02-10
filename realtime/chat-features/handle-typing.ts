import type { TypedSocket } from "../types.ts";


type handleTypingHandler = (
    socket: TypedSocket,
    threadId: string,
    username: string
) => void;


const handleTypingStart: handleTypingHandler = (socket, threadId, username) => {

    if (!threadId || !username) return;

    socket.to(threadId).emit("typing:start", threadId, username);





}


const handleTypingStop: handleTypingHandler = (socket, threadId, username) => {

    if (!threadId || !username) return;


    socket.to(threadId).emit("typing:stop", threadId, username);





}


export { handleTypingStart, handleTypingStop };
