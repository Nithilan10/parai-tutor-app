import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const path = req.nextUrl.pathname;

  if (path.startsWith("/api/forums") || path.startsWith("/api/chat/parai")) {
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const needsAuth =
    path.startsWith("/dashboard") ||
    path.startsWith("/profile") ||
    path.startsWith("/forums") ||
    path === "/tutorials/parai-chatbot";

  if (needsAuth && !isAuth) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", `${path}${req.nextUrl.search || ""}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/profile",
    "/profile/:path*",
    "/forums",
    "/forums/:path*",
    "/tutorials/parai-chatbot",
    "/api/forums",
    "/api/forums/:path*",
    "/api/chat/parai",
  ],
};
