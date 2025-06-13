"use client";

import Image from "next/image";
import React, { Dispatch, SetStateAction, useEffect } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type MediaFile = File & { preview: string };

export default function MediaUploader({
  media,
  onMediaChange,
}: {
  media: MediaFile[];
  onMediaChange: Dispatch<SetStateAction<MediaFile[]>>;
}) {
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      media.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [media]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: MediaFile[] = [];
    const processingPromises: Promise<void>[] = [];

    files.forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        console.warn(`Unsupported file type: ${file.type}`);
        return;
      }

      if (isImage) {
        validFiles.push(
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
      } else if (isVideo) {
        const processVideo = async () => {
          try {
            const url = URL.createObjectURL(file);
            const video = document.createElement("video");
            video.preload = "metadata";
            video.src = url;

            await new Promise<void>((resolve, reject) => {
              video.onloadedmetadata = () => {
                if (video.duration <= 10) {
                  validFiles.push(Object.assign(file, { preview: url }));
                } else {
                  alert(
                    `Video "${file.name}" is longer than 10 seconds and was skipped.`
                  );
                }
                resolve();
              };
              video.onerror = () => {
                URL.revokeObjectURL(url);
                reject(
                  new Error(`Failed to load video metadata: ${file.name}`)
                );
              };
            });
          } catch (error) {
            console.error("Error processing video:", error);
          }
        };

        processingPromises.push(processVideo());
      }
    });

    try {
      await Promise.all(processingPromises);
      onMediaChange((prev) => [...prev, ...validFiles]);
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      // Clear the input to allow selecting the same files again
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0 file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {media.length > 0 ? (
        <Carousel className="w-full aspect-square overflow-hidden rounded-2xl shadow-md">
          <CarouselContent>
            {media.map((file, idx) => (
              <CarouselItem key={`${file.name}-${idx}`}>
                {file.type.startsWith("image/") ? (
                  <Image
                    src={file.preview}
                    alt={`Preview ${idx}`}
                    className="w-full h-full object-cover"
                    onLoad={() => URL.revokeObjectURL(file.preview)}
                  />
                ) : (
                  <video
                    src={file.preview}
                    className="w-full h-full object-cover"
                    muted
                    autoPlay
                    loop
                    playsInline
                    controls
                  />
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <div className="w-full aspect-square flex items-center justify-center bg-primary rounded-2xl text-primary-foreground">
          No media uploaded yet
        </div>
      )}
    </div>
  );
}
