import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest): Promise<NextResponse<string>> {

    console.time("GET_SESSION_TOKEN")


    const cookieStore = await cookies();
    

    const cookieName = process.env.VERCEL ? "__Secure-next-auth.session-token" : "next-auth.session-token";

    const sessionToken = cookieStore?.get(cookieName)?.value ?? "";



    console.timeEnd("GET_SESSION_TOKEN")
    return NextResponse.json(sessionToken, { status: sessionToken ? 200 : 403 });



    
  


}