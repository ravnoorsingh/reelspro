import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import User from "@/models/User";
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "text"},
                password: {label: "Password", type: "password"}
            },
            async authorize(credentials){
                if(!credentials?.email || !credentials?.password){
                    throw new Error("Missing email or password")
                }

                try {
                    await connectToDatabase()
                    const user = await User.findOne({email: credentials.email})

                    if(!user){
                        throw new Error("No User found");
                    }

                    // if user is found then checking it's password
                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                     if (!isValid) {
                        throw new Error("Invalid password");
                    }
                    return { // all these properties will be available in the session
                        id: user._id.toString(), // converting mongoose ObjectId to string
                        email: user.email,
                    };
                    
                } catch (error) {
                    console.error("Auth error:", error);
                    throw error;
                }
            }
        })
    ],
    callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
}

/*
Callbacks in NextAuth are special functions that let you control and customize the authentication flow at various stages, such as when a JWT is created or when a session is checked. They allow you to add, modify, or remove data from tokens and sessions.

async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
  }
  return token;
}

What does it do?
This callback runs whenever a JWT (JSON Web Token) is created or updated.
If a user object is present (which happens right after a successful login), it adds the user's id to the JWT token.
On subsequent requests, only the token is available (not user), so it just returns the token as-is.
Why is this needed?
By default, NextAuth only puts a few fields (like email) in the JWT.
If you want to include custom fields (like the user's database _id), you must add them yourself in this callback.
This makes the user's ID available in the token for use in API routes, session callbacks, etc.
Behind the scenes:
After a successful login, NextAuth calls jwt({ token, user }) with both arguments.
The returned token is then signed and sent to the client as a cookie or in the Authorization header.
On future requests, only the token is available (no user), so the callback just returns the token.


async session({ session, token }) {
  if (session.user) {
    session.user.id = token.id as string;
  }
  return session;
}


Why is this needed?
By default, the session object sent to the client does not include the user's database ID.
If you want to use the user's ID in your frontend (for API calls, UI logic, etc.), you must add it to the session in this callback.
Behind the scenes:
When a client requests the session (e.g., via useSession()), NextAuth decodes the JWT and calls session({ session, token }).
The callback copies the id from the token to the session's user object.
The session object is then returned to the client, now including user.id.

*/

