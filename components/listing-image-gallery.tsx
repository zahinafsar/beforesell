"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { Button } from "@/components/ui/button";

interface ListingImage {
  id: string;
  url: string;
  order: number;
}

interface ListingImageGalleryProps {
  images: ListingImage[];
  title: string;
  videoUrl?: string | null;
}

export function ListingImageGallery({ images, title, videoUrl }: ListingImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const goToPrevious = () => {
    setVideoOpen(false);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setVideoOpen(false);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {videoOpen && videoUrl ? (
          <>
            <video
              src={videoUrl}
              poster={images[0].url}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="h-full w-full bg-black object-contain"
            >
              Your browser does not support video playback.
            </video>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setVideoOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/65 text-white hover:bg-black/80 hover:text-white"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute inset-0 cursor-zoom-in"
              aria-label="View full size image"
            >
              <Image
                src={images[currentIndex].url}
                alt={`${title} - Image ${currentIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </button>
            {videoUrl && currentIndex === 0 ? (
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                className="group absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3"
                aria-label={`Play video for ${title}`}
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/60 bg-white/95 text-slate-950 shadow-2xl transition-transform group-hover:scale-105 group-focus-visible:scale-105">
                  <Play className="ml-1 h-9 w-9 fill-current" />
                </span>
                {/* <span className="rounded-full bg-black/70 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                  Play video
                </span> */}
              </button>
            ) : null}
          </>
        )}

        {images.length > 1 && !videoOpen && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-sm rounded">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                setVideoOpen(false);
                setCurrentIndex(index);
              }}
              className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
                index === currentIndex
                  ? "border-primary"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
              {videoUrl && index === 0 ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow">
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  </span>
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={currentIndex}
        slides={images.map((image, index) => ({
          src: image.url,
          alt: `${title} - Image ${index + 1}`,
        }))}
        plugins={images.length > 1 ? [Zoom, Counter] : [Zoom]}
        on={{ view: ({ index }) => setCurrentIndex(index) }}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
        carousel={{ finite: images.length <= 1 }}
        render={
          images.length <= 1
            ? { buttonPrev: () => null, buttonNext: () => null }
            : undefined
        }
      />
    </div>
  );
}
