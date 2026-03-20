import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import path from 'path';
import { updateSession } from './supabase/proxy';
import { rewriteWithCookies } from './supabase/rewrite';
import { getProfileServer } from './supabase/getProfileServer';
import { getAuthServer } from './supabase/getAuthServer';
// This function can be marked `async` if using `await` inside
export default async function proxy(request: NextRequest) {


    let response = await updateSession(request);

    const pathname: string = request.nextUrl.pathname;




    const [auth, profile] = await Promise.all([getAuthServer(), getProfileServer()]);







    // if user isnt authenticated but tries to access onboarding page: 
    if (pathname === "/register/onboarding") {
        console.log(auth)

        if (!auth) return NextResponse.redirect(new URL("/register", request.url));
    }





    if (!pathname.startsWith("/register")) {


        if (!auth) {
            return NextResponse.redirect(new URL("/register", request.url))
        }


        if (!profile) {

            return NextResponse.redirect(new URL("/register/onboarding", request.url))

        }



    }



    // if a signed up user tries to access /register or /register/onboarding
    // send the back to /chat

    if (profile) {

        if (pathname.startsWith("/register")) {
            return NextResponse.redirect(new URL("/chat", request.url));
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

