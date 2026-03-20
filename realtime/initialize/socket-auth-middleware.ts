
import { Socket, type ExtendedError } from "socket.io";
import { supabase } from "../supabase/supabase.ts";
import { getProfileFromToken } from "./getProfileFromToken.ts";
import { logger } from "../lib/logger.ts";





type NextFn = (err?: ExtendedError) => void;
export async function socketMiddleware(socket: Socket, next: NextFn): Promise<void> {

    try {



        const { sessionToken } = socket?.handshake?.auth;




        if (!sessionToken) throw new Error("NO_SESSION_TOKEN");



        logger.info("RECEIVED_TOKEN: " + sessionToken.slice(0, 10) + "...");





        const profile = await getProfileFromToken(sessionToken);



        logger.success(`AUTH_SUCCESS: ${profile.username}`);

        socket.profile = profile;
        next();

    }
    catch (err) {


        if (err instanceof Error) {
            logger.error(`AUTH_FAIL: ${err?.message}`);
        }


        next(new Error("NOT AUTHENTICATED"));

    }

}