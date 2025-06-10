'use client';

import { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  VolumeX,
  Verified,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PostCard({
  post,
}: {
  post: {
    id: number;
    type: "image" | "carousel" | "video";
    media: string[];
    user?: {
      name: string;
      avatar: string;
      verified?: boolean;
    };
    caption?: string;
    likes?: number;
    timestamp?: string;
    location?: string;
  };
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDoubleTapped, setIsDoubleTapped] = useState(false);
  const lastTapRef = useRef(0);

  // Handle swipe gestures for carousel
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((i) => (i + 1 < post.media.length ? i + 1 : i));
  };

  const prevSlide = () => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      setIsDoubleTapped(true);
      setTimeout(() => setIsDoubleTapped(false), 1000);
    }
  };

  const toggleSave = () => setIsSaved(!isSaved);
  const toggleMute = () => setIsMuted(!isMuted);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatLikes = (count: number) => {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "M";
    if (count >= 1_000) return (count / 1_000).toFixed(1) + "K";
    return count.toString();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide();
    }

    if (touchStart - touchEnd < -50) {
      prevSlide();
    }
  };

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    if (tapLength < 300 && tapLength > 0) {
      toggleLike();
    }
    lastTapRef.current = currentTime;
  };

  // Accessibility: Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (post.type === "carousel" && post.media.length > 1) {
        if (e.key === "ArrowRight") nextSlide();
        if (e.key === "ArrowLeft") prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  return (
    <article className="w-full max-w-xl mx-auto rounded-xl border border-muted bg-background overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={post.user?.avatar || `https://i.pravatar.cc/40?u=${post.id}`}
              alt={`${post.user?.name || 'User'} avatar`}
              className="w-10 h-10 rounded-full object-cover border border-muted"
              width={40}
              height={40}
              loading="lazy"
            />
            {post.user?.verified && (
              <Verified className="absolute -bottom-1 -right-1 w-4 h-4 text-blue-500 bg-background rounded-full" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold text-foreground">
                {post.user?.name || `user_${post.id}`}
              </p>
            </div>
            {post.location && (
              <p className="text-xs text-muted-foreground">{post.location}</p>
            )}
          </div>
        </div>
        <button
          aria-label="More options"
          className="text-muted-foreground hover:text-foreground transition p-1 rounded-full hover:bg-muted"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Media */}
      <div
        className="relative w-full aspect-square bg-muted overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {post.type === "video" ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={post.media[0]}
              className="w-full h-full object-cover"
              loop
              muted={isMuted}
              playsInline
              onClick={togglePlay}
              aria-label="Post video"
            />
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              <Play
                className={`w-8 h-8 text-white ${isPlaying ? 'hidden' : 'block'}`}
              />
            </button>
            <button
              onClick={toggleMute}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        ) : (
          <>
            <img
              src={post.media[currentIndex]}
              alt={`Post content ${currentIndex + 1} of ${post.media.length}`}
              className="w-full h-full object-cover select-none"
              width={1080}
              height={1080}
              loading="lazy"
              onClick={handleDoubleTap}
              onTouchEnd={handleDoubleTap}
            />
            {/* Double tap like animation */}
            {isDoubleTapped && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Heart className="w-24 h-24 text-white opacity-0 animate-ping fill-white" />
              </div>
            )}
            {post.type === "carousel" && post.media.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all transform hover:scale-110",
                    currentIndex === 0 && "opacity-0 pointer-events-none"
                  )}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all transform hover:scale-110",
                    currentIndex === post.media.length - 1 &&
                      "opacity-0 pointer-events-none"
                  )}
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {post.media.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        i === currentIndex ? "bg-white w-4" : "bg-white/50"
                      )}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLike}
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <Heart
              className={cn(
                "w-6 h-6 transition-all",
                isLiked
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-muted-foreground hover:text-foreground"
              )}
            />
          </button>
          <button
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Comment on post"
          >
            <MessageCircle className="w-6 h-6 text-muted-foreground hover:text-foreground" />
          </button>
          <button
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Share post"
          >
            <Send className="w-6 h-6 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
        <button
          onClick={toggleSave}
          className="p-1 rounded-full hover:bg-muted transition-colors"
          aria-label={isSaved ? "Remove from saved" : "Save post"}
        >
          <Bookmark
            className={cn(
              "w-6 h-6 transition-all",
              isSaved
                ? "fill-foreground text-foreground scale-105"
                : "text-muted-foreground hover:text-foreground"
            )}
          />
        </button>
      </div>

      {/* Likes */}
      {post.likes && (
        <p className="px-4 text-sm font-semibold text-foreground">
          {formatLikes(isLiked ? post.likes + 1 : post.likes)} likes
        </p>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="px-4 mt-1 text-sm text-foreground">
          <span className="font-semibold mr-2">
            {post.user?.name || "user"}
          </span>
          <span className={showFullCaption ? "" : "line-clamp-2"}>
            {post.caption}
          </span>
          {post.caption.length > 100 && (
            <button
              onClick={() => setShowFullCaption((prev) => !prev)}
              className="ml-2 text-muted-foreground text-xs hover:underline focus:underline"
              aria-label={showFullCaption ? "Show less" : "Show more"}
            >
              {showFullCaption ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {/* Timestamp */}
      <p className="px-4 py-3 text-xs uppercase text-muted-foreground tracking-wide">
        {post.timestamp || "Just now"}
      </p>
    </article>
  );
}