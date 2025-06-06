import mongoose, { Schema, model, models } from "mongoose";
/*
mongoose: The main ODM (Object Data Modeling) library for MongoDB in Node.js/TypeScript. Handles schemas, models, and connections.
Schema: Used to define the structure of documents in a MongoDB collection.
model: Used to create a new model (class) for interacting with a MongoDB collection.
models: An object containing all models defined in the current Mongoose connection. Used to avoid model overwrite errors in hot-reloading/serverless environments.

 */

export const VIDEO_DIMENSIONS = {
  width: 1080,
  height: 1920,
} as const;

/*
VIDEO_DIMENSIONS: An object defining the default width and height for videos.
as const: Ensures the values are treated as immutable literals (TypeScript feature).
Purpose: Used as default values for video transformation, ensuring consistency across the app.
*/

export interface IVideo {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  controls?: boolean;
  transformation?: {
    height: number;
    width: number;
    quality?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

/*
IVideo: TypeScript interface describing the shape of a video document.
_id: MongoDB’s unique identifier for the document (optional, auto-generated).
title: The title of the video (required).
description: The description of the video (required).
videoUrl: The URL where the video is stored (required).
thumbnailUrl: The URL for the video’s thumbnail image (required).
controls: Whether video controls (play, pause, etc.) are shown (optional, defaults to true).
transformation: An object describing video transformation settings (height, width, quality).
*/

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    controls: { type: Boolean, default: true },
    transformation: {
      height: { type: Number, default: VIDEO_DIMENSIONS.height },
      width: { type: Number, default: VIDEO_DIMENSIONS.width },
      quality: { type: Number, min: 1, max: 100 },
    },
  },
  { timestamps: true }
);

/*
videoSchema: Defines the structure and rules for video documents in MongoDB.
title, description, videoUrl, thumbnailUrl: All required string fields.
controls: Boolean, defaults to true (so videos have controls unless specified otherwise).
transformation: An embedded object with:
height: Number, defaults to VIDEO_DIMENSIONS.height (1920).
width: Number, defaults to VIDEO_DIMENSIONS.width (1080).
quality: Number, optional, must be between 1 and 100 if provided.
{ timestamps: true }: Automatically adds and manages createdAt and updatedAt fields for each docu
*/

const Video = models?.Video || model<IVideo>("Video", videoSchema);
/*
Purpose: Prevents model overwrite errors in development or serverless environments where files may be re-imported.
How it works:
models?.Video: Checks if a model named "Video" already exists in the current Mongoose connection.
If it exists, uses the existing model.
If not, creates a new model named "Video" using the videoSchema.
Why?:
In Next.js (especially with hot reloading or serverless functions), importing the same model file multiple times can cause "OverwriteModelError". This pattern avoids that.
*/

export default Video;
/*
Behind the Scenes & Project Integration
Video Upload: When a new video is uploaded, you create a new Video document. The schema ensures all required fields are present and valid.
Video Listing: When fetching videos (e.g., for a feed or user profile), you query the Video model.
Transformation: The transformation field allows you to store and retrieve video display settings (e.g., for responsive playback or optimization).
Database Structure: All videos are stored in the videos collection in MongoDB, with consistent structure and validation.
Hot Reload/Serverless: The model creation pattern ensures your app works reliably in all environments, avoiding common Mongoose errors
*/