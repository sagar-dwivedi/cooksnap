'use client'

import { PostCard } from "@/components/post/PostCard";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function Home() {
  const { isLoading, loadMore, results, status } = usePaginatedQuery(
    api.recipes.getRecentPosts,
    {},
    { initialNumItems: 50 }
  );

  return (
    <div className="max-w-xl mx-auto">
      {/* Posts feed */}
      <div className="space-y-6 pb-6">
        {results?.map((post) => <PostCard key={post._id} post={post} />)}
      </div>
    </div>
  );
}
