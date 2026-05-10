import type { TypedSocket } from "../types.ts";
type handleTypingHandler = (socket: TypedSocket, threadId: string, username: string) => void;
declare const handleTypingStart: handleTypingHandler;
declare const handleTypingStop: handleTypingHandler;
export { handleTypingStart, handleTypingStop };
//# sourceMappingURL=handle-typing.d.ts.map