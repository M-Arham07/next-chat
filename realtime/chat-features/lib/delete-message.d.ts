import { type AckFN, type Message } from "@chat/shared";
import type { TypedSocket } from "../../types.ts";
export declare function deleteMessage(socket: TypedSocket, msgToDelete: Message, ack: AckFN): Promise<void>;
//# sourceMappingURL=delete-message.d.ts.map