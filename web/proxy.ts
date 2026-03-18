import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import path from 'path';
import { updateSession } from './supabase/proxy';
import { rewriteWithCookies } from './supabase/rewrite';
import { getProfileServer } from './supabase/getProfileServer';
// This function can be marked `async` if using `await` inside
export default async function proxy(request: NextRequest) {


    let response = await updateSession(request);
    const profile = await getProfileServer();
    const pathname: string = request.nextUrl.pathname;






    // run only if pathname is / or /chat and user is authenticated already
    // (user is authenticated in updateSession function automatically)


    if (pathname === "/" || pathname === "/chat") {

        // now check for profile if it exists or not, if not redirect to onboarding

        if (!profile) {
            return NextResponse.redirect(new URL("/register/onboarding",request.url));
        }

    }







    // dont uncomment
    //     // if session.user.username doesent exist, go back to register page !

    //     if(!session?.user?.username){
    //         return NextResponse.redirect(new URL("/register", request.url));
    //     }
    // }





    if (pathname === "/") {
        return rewriteWithCookies(request, response, "/chat");
    }





    return response;
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
    ],
}

