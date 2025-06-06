import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!;
/*
mongoose: The main ODM (Object Data Modeling) library for MongoDB in Node.js/TypeScript.
MONGODB_URI: Reads the MongoDB connection string from your environment variables (.env). The ! asserts it must be defined.
*/

if(!MONGODB_URI){
    throw new Error("Please define mongodb uri in env file")
}
// Purpose: Ensures you have set the MONGODB_URI in your .env file. If not, the app throws an error and refuses to start, preventing runtime connection errors

let cached = global.mongoose; // look in types.d.ts file
// it is becuase of the tsconfig.json file that file of type types.d.ts are getting included without importing
// in tsconfig.json there is  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"], whuch is making this possible

/*
Why cache?
In Next.js (especially with hot reloading and serverless environments), modules can be re-imported multiple times.
If you create a new DB connection every time, you’ll quickly exhaust your connection pool and hit MongoDB limits.
How?
Uses a global variable (global.mongoose) to store the connection and the promise for an ongoing connection.
If it doesn’t exist, initializes it with {conn: null, promise: null}.
TypeScript Note:
The type for global.mongoose is defined in your types.d.ts file, and is automatically included by your tsconfig.json.
*/

if(!cached){ // if cache does not exist then make a new one with conn and promise as null
    cached = global.mongoose = {conn: null, promise: null};
}

export async function connectToDatabase() {
    if(cached.conn){ // if connection already exists then return that
        return cached.conn;
    }
    /*
    Purpose:
This is the main function you import and call in your API routes or server components to ensure a MongoDB connection.
First check:
If a connection already exists (cached.conn), return it immediately (no new connection is made).
    */

    if(!cached.promise){ // if promise does not exist then make a new one
        const opts = {
            bufferCommands: true, // enable mongoose's buffering of commands
            maxPoolSize: 10, // set the maximum pool size to 10 i.e. maximum number of connections to mongoDB can be 10
        };

        /*
        1. bufferCommands: true
What it does:
When bufferCommands is true, Mongoose will queue up (buffer) any database operations you try to perform before the connection to MongoDB is fully established.
Why it’s useful:
In serverless or hot-reloading environments (like Next.js), your code might try to interact with the database before the connection is ready.
With buffering enabled, those operations are not lost—they are executed as soon as the connection is available.
Example:
If you call UserModel.find() before the connection is open, Mongoose will wait and run the query once the connection is established, instead of throwing an error.
2. maxPoolSize: 10
What it does:
Sets the maximum number of concurrent connections (sockets) that Mongoose will keep open to your MongoDB server.
Why it’s useful:
In development (with hot reload) or in serverless environments, you can easily open too many connections, which can:
Exhaust your MongoDB Atlas/free tier connection limit.
Cause performance issues or errors.
By setting maxPoolSize: 10:
You ensure that at most 10 concurrent connections are used per serverless function instance or process, which is usually enough for most small/medium apps and prevents accidental overload.
Summary Table
Option	Purpose
bufferCommands	Prevents errors by queuing DB operations until the connection is ready
maxPoolSize: 10	Limits the number of concurrent DB connections to avoid overload and resource exhaustion
In short:
These options make your app more robust and production-ready by handling connection timing issues (bufferCommands) and preventing too many open connections (maxPoolSize). This is especially important in Next.js and serverless environments.


        */

        cached.promise = mongoose
        .connect(MONGODB_URI, opts)
        .then(() => mongoose.connection);
    }

    /*
    If no connection is in progress (cached.promise is null):
Options:
bufferCommands: true: Mongoose will buffer commands until the connection is established.
maxPoolSize: 10: Limits the number of concurrent connections to MongoDB to 10.
Start connecting:
Calls mongoose.connect(MONGODB_URI, opts), which returns a promise.
When resolved, stores the actual connection in cached.promise
    */
    
    // if promise exists then wait for it to resolve 
    // as soon as the connection is established, it will be stored in cached.conn and returned

    try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  } 

  /*
  If a connection is in progress (cached.promise exists), waits for it to finish.
On success:
Stores the resolved connection in cached.conn.
Returns the connection.
On error:
Resets cached.promise to null so future attempts can try again.
Throws the error up the stack.
  */

  return cached.conn;
}

/*
Behind the Scenes & Project Integration
Why is this needed?
In Next.js (especially with the App Router and serverless functions), your API routes and server components can be reloaded or re-invoked many times.
Without this caching, you’d create a new MongoDB connection on every request, quickly exhausting your pool and causing errors.
How does it work in the project?
Every time you need to access the database (e.g., in an API route), you call await connectToDatabase().
The first call creates the connection; subsequent calls reuse it.
This pattern is recommended by both the Next.js and Mongoose communities for serverless and hot-reloading environments.
*/
