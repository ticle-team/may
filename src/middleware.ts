import { createMiddlewareClient } from '@shaple/auth-helpers-nextjs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Shaple client configured to use cookies
  const shaple = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  await shaple.auth.getSession();

  const {
    data: { user },
    error,
  } = await shaple.auth.getUser();
  if (error || user === null) {
    let callbackUrl = req.nextUrl.href.replace(req.nextUrl.origin, '');
    if (!callbackUrl.startsWith('/')) {
      callbackUrl = '/' + callbackUrl;
    }
    //   redirect to signin page
    return NextResponse.redirect(
      new URL(
        `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        req.url,
      ),
    );
  }

  return res;
}

// Ensure the middleware is only called for relevant paths.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - signin (signin page)
     */
    '/((?!_next/static|_next/image|favicon.ico|signin).*)',
  ],
};
