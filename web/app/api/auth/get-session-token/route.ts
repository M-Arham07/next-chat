import { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";


export async function GET(request: NextApiRequest): Promise<NextResponse<string>> {


    const cookieStore = await cookies();

    const cookieName = process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token";

    const sessionToken = cookieStore?.get(cookieName)?.value ?? "";

    return NextResponse.json(sessionToken, { status: sessionToken ? 200 : 403 });





}