
import { Socket, type ExtendedError } from "socket.io";
import { getToken } from "next-auth/jwt"



type NextFn = (err?: ExtendedError) => void;
export async function socketMiddleware(socket: Socket, next: NextFn): Promise<void> {

    // try {

    //     console.log("RUNNING MIDDELWARE")
    //     const cookie = socket.handshake.headers.cookie
    //     console.log(cookie)
    //     if (!cookie) throw new Error("No session cookie");

     

        
    //     const token = await getToken({
    //         req:{
    //             headers:{
    //                 cookie:cookie
    //             }
    //         } as any,
    //         secret: process.env.NEXTAUTH_SECRET!
    //     });

    //     if(!token) throw new Error("INVALID_AUTH");

    //     console.log("SESSION COOKIE IS", cookie);
    //     next();

    // }
    // catch (err) {

    //     console.log("AUTH_FAIL",err?.message)

    //     next(new Error("NOT AUTHENTICATED"));

    // }
    next()
}