import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from './app/api/auth/[...nextauth]/route';

// This function can be marked `async` if using `await` inside
export default async function proxy(request: NextRequest) {

    const session = await getServerSession(authOptions);
    const pathname: string = request.nextUrl.pathname;

  
    // run only if pathname doesent start with register !

    if (!pathname.startsWith("/register")) {


        if (!session?.user) {
            // if session doesent exist then:
            return NextResponse.redirect(new URL("/register", request.url));
        }

        if (!session?.user?.username) {

            // if session exists but username doesent exist: 
            return NextResponse.redirect(new URL("/register/onboarding", request.url));
        }
    }

    if (pathname.startsWith("/register")) {


        if (session?.user.username) {

            // if an already onboarded (registered) user has tried to access
            // /register or /register/onboarding,redirect the user to "/"
            return NextResponse.redirect(new URL("/", request.url));
        }

    }

    //     // if session.user.username doesent exist, go back to register page !

    //     if(!session?.user?.username){
    //         return NextResponse.redirect(new URL("/register", request.url));
    //     }
    // }










    return NextResponse.next();
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
    ],
}

