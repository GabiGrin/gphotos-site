import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Ensure next param is properly sanitized to prevent open redirect vulnerabilities
  const next = searchParams.get("next") ?? "/";
  const sanitizedNext = next.startsWith("/") ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      const redirectUrl = isLocalEnv
        ? `http://app.local-gphotos.site:3000${sanitizedNext}`
        : forwardedHost
          ? `https://${forwardedHost}${sanitizedNext}`
          : `${origin}${sanitizedNext}`;

      console.log({ redirectUrl, origin, forwardedHost, isLocalEnv });
      return NextResponse.redirect(redirectUrl);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
