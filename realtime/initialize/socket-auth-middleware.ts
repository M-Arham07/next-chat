
import { Socket, type ExtendedError } from "socket.io";
import { getToken } from "next-auth/jwt"


type CookiePairType = Record<string, string>;


type NextFn = (err?: ExtendedError) => void;
export async function socketMiddleware(socket: Socket, next: NextFn): Promise<void> {

    try {

        console.log("RUNNING MIDDELWARE")
        const cookie = socket.handshake.headers.cookie

        // Convert the cookie string into a key value pair ! 

        const requiredCookieNames = ["__Secure-next-auth.session-token", "next-auth.session-token"];


        let cookieAuthToken: string = "";

        cookie?.split("; ")?.forEach(c => {
            // c.split("=") / ["cookie1","val1","cookie2","val2"];
            console.log(c.split("="))
            const [cookieName, cookieVal] = c.split("=");

            

            if (requiredCookieNames.includes(cookieName ?? "")) {
                cookieAuthToken = cookieVal ?? "";
            }


        });

        if (!cookieAuthToken) throw new Error("No auth token found!");



        const token = await getToken({
            req: {
                headers: {
                    authorization: `Bearer ${cookieAuthToken}`
                }
            } as any,
            secret: process.env.NEXTAUTH_SECRET!
        });

        if (!token) throw new Error("INVALID_AUTH");
        if(!token?.username) throw new Error("ONBOARDING_INCOMPLETE");
     

        console.log("AUTH_SUCCESS: ",token.username);

        socket.username = token.username as string;
        next()

    }
    catch (err) {

        console.log("AUTH_FAIL", err?.message)

        next(new Error("NOT AUTHENTICATED"));

    }

}