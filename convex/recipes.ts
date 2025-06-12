import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

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
    const createdAt = Date.now();
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.insert("posts", { ...args, createdAt, author: userId });
  },
});

export const getRecentPosts = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const { page, continueCursor, isDone } = await ctx.db
      .query("posts")
      .withIndex("by_createdAt")
      .order("desc")
      .paginate(args.paginationOpts);

    // For each post, fetch the first media and its URL (if any)
    const postsWithImages = await Promise.all(
      page.map(async (post) => {
        let imageUrl = null;
        if (post.mediaIds?.length) {
          const media = await ctx.db.get(post.mediaIds[0]);
          if (media) {
            imageUrl = await ctx.storage.getUrl(media.storageId);
          }
        }
        return {
          ...post,
          imageUrl,
        };
      })
    );

    return {
      page: postsWithImages,
      continueCursor,
      isDone,
    };
  },
});