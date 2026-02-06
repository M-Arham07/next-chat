
import { Socket, type ExtendedError } from "socket.io";
import { getToken } from "next-auth/jwt"


type CookiePairType = Record<string, string>;


type NextFn = (err?: ExtendedError) => void;
export async function socketMiddleware(socket: Socket, next: NextFn): Promise<void> {

    try {


        const { sessionToken } = socket?.handshake?.auth || {};

        if (!sessionToken) throw new Error("NO_SESSION_TOKEN");

        
        console.log("RECEIVED_TOKEN",sessionToken);


        const token = await getToken({
            req: {
                headers: {
                    authorization: `Bearer ${sessionToken}`
                }
            } as any,
            secret: process.env.NEXTAUTH_SECRET!
        });

        if (!token) throw new Error("INVALID_AUTH");
        if (!token?.username) throw new Error("ONBOARDING_INCOMPLETE");


        console.log("AUTH_SUCCESS: ", token.username);

        socket.username = token.username as string;
        next()

    }
    catch (err) {


        if (err instanceof Error) {
            console.log("AUTH_FAIL", err?.message);
        }


        next(new Error("NOT AUTHENTICATED"));

    }

}