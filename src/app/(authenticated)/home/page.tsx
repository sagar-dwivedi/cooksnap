"use client";

import { PostList } from "@/components/post/PostCard";
import { usePaginatedQuery } from "convex/react";
import { Loader2Icon } from "lucide-react";
import { useCallback, useRef } from "react";

import { api } from "@/_generated/api";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const HomePage = () => {
  const { isLoading, loadMore, results, status } = usePaginatedQuery(
    api.recipes.getRecentPosts,
    {},
    { initialNumItems: 10 } // Start with a smaller number for better perceived performance
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting && !isLoading && status === "CanLoadMore") {
        loadMore(20);
      }
    },
    [isLoading, loadMore, status]
  );

  useIntersectionObserver(loadMoreRef, handleIntersect, {
    threshold: 0.1,
    rootMargin: "50px", // Start loading a bit before the element is visible
    enabled: status === "CanLoadMore",
  });

  if (status === "LoadingFirstPage") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2Icon className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <main className="max-w-xl mx-auto py-8 px-4">
      <section className="space-y-8">
        <PostList posts={results} />

        {/* Loading indicator and trigger element */}
        {status === "CanLoadMore" && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isLoading && <Loader2Icon className="animate-spin" size={32} />}
          </div>
        )}

        {/* Show message when all posts are loaded */}
        {status === "Exhausted" && (
          <p className="text-center text-muted-foreground py-8">
            You&apos;ve reached the end
          </p>
        )}
      </section>
    </main>
  );
};

export default HomePage;
