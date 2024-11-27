import { NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/utils/supabase/middleware";
import logger from "./utils/logger";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  if (url.pathname.startsWith("/zipzap")) {
    return NextResponse.next();
  }

  let hostname = req.headers
    .get("host")
    ?.replace(
      ".local-myphotos.site:3000",
      `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    );

  if (hostname?.includes("gphotos.site")) {
    const newHostname = hostname.replace("gphotos.site", "myphotos.site");
    const searchParams = req.nextUrl.searchParams.toString();
    const path = `${url.pathname}${
      searchParams.length > 0 ? `?${searchParams}` : ""
    }`;

    console.log(
      "redirecting  because",
      hostname,
      "includes gphotos.site",
      hostname.includes("gphotos.site")
    );
    return NextResponse.redirect(new URL(`https://${newHostname}${path}`), {
      status: 301,
    });
  }

  logger.info({ hostname }, "Middleware hostname");

  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // rewrites for app pages
  if (hostname == `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    await updateSession(req);

    if (
      path.startsWith("/sign-") ||
      path.startsWith("/auth") ||
      path.startsWith("/api/")
    ) {
      return NextResponse.next();
    }

    return NextResponse.rewrite(
      new URL(`/app${path === "/" ? "" : path}`, req.url)
    );
  }

  // rewrite everything else to `/[domain]/[slug] dynamic route
  return NextResponse.rewrite(new URL(`/site/${hostname}${path}`, req.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/zipzap/:path*",
  ],
};
