import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "./src/middleware/auth";

const protectedRoutes = [
  "/api/cart",
  "/api/orders",
  "/api/wishlist",
  "/api/auth/profile",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the current path is one of the protected API routes
  if (protectedRoutes.some((route) => path.startsWith(route))) {
    return authMiddleware(async (req: NextRequest) => {
      // If authMiddleware passes, continue to the next handler
      return NextResponse.next();
    })(request);
  }

  // For non-protected routes, just continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all API routes under /api, but exclude specific non-protected auth routes if any
    // For example, you might want to exclude /api/auth/login and /api/auth/register
    // For now, it will apply to all defined protectedRoutes
    "/api/cart/:path*",
    "/api/orders/:path*",
    "/api/wishlist/:path*",
    "/api/auth/profile/:path*",
  ],
};
