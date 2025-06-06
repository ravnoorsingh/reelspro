import { Connection } from "mongoose"

declare global { // declaring a global variable
    var mongoose:{  // either the connection with db has been made using 'conn' or I have the promise thaht the connection is being made using 'promise:Promise' or not made when i get 'promise:null'
        conn: Connection | null
        promise: Promise<Connection> | null
    }
}

export {};

// it is becuase of the tsconfig.json file that file of type types.d.ts are getting included without importing
// in tsconfig.json there is  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"], whuch is making this possible