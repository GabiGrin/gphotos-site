import { NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/utils/supabase/middleware";
import logger from "./utils/logger";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  let hostname = req.headers
    .get("host")
    ?.replace(
      ".local-myphotos.site:3000",
      `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    );

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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
