import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video, { IVideo } from "@/models/Video";

export async function GET() { // get all the videos from the database as an array and pass them on
  try {
    await connectToDatabase(); 
    const videos = await Video.find({}).sort({ createdAt: -1 }).lean(); // finding all the videos ans sort them in descending order based on createdAt 
    /*
    The .lean() method in Mongoose changes the result of your query from Mongoose documents to plain JavaScript objects.

What does this mean?
Without .lean():

Video.find() returns Mongoose documents.
These documents have extra methods and getters/setters (like .save(), virtuals, etc.).
Slightly heavier in memory and slower to serialize.
With .lean():

Returns plain JavaScript objects (POJOs), not Mongoose documents.
No extra Mongoose methods or overhead.
Faster and lighter, especially when you only need to read and send data (like in an API response).
Why use .lean() here?
You are just fetching videos to send as JSON to the client.
You don’t need to modify or save these documents.
Using .lean() improves performance and reduces memory usage.
    */

    if (!videos || videos.length === 0) { // sending empty array if no videos in the array
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions); 

    if (!session) { // allowing only those who are loggedIn
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body: IVideo = await request.json();
    /*
    Reads the incoming HTTP request body (from a POST request, typically sent as JSON from the frontend).
Parses the JSON content of the request body into a JavaScript object.
Type-annotates the resulting object as IVideo (from your models/Video.ts), which means TypeScript will treat body as having the structure:
title: string
description: string
videoUrl: string
thumbnailUrl: string
controls?: boolean
transformation?: { height: number; width: number; quality?: number }
(and optional _id, createdAt, updatedAt)
Purpose:
This allows you to safely access properties like body.title, body.videoUrl, etc., with TypeScript type checking and autocompletion.
It is used to validate and process the incoming video data before saving it to the database.
    */

    // Validate required fields
    if (
      !body.title ||
      !body.description ||
      !body.videoUrl ||
      !body.thumbnailUrl
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new video with default values
    const videoData = {
      ...body,
      controls: body.controls ?? true,
      transformation: {
        height: 1920,
        width: 1080,
        quality: body.transformation?.quality ?? 100,
      },
    };

    const newVideo = await Video.create(videoData);
    /*
    Video.create(videoData):
Uses the Mongoose Video model to create a new document in the MongoDB videos collection.
videoData is an object containing all the necessary fields for a video (title, description, videoUrl, thumbnailUrl, controls, transformation, etc.).
Mongoose validates the data against your schema, applies defaults (like timestamps), and saves the new document to the database.
await:
Waits for the database operation to complete.
newVideo will be the newly created video document, including any auto-generated fields (like _id, createdAt, updatedAt).
    */

    return NextResponse.json(newVideo);
    /*
    Creates an HTTP response with the new video document serialized as JSON.
Sends this response back to the client (e.g., your frontend), so the client immediately receives all the details of the newly created video.
    */

  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}