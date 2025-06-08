import { IVideo } from "@/models/Video";

export type VideoFormData = Omit<IVideo, "_id">;

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
};

/*
import { IVideo } from "@/models/Video";
Imports the TypeScript interface for a video object, ensuring type safety throughout the API client.
VideoFormData = Omit<IVideo, "_id">;
Defines a type for video form data, omitting the _id field (since new videos won’t have an ID yet).
FetchOptions
Type for options passed to the fetch method, including HTTP method, request body, and headers.
*/


class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: FetchOptions = {} // making default values empty
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  /*
  How the fetch Method Works
Purpose:
Centralizes all API requests to your backend, ensuring consistent error handling, headers, and JSON parsing.
Parameters:
endpoint: The API route (e.g., /videos).
options: HTTP method, body, and headers.
Default Values:
Defaults to GET if no method is specified.
Headers:
Always sends "Content-Type": "application/json" unless overridden.
Request:
Calls the browser’s fetch API, prefixing the endpoint with /api (so /videos becomes /api/videos).
If a body is provided, it’s stringified as JSON.
Error Handling:
If the response is not OK (status code not 2xx), throws an error with the response text.
Response:
Returns the parsed JSON response, typed as T for type safety.

  */

  async getVideos() {
    return this.fetch<IVideo[]>("/videos");
  }

  /*
  Purpose:
Fetches all videos from the backend.
How:
Calls the fetch method with the /videos endpoint.
Returns an array of IVideo objects.
  */

  async getVideo(id: string) {
    return this.fetch<IVideo>(`/videos/${id}`);
  }

  /*
  Purpose:
Fetches a single video by its ID.
How:
Calls the fetch method with /videos/{id}.
Returns a single IVideo object.
  */

  async createVideo(videoData: VideoFormData) {
    return this.fetch<IVideo>("/videos", {
      method: "POST",
      body: videoData,
    });
  }
}

/*
Purpose:
Creates a new video entry in the backend.
How:
Calls the fetch method with /videos, using the POST method and sending the video data as the request body.
Returns the newly created IVideo object.
*/

export const apiClient = new ApiClient();

/*
Behind the Scenes & Project Integration
Centralized API Logic:
All video-related API calls (fetching, creating, etc.) go through this client, ensuring consistency and reducing code duplication.
Type Safety:
By using TypeScript generics and interfaces, you get autocompletion and compile-time checks for all API responses.
Error Handling:
Errors are caught and thrown in a consistent way, making it easier to handle them in your UI.
Integration:
Components/pages can import apiClient and call getVideos, getVideo, or createVideo without worrying about low-level fetch details.
Extensibility:
You can easily add more methods (update, delete, etc.) as your API grows.
*/