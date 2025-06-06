import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
/*
NextRequest, NextResponse: Next.js types for handling API requests and responses in the App Router.
connectToDatabase: Utility function that ensures a MongoDB connection is established (see lib/db.ts). Handles connection pooling and caching for serverless/hot-reload safety.
User: The Mongoose model for users (see models/User.ts), which includes schema validation and password hashing.
*/

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    /*
    Purpose: Handles HTTP POST requests to /api/auth/register.
request.json(): Parses the incoming JSON body to extract email and password.
     */

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    /*
    Checks: Ensures both email and password are provided.
If missing: Returns a 400 Bad Request with an error message.

     */

    await connectToDatabase();
    /*
    Ensures: A MongoDB connection is established before any DB operations.
Behind the scenes: Uses a global cache to avoid opening multiple connections (see lib/db.ts), which is crucial in serverless and hot-reload environments.
     */

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }
    /*
    Purpose: Prevents duplicate registrations.
How: Looks for an existing user with the same email.
If found: Returns a 400 Bad Request with an error message.
 */

    // if user does not exist, create a new user
    // Note: Password should be hashed before saving in production
    await User.create({
      email,
      password,
    });
    /*
    Creates: A new user document in MongoDB.
Password Security:
The User model’s schema includes a pre-save middleware (see models/User.ts) that automatically hashes the password using bcrypt before saving.
This ensures passwords are never stored in plain text.

    */

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
/*

Behind the Scenes & Project Integration
User Registration Flow:

Frontend sends a POST request with email and password to /api/auth/register.
This handler validates input, ensures a DB connection, checks for duplicates, and creates the user.
The password is automatically hashed before storage (handled by the model).
The user is now stored securely in the users collection in MongoDB.
Security:

Passwords are never stored in plain text.
Duplicate emails are prevented.
All errors are handled gracefully.
Scalability:

The DB connection logic is optimized for Next.js’s serverless/hot-reload environment.
The model creation pattern avoids Mongoose overwrite errors.
Reusability:

The User model and connectToDatabase utility are used throughout your project for authentication, login, and user management.
 */

// in frontend
// const result = fetch("/api/auth/register", {
//     method: "POST",
//     headers: {"Content-Type": "application/json"},
//     body: JSON.stringify({ email, password })
// })

// result.json();