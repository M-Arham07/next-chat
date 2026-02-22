import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest): Promise<NextResponse<string>> {


    const cookieStore = await cookies();

    

    const cookieName = process.env.VERCEL ? "__Secure-next-auth.session-token" : "next-auth.session-token";

    const sessionToken = cookieStore?.get(cookieName)?.value ?? "";



    return NextResponse.json(sessionToken, { status: sessionToken ? 200 : 403 });





}