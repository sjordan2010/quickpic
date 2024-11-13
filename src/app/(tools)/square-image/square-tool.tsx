"use client";

import { usePlausible } from "next-plausible";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UploadBox } from "@/components/shared/upload-box";
import { OptionSelector } from "@/components/shared/option-selector";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
  type FileUploaderResult,
  useFileUploader,
} from "@/hooks/use-file-uploader";
import { useEffect, useState } from "react";

function SquareToolCore(props: { fileUploaderProps: FileUploaderResult }) {
  const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;

  const [finalImageContent, setFinalImageContent] = useState<string | null>(null);

  const finalWidth: number = 1284;
  const finalHeight: number = 2778

  useEffect(() => {
    if (imageContent && imageMetadata) {
      // Step 1: Create a 128x128 canvas and resize the image to fit this canvas
      const resizedCanvas = document.createElement("canvas");
      resizedCanvas.width = imageMetadata.width;
      resizedCanvas.height = imageMetadata.height;
      const resizedCtx = resizedCanvas.getContext("2d");
      if (!resizedCtx) return;

      resizedCtx.fillStyle = "transparent";
      resizedCtx.fillRect(0, 0, imageMetadata.width, imageMetadata.height);

      const img = new Image();
      img.onload = () => {
        // Draw the image resized to 128x128 on the off-screen canvas
        resizedCtx.drawImage(img, 0, 0, imageMetadata.width, imageMetadata.height);

        // Step 2: Create the final 1284x2778 canvas
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = finalWidth;
        finalCanvas.height = finalHeight;
        const finalCtx = finalCanvas.getContext("2d");
        if (!finalCtx) return;

        // Fill background with transparency
        finalCtx.fillStyle = "transparent";
        finalCtx.fillRect(0, 0, finalWidth, finalHeight);

        // Center the 128x128 image on the final canvas
        const x = (finalWidth - imageMetadata.width) / 2;
        const y = (finalHeight - imageMetadata.height) / 2;
        finalCtx.drawImage(resizedCanvas, x, y);

        // Save the final image data
        setFinalImageContent(finalCanvas.toDataURL("image/png"));
      };
      img.src = imageContent;
    }
  }, [imageContent, imageMetadata]);

  const handleSaveImage = () => {
    if (finalImageContent && imageMetadata) {
      const link = document.createElement("a");
      link.href = finalImageContent;
      const originalFileName = imageMetadata.name;
      const fileNameWithoutExtension =
        originalFileName.substring(0, originalFileName.lastIndexOf(".")) ||
        originalFileName;
      link.download = `${fileNameWithoutExtension}-1284x2778.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  const plausible = usePlausible();

  if (!imageMetadata) {
    return (
      <UploadBox
        title="Create Splash Screen images with custom backgrounds. Fast and free."
        subtitle="Allows pasting images from clipboard"
        description="Upload Image"
        accept="image/*"
        onChange={handleFileUploadEvent}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6 border-2 border-red-50">
        {finalImageContent && (
        <img src={finalImageContent} alt="Preview" className="mb-4 drop-shadow-lg" />
        )}
        <p className="text-lg font-medium text-white/80">
          {imageMetadata.name}
        </p>
      </div>

      <div className="flex gap-6 text-base">
        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60">Original</span>
          <span className="font-medium text-white">
            {imageMetadata.width} × {imageMetadata.height}
          </span>
        </div>

        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60">Splash Size</span>
          <span className="font-medium text-white">
            {finalWidth} ×{" "}
            {finalHeight}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={cancel}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-red-800"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            plausible("create-square-image");
            handleSaveImage();
          }}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          Save Image
        </button>
      </div>
    </div>
  );
}

export function SquareTool() {
  const fileUploaderProps = useFileUploader();

  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
      dropText="Drop image file"
    >
      <SquareToolCore fileUploaderProps={fileUploaderProps} />
    </FileDropzone>
  );
}
