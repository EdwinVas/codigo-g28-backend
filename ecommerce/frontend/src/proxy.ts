import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth((req: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (req as any).auth;
  const nextUrl = req.nextUrl;
  const isLoggedIn = !!session;
  const role = session?.user?.role as string | undefined;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isProtectedRoute =
    nextUrl.pathname.startsWith("/cart") ||
    nextUrl.pathname.startsWith("/my-orders") ||
    isAdminRoute;
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
