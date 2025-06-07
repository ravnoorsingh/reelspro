import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

export async function GET() {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error("ImageKit authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      {
        status: 500,
      }
    );
  }
}

/*
export async function GET():

Defines the handler for HTTP GET requests to /api/imagekit-auth.
In Next.js App Router, this is the new way to define API endpoints.
Inside the handler:

imagekit.getAuthenticationParameters():
Calls the ImageKit SDK to generate a set of authentication parameters (token, expire, signature).
These are needed for secure client-side uploads to ImageKit (the client uses these to prove it’s allowed to upload).
The method uses your private key to generate a signature, so it must run on the server.
return NextResponse.json(authenticationParameters);:
Sends the authentication parameters as a JSON response to the client.
The client can now use these parameters to securely upload files directly to ImageKit.
Error Handling:

If anything goes wrong (e.g., missing env vars, SDK error), it logs the error and returns a 500 Internal Server Error with a generic message.
Behind the Scenes & Project Integration
Why is this endpoint needed?
ImageKit requires a server-generated signature for secure client-side uploads.
The client (browser) requests /api/imagekit-auth, receives the signature, and then uses it to upload files directly to ImageKit without exposing your private key.
Security:
The private key is never sent to the client—only the signature and public key are.
This prevents malicious users from uploading files without your permission.
How does it fit in the project?
When a user wants to upload a video or image, your frontend first calls this endpoint to get the authentication parameters.
Then, the frontend uses these parameters to upload the file directly to ImageKit, bypassing your server for the actual file transfer (faster, more scalable).

*/

/*
Certainly! Here’s how the GET request works in your /api/imagekit-auth API route:

1. Frontend Initiates the Request
When a user wants to upload a file (image or video), your frontend sends a GET request to /api/imagekit-auth.
2. Server Receives the Request
The exported GET function in your API route is triggered by this request.
3. ImageKit Authentication Parameters Generated
The server uses the ImageKit SDK’s getAuthenticationParameters() method.
This method uses your private key (which is only available on the server) to generate a secure set of parameters:
token
expire
signature
These parameters are required by ImageKit to allow secure, direct uploads from the client.
4. Server Responds with JSON
The server sends these authentication parameters back to the frontend as a JSON response using NextResponse.json(authenticationParameters).
5. Frontend Uses the Parameters
The frontend receives the token, expire, and signature.
It uses these parameters to upload the file directly to ImageKit from the browser, without routing the file through your server.
6. Security
The private key is never exposed to the client—only the signature and public key are sent.
This ensures only authorized uploads are allowed, and your credentials remain safe.
*/