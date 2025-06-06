import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!;

if(!MONGODB_URI){
    throw new Error("Please define mongodb uri in env file")
}

let cached = global.mongoose; // look in types.d.ts file
// it is becuase of the tsconfig.json file that file of type types.d.ts are getting included without importing
// in tsconfig.json there is  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"], whuch is making this possible

if(!cached){ // if cache does not exist then make a new one with conn and promise as null
    cached = global.mongoose = {conn: null, promise: null};
}

export async function connectToDatabase() {
    if(cached.conn){ // if connection already exists then return that
        return cached.conn;
    }

    if(!cached.promise){ // if promise does not exist then make a new one
        const opts = {
            bufferCommands: true, // enable mongoose's buffering of commands
            maxPoolSize: 10, // set the maximum pool size to 10 i.e. maximum number of connections to mongoDB can be 10
        };

        cached.promise = mongoose
        .connect(MONGODB_URI, opts)
        .then(() => mongoose.connection);
    }
    
    // if promise exists then wait for it to resolve 
    // as soon as the connection is established, it will be stored in cached.conn and returned
    try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  } 

  return cached.conn;
}
