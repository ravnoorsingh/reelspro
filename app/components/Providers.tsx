"use client";

import { SessionProvider } from "next-auth/react";
import { ImageKitProvider } from "imagekitio-next";
import { NotificationProvider } from "./Notification";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY!;

export default function Providers({ children }: { children: React.ReactNode }) {
  const authenticator = async () => {
    try {
      const res = await fetch("/api/imagekit-auth");
      if (!res.ok) throw new Error("Failed to authenticate");
      return res.json();
    } catch (error) {
      console.error("ImageKit authentication error:", error);
      throw error;
    }
  };

  return (
    <SessionProvider refetchInterval={5 * 60}>
      <NotificationProvider>
        <ImageKitProvider
          publicKey={publicKey}
          urlEndpoint={urlEndpoint}
          authenticator={authenticator}
        >
          {children}
        </ImageKitProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}

/*
"use client";:
Marks this file as a client component, allowing the use of hooks and browser APIs.
SessionProvider:
From NextAuth. Provides authentication/session context to your app, making useSession() and related hooks work.
ImageKitProvider:
From the imagekitio-next package. Provides context and configuration for uploading and displaying images/videos via ImageKit.
NotificationProvider:
Your custom provider for showing notifications (toasts, alerts, etc.) across the app.

urlEndpoint:
The base URL for your ImageKit media assets (public, safe to expose).
publicKey:
The public API key for ImageKit (also safe to expose).
!:
TypeScript non-null assertion; throws an error if the variable is not defined.

 Providers Component
A wrapper component that will be used in your app’s layout to provide global context to all child components.

ImageKit Authenticator Function
Purpose:
Provides a function for the ImageKitProvider to fetch authentication parameters from your backend.
How it works:
Sends a GET request to /api/imagekit-auth (your custom API route).
Checks the response: If not OK, throws an error.
Returns the JSON: The authentication parameters (token, expire, signature, etc.) needed for secure client-side uploads.
Error handling: Logs and rethrows any errors.
Why?:
ImageKit requires a server-generated signature for secure uploads. This function ensures the client never sees your private key, only the signature.

Provider Composition
SessionProvider:
Wraps the app, enabling authentication/session context everywhere.
refetchInterval={5 * 60}: Refreshes the session every 5 minutes to keep it up-to-date.
NotificationProvider:
Wraps the app, enabling global notifications (toasts, alerts, etc.).
ImageKitProvider:
Wraps the app, enabling direct uploads and optimized media delivery via ImageKit.
Receives the publicKey, urlEndpoint, and the authenticator function.
{children}:
All child components (i.e., your entire app) will have access to these contexts.
Behind the Scenes & Project Integration
Authentication:
Any component can use NextAuth hooks (useSession, etc.) to check if a user is logged in, get user info, etc.
Notifications:
Any component can trigger notifications via the NotificationProvider context.
ImageKit Uploads:
Any component can upload files to ImageKit. When an upload is initiated, ImageKitProvider calls the authenticator function, which fetches a secure signature from your backend (/api/imagekit-auth). This allows secure, direct uploads from the browser without exposing your private key.
Scalability:
By centralizing these providers, you ensure all parts of your app have access to authentication, notifications, and media upload capabilities, making your app modular and maintainable.


Authentication/session state (via NextAuth)
Notifications (via your custom NotificationProvider)
ImageKit upload and media context (via ImageKitProvider)
By wrapping your app with these providers, you enable powerful features (auth, notifications, uploads) everywhere in your component tree, without needing to set them up in every individual file.

essionProvider
Purpose: Makes authentication/session data available throughout your app.
How:
Enables hooks like useSession() and getSession() anywhere in your app.
refetchInterval={5 * 60} means the session will be refreshed every 5 minutes, keeping user data up-to-date.

NotificationProvider
Purpose: Makes notification functionality (toasts, alerts, etc.) available globally.
How:
Any component can trigger notifications using this context, ensuring a consistent user experience for feedback and alerts.

ImageKitProvider
Purpose: Enables secure, direct uploads and optimized media delivery via ImageKit.
How:
publicKey and urlEndpoint:
These are public configuration values for your ImageKit account, used for uploads and media URLs.
authenticator:
This is an async function that fetches secure upload authentication parameters from your backend (/api/imagekit-auth).
It ensures that uploads are authorized and your private key is never exposed to the client.
When a user uploads a file, ImageKitProvider calls this function to get the necessary credentials for a secure upload.

Children
Purpose:
All your app’s pages and components are rendered inside these providers, so they inherit the context and functionality.

Behind the Scenes
Authentication:
Any component can check if a user is logged in, get user info, or trigger login/logout using NextAuth hooks.
Notifications:
Any component can show a toast or alert, e.g., after a successful upload or error.
ImageKit Uploads:
When a user uploads a file, the provider fetches a secure signature from your backend, then uploads the file directly to ImageKit, keeping your private key safe and the upload fast.
Why Use This Pattern?
Centralizes configuration:
You only need to set up providers once, not in every page/component.
Enables global features:
Auth, notifications, and uploads are available everywhere.
Keeps code DRY and maintainable:
No repeated setup, easy to update or add new providers.
*/