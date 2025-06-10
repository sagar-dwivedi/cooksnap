"use client";

import { PostCard } from "@/components/post/PostCard";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Mock data moved to a separate file would be better in a real app
const initialPosts = [
  {
    id: 1,
    type: "image",
    media: ["https://source.unsplash.com/random/800x600?sig=1"],
    user: {
      name: "cookmaster",
      avatar: "https://i.pravatar.cc/40?u=cookmaster",
      verified: true,
    },
    caption:
      "Just baked this fresh sourdough 🥖✨ #baking #sourdough #homemade",
    likes: 1243,
    timestamp: "2 HOURS AGO",
    location: "San Francisco, CA",
  },
  {
    id: 2,
    type: "carousel",
    media: [
      "https://source.unsplash.com/random/800x600?sig=2",
      "https://source.unsplash.com/random/800x600?sig=3",
      "https://source.unsplash.com/random/800x600?sig=4",
    ],
    user: {
      name: "mealqueen",
      avatar: "https://i.pravatar.cc/40?u=mealqueen",
      verified: false,
    },
    caption:
      "Swipe to see my 3-day meal prep 🍱🔥 #mealprep #healthyeating #fitness",
    likes: 892,
    timestamp: "5 HOURS AGO",
  },
  {
    id: 3,
    type: "video",
    media: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    user: {
      name: "veganvibes",
      avatar: "https://i.pravatar.cc/40?u=veganvibes",
      verified: true,
    },
    caption:
      "Quick tofu stir fry recipe 🌱🎥 Takes only 15 minutes! #vegan #quickrecipes #plantbased",
    likes: 2456,
    timestamp: "1 DAY AGO",
  },
  // ... rest of your posts with enhanced data
];

// Simulate API fetch
const fetchPosts = async (page: number, limit: number = 3) => {
  // In a real app, this would be an actual API call
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

  const startIdx = (page - 1) * limit;
  const endIdx = startIdx + limit;
  return initialPosts.slice(startIdx, endIdx);
};

export default function Home() {
  const [posts, setPosts] = useState(initialPosts.slice(0, 3));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newPosts = await fetchPosts(page + 1);
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadMoreRef.current) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    observer.current.observe(loadMoreRef.current);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore]);

  return (
    <div className="max-w-xl mx-auto">
      {/* Stories bar placeholder - common in social apps */}
      <div className="bg-background border-b border-muted p-4 overflow-x-auto">
        <div className="flex space-x-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-muted"></div>
                </div>
              </div>
              <span className="text-xs truncate w-16 text-center">
                user_{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts feed */}
      <div className="space-y-6 pb-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {/* Loading indicator or end of feed */}
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more posts...</span>
            </div>
          ) : !hasMore ? (
            <div className="text-center text-muted-foreground">
              You've reached the end of your feed
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
