import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  const authRoutes = ["/login", "/register"];

  const isAuthRoute = authRoutes.includes(pathname);
  const isProtectedRoute =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/groups");

  // لو عامل login ورايح login تاني
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // لو مش عامل login ورايح route محمي
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/groups/:path*"],
};
