import { getAuthUserId } from "@convex-dev/auth/server";
import { getAll } from "convex-helpers/server/relationships";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const createRecipe = mutation({
  args: {
    title: v.string(),
    caption: v.optional(v.string()),
    ingredients: v.array(v.string()),
    steps: v.array(v.string()),
    mediaIds: v.array(v.id("media")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.insert("posts", { ...args, author: userId });
  },
});

export const getRecentPosts = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    // Paginate posts using an index for efficiency
    const results = await ctx.db
      .query("posts")
      .order("desc")
      .paginate(args.paginationOpts);

    // Gather all media, author, and post IDs from the page
    const allMediaIds = results.page.flatMap((post) => post.mediaIds);
    const allAuthorIds = results.page.map((post) => post.author);
    const allPostIds = results.page.map((post) => post._id);

    // Fetch all media and author documents in bulk
    const [mediaDocs, authorDocs] = await Promise.all([
      getAll(ctx.db, allMediaIds),
      getAll(ctx.db, allAuthorIds),
    ]);

    // Map IDs to documents for quick lookup
    const mediaMap = new Map(allMediaIds.map((id, i) => [id, mediaDocs[i]]));
    const authorMap = new Map(allAuthorIds.map((id, i) => [id, authorDocs[i]]));

    // Fetch all comments and likes for these posts
    const commentsByPost: Record<Id<"posts">, any> = {};
    const likesByPost: Record<Id<"posts">, any> = {};

    await Promise.all(
      allPostIds.map(async (postId) => {
        const [comments, likes] = await Promise.all([
          ctx.db
            .query("comments")
            .withIndex("by_postId", (q) => q.eq("postId", postId))
            .collect(),
          ctx.db
            .query("likes")
            .withIndex("by_postId", (q) => q.eq("postId", postId))
            .collect(),
        ]);

        commentsByPost[postId] = comments;
        likesByPost[postId] = likes;
      })
    );

    // Build the final page, handling missing authors/media gracefully
    const pageWithExtras = await Promise.all(
      results.page.map(async (post) => {
        // Get media URLs for this post
        const mediaUrls = await Promise.all(
          post.mediaIds.map(async (mediaId) => {
            const mediaDoc = mediaMap.get(mediaId);
            if (!mediaDoc) return null;
            return {
              url: await ctx.storage.getUrl(mediaDoc.storageId),
              type: mediaDoc.type,
            };
          })
        );

        const authorInfo = authorMap.get(post.author);
        if (!authorInfo) {
          throw new ConvexError({
            message: "Author not found",
            postId: post._id,
          });
        }

        // Exclude 'author' and 'mediaIds'
        const { author, mediaIds, ...rest } = post;
        const { image, name } = authorInfo;

        return {
          ...rest,
          mediaUrls: mediaUrls.filter(Boolean),
          image,
          name,
          comments: commentsByPost[post._id] ?? [],
          likes: likesByPost[post._id] ?? [],
        };
      })
    );

    return {
      ...results,
      page: pageWithExtras,
    };
  },
});
