import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveMedia = mutation({
  args: {
    storageId: v.id("_storage"),
    type: v.union(v.literal("image"), v.literal("video")),
  },
  handler: async (ctx, args) => {
    const createdAt = Date.now();
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    return await ctx.db.insert("media", {
      ...args,
      createdAt,
      uploader: userId,
    });
  },
});


export const deleteMedia = mutation({
  args: {
    mediaId: v.id("media"),
  },
  handler: async (ctx, args) => {
    // Fetch the media document to get the storageId
    const media = await ctx.db.get(args.mediaId);
    if (!media) {
      throw new Error("Media not found");
    }
    // Delete the file from storage
    await ctx.storage.delete(media.storageId);
    // Delete the media document from the database
    await ctx.db.delete(args.mediaId);
  },
});
