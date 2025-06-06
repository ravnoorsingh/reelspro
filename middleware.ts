import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
/*
withAuth: A helper from NextAuth that wraps your middleware to add authentication/authorization logic to your routes.
NextResponse: Used to create responses in Next.js middleware.
*/

/*
withAuth: Wraps your middleware function to enforce authentication rules.
middleware(): The main middleware function, called for every request that matches the matcher (see below).
NextResponse.next() simply allows the request to continue if authorized.
callbacks.authorized:
This callback determines if the current request is allowed to proceed based on the authentication token and the request path.
*/

export default withAuth( // This middleware function is used to protect routes, This middleware function will only invooke true if the authorized callback returns true
  function middleware() {
    return NextResponse.next(); // This function is called for every request
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow auth-related routes
        if (
          pathname.startsWith("/api/auth") ||
          pathname === "/login" ||
          pathname === "/register"
        ) {
          return true;
        }

        // Public routes
        if (pathname === "/" || pathname.startsWith("/api/videos")) {
          return true;
        }
        // All other routes require authentication
        return !!token;
      },
    },
  }
);

/*
Extracts the pathname from the request URL.
Allows access to authentication-related routes (/api/auth, /login, /register) for everyone, even if not logged in.
Allows access to public routes (/ and /api/videos...) for everyone.
For all other routes:
Returns true if a valid authentication token exists (i.e., the user is logged in).
Returns false (blocks access) if not authenticated.
*/

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};

/*
matcher: Tells Next.js which routes this middleware should run on.
The pattern:
Runs on all routes except:
Static files (_next/static)
Image optimization files (_next/image)
The favicon (favicon.ico)
Anything in the public folder
Why?:
You don’t want to protect or slow down access to static assets or public files.
*/

/*
Behind the Scenes & Project Integration
How it works in your project:
Every request (except static/public assets) passes through this middleware.
The authorized callback checks if the route is public or requires authentication.
If the route is public or the user is authenticated, the request continues.
If not, NextAuth will redirect the user to the login page or return a 401 for API routes.
Why use withAuth?
It automatically handles session/token parsing, redirects, and integrates with your NextAuth configuration.
You only need to specify your access rules in one place.
*/