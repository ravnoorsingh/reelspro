"use client";

import { IKUpload } from "imagekitio-next";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { useState } from "react";
import { Loader2 } from "lucide-react";

/*
"use client";: Marks this as a client component, enabling React hooks and browser APIs.
IKUpload: The main upload component from the ImageKit React SDK, which handles direct uploads to ImageKit from the browser.
IKUploadResponse: Type definition for the response returned by a successful upload.
useState: React hook for managing local component state.
Loader2: An animated spinner icon from the Lucide icon set, used for upload progress indication.
*/

interface FileUploadProps {
  onSuccess: (res: IKUploadResponse) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
}
/*
onSuccess: Callback function called when an upload succeeds, receives the upload response.
onProgress: Optional callback for upload progress, receives a percentage.
fileType: Optional, determines if the upload is for an image or video (defaults to "image").

Purpose
This interface defines the props (inputs) that the FileUpload React component expects to receive from its parent component.

Properties
onSuccess: (res: IKUploadResponse) => void

Required.
A callback function that is called when a file upload completes successfully.
Receives the upload response (res) from ImageKit, which contains details about the uploaded file (like URL, fileId, etc.).
Usage: The parent component can use this to update state, show a success message, or store the uploaded file’s info.
onProgress?: (progress: number) => void

Optional.
A callback function that is called during the upload process to report progress.
Receives a number (progress) representing the percentage of the upload completed (0–100).
Usage: The parent can use this to show a progress bar or spinner.
fileType?: "image" | "video"

Optional.
Specifies whether the upload is for an image or a video.
Defaults to "image" if not provided.
Usage: The component uses this to validate the file type, set accepted file extensions, and choose the upload folder.
Why Use This Interface?
Type safety: Ensures the parent component provides the correct props.
Flexibility: Allows the FileUpload component to be reused for both images and videos, and to notify the parent about upload events.
Clarity: Makes it clear what the component expects and how it communicates with its parent.

*/

export default function FileUpload({
  onSuccess,
  onProgress,
  fileType = "image", // by default
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onError = (err: { message: string }) => {
    setError(err.message);
    setUploading(false);
  };

  const handleSuccess = (response: IKUploadResponse) => {
    console.log("Success", response)
    setUploading(false);
    setError(null);
    onSuccess(response);
  };

  const handleStartUpload = () => {
    setUploading(true);
    setError(null);
  };

  const handleProgress = (evt: ProgressEvent) => {
    if (evt.lengthComputable && onProgress) {
      const percentComplete = (evt.loaded / evt.total) * 100;
      onProgress(Math.round(percentComplete));
    }
  };

  /*
  Function Purpose

This function is called during the file upload process to track and report the progress of the upload.
It receives a ProgressEvent object (evt) from the browser or the upload library.
evt.lengthComputable

Checks if the total size of the upload is known and can be measured.
If lengthComputable is false, you can't reliably calculate progress, so the function does nothing.
onProgress

Checks if the parent component provided an onProgress callback prop.
If not provided, progress updates are ignored.
Calculating Progress

evt.loaded is the number of bytes uploaded so far.
evt.total is the total number of bytes to upload.
(evt.loaded / evt.total) * 100 calculates the percentage of the upload that is complete.
Rounding and Reporting

Math.round(percentComplete) rounds the percentage to the nearest whole number for cleaner UI display.
onProgress(...) calls the parent’s callback with the current progress percentage.
Behind the Scenes in the Project
User Experience:
As the file uploads, this function enables you to show a progress bar or spinner, giving users real-time feedback.
Reusability:
By using a callback, any parent component can decide how to display or use the progress information (e.g., progress bar, percentage text, etc.).
Integration:
This is triggered by the IKUpload component from ImageKit, which emits progress events as the file uploads.
  */

  const validateFile = (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Please upload a valid video file");
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError("Video size must be less than 100MB");
        return false;
      }
    } else {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, or WebP)");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return false;
      }
    }
    return true;
  };

  return (
    <div className="space-y-2">
      <IKUpload
        fileName={fileType === "video" ? "video" : "image"}
        onError={onError}
        onSuccess={handleSuccess}
        onUploadStart={handleStartUpload}
        onUploadProgress={handleProgress}
        accept={fileType === "video" ? "video/*" : "image/*"}
        className="file-input file-input-bordered w-full"
        validateFile={validateFile}
        useUniqueFileName={true}
        folder={fileType === "video" ? "/videos" : "/images"}
      />

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading...</span>
        </div>
      )}

      {error && <div className="text-error text-sm">{error}</div>}
    </div>
  );
}

/*
Behind the Scenes & Project Integration
ImageKitProvider Context:
This component is used inside a context provided by ImageKitProvider (see Providers.tsx), which handles authentication and configuration for uploads.
Secure Uploads:
When a user selects a file, IKUpload uses the authenticator function (from your backend) to get secure upload credentials, ensuring your private key is never exposed.
User Feedback:
The component provides instant feedback for upload progress and errors, improving user experience.
Reusable:
Can be used for both images and videos, with customizable callbacks for success and progress.
 */