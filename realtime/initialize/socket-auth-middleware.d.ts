import { Socket, type ExtendedError } from "socket.io";
type NextFn = (err?: ExtendedError) => void;
export declare function socketMiddleware(socket: Socket, next: NextFn): Promise<void>;
export {};
//# sourceMappingURL=socket-auth-middleware.d.ts.map