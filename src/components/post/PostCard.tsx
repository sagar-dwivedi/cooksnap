"use client";

import { api } from "@/_generated/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FunctionReturnType } from "convex/server";
import {
  Bookmark,
  ChefHat,
  Clock,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// Post type definition
type Post = FunctionReturnType<typeof api.recipes.getRecentPosts>["page"][0];

export function PostList({
  posts,
}: {
  posts: FunctionReturnType<typeof api.recipes.getRecentPosts>["page"];
}) {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const timeAgo = getTimeAgo(new Date(post._creationTime));

  const likes = post.likes ?? 0;
  const author = { name: post.name ?? "Anonymous" };
  const description = post.caption ?? "";
  const comments = post.comments?.length ?? 0;

  return (
    <article className="rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10">
            <Image
              src={post.image ?? "/default-avatar.png"}
              alt={author.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{author.name}</h3>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Media Carousel */}
      {post.mediaUrls?.length > 0 && (
        <Carousel className="w-full">
          <CarouselContent>
            {post.mediaUrls.map((media, idx) => (
              <CarouselItem
                key={idx}
                className="overflow-hidden rounded-none md:rounded-xl"
              >
                {media?.type === "image" ? (
                  <div className="relative aspect-square w-full">
                    <Image
                      src={media.url ?? ""}
                      alt={post.name ?? "Post image"}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : media?.type === "video" ? (
                  <div className="aspect-video w-full">
                    <video
                      src={media.url ?? ""}
                      className="w-full h-full object-cover"
                      controls
                    />
                  </div>
                ) : null}
              </CarouselItem>
            ))}
          </CarouselContent>
          {post.mediaUrls.length > 1 && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`transition-colors ${
                isLiked ? "text-red-500" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              <MessageCircle size={24} />
            </button>
            <button className="text-gray-700 hover:text-gray-900 transition-colors">
              <Share size={24} />
            </button>
          </div>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`transition-colors ${
              isSaved ? "text-gray-900" : "text-gray-700 hover:text-gray-900"
            }`}
          >
            <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Likes */}
        <div className="mb-2">
          <span className="font-semibold text-sm">
            {likes + (isLiked ? 1 : 0)} likes
          </span>
        </div>

        {/* Caption */}
        <div className="mb-3 text-sm">
          <span className="font-semibold mr-2">{author.name}</span>
          <span>{description}</span>
        </div>

        {/* Recipe Info */}
        <div className="flex items-center space-x-4 mb-3 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>30 min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={14} />
            <span>5 servings</span>
          </div>
        </div>

        {/* View Recipe Button */}
        <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-2 mb-3">
          <ChefHat size={18} />
          <span>View Recipe</span>
        </button>

        {/* View Comments */}
        {comments > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-gray-500 text-sm mb-2 hover:text-gray-700 transition-colors"
          >
            View all {comments} comments
          </button>
        )}

        {/* Sample Comments */}
        {showComments && (
          <div className="space-y-2 border-t pt-3 mt-3">
            <div className="text-sm">
              <span className="font-semibold mr-2">foodlover23</span>
              <span>This looks absolutely delicious! 😍</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold mr-2">homecook_sara</span>
              <span>Can&apos;t wait to try this recipe!</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold mr-2">chef_mike</span>
              <span>
                Pro tip: add a pinch of smoked paprika for extra flavor! 👨‍🍳
              </span>
            </div>
          </div>
        )}

        {/* Add Comment */}
        <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src={post.image ?? "/default-avatar.png"}
              alt="Your avatar"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 text-sm placeholder-gray-500 border-none outline-none bg-transparent"
          />
          <button className="text-blue-500 font-semibold text-sm hover:text-blue-600 transition-colors">
            Post
          </button>
        </div>
      </div>
    </article>
  );
}

// Time-ago formatter
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  return date.toLocaleDateString();
}
