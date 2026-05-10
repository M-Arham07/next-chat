import { type AckFN, type Message } from "@chat/shared";
import type { TypedSocket } from "../../types.ts";
export declare const handleNewMessage: (socket: TypedSocket, newMessage: Message, ack: AckFN) => Promise<void>;
//# sourceMappingURL=handle-new-message.d.ts.map