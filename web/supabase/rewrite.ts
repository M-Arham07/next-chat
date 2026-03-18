import { NextResponse, type NextRequest } from "next/server";

export function rewriteWithCookies(
  request: NextRequest,
  from: NextResponse,
  url: string
) {
  const rewrite = NextResponse.rewrite(new URL(url, request.url), {
    request,
  });

  from.cookies.getAll().forEach((cookie) => {
    rewrite.cookies.set(cookie);
  });

  return rewrite;
}