import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";
/*
mongoose: The main ODM (Object Data Modeling) library for MongoDB in Node.js/TypeScript. Handles schemas, models, and connections.
Schema: Used to define the structure of documents in a MongoDB collection.
model: Used to create a new model (class) for interacting with a MongoDB collection.
models: An object containing all models defined in the current Mongoose connection. Used to avoid model overwrite errors in hot-reloading/serverless environments.
bcrypt: Library for hashing passwords securely.
 */

export interface IUser {
  email: string;
  password: string;
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
/*
IUser: TypeScript interface describing the shape of a user document.
email: User’s email (required).
password: User’s hashed password (required).
_id: MongoDB’s unique identifier for the document (optional, auto-generated).
createdAt, updatedAt: Timestamps for when the document was created/updated (optional, auto-managed by Mongoose)
*/

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

/*
userSchema: Defines the structure and rules for user documents in MongoDB.
email: Must be a string, is required, and must be unique (no two users can have the same email).
password: Must be a string and is required.
{ timestamps: true }: Automatically adds and manages createdAt and updatedAt fields.
*/

userSchema.pre("save", async function (next) { // 'pre' used to hash password before saving
  if (this.isModified("password")) { // if the password is modified or being set for the first time
    // 'this' refers to the current document being saved
    // 'isModified' checks if the password field has been changed
    // 'bcrypt.hash' hashes the password with a salt rounds of 10
    this.password = await bcrypt.hash(this.password, 10);
  }
  next(); // if password is not modified, just call next i.e. continue to next middleware or save operation
});

/*
userSchema: Defines the structure and rules for user documents in MongoDB.
email: Must be a string, is required, and must be unique (no two users can have the same email).
password: Must be a string and is required.
{ timestamps: true }: Automatically adds and manages createdAt and updatedAt fields.
*/

const User = models?.User || model<IUser>("User", userSchema);
// model works when we have to create a new model
// models.User checks if the model already exists, if it does, it uses that model, otherwise it creates a new one
// 'models' is an object that contains all the models defined in the application
// 'model' is a function that creates a new model if it does not already exist
// 'User' is the name of the model, it will be used to interact with the 'users' collection in MongoDB
// 'IUser' is the interface that defines the structure of the user document
// 'userSchema' is the schema that defines the structure of the user document in MongoDB


/*

Purpose: Prevents model overwrite errors in development or serverless environments where files may be re-imported.
How it works:
models?.User: Checks if a model named "User" already exists in the current Mongoose connection.
If it exists, uses the existing model.
If not, creates a new model named "User" using the userSchema.
Why?:
In Next.js (especially with hot reloading or serverless functions), importing the same model file multiple times can cause "OverwriteModelError". This pattern avoids that.
 */

export default User;
// Exports the User model so it can be imported and used in your API routes, authentication logic, etc.

/*
Behind the Scenes & Project Integration
User Registration: When a new user signs up, you create a new User document. The password is automatically hashed before saving.
User Login: When logging in, you fetch the user by email and compare the hashed password using bcrypt.compare.
Database Structure: All users are stored in the users collection in MongoDB, with unique emails and securely hashed passwords.
Security: Passwords are never stored in plain text. Even if the database is compromised, passwords remain protected.
Hot Reload/Serverless: The model creation pattern ensures your app works reliably in all environments, avoiding common Mongoose errors.
*/