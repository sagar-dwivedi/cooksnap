import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  posts: defineTable({
    author: v.id("users"),
    title: v.string(),
    caption: v.optional(v.string()),
    ingredients: v.array(v.string()),
    steps: v.array(v.string()),
    mediaIds: v.array(v.id("media")),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_author", ["author"]),
  media: defineTable({
    storageId: v.id("_storage"),
    type: v.union(v.literal("image"), v.literal("video")),
    uploader: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_uploader", ["uploader"])
    .index("by_createdAt", ["createdAt"]),
  comments: defineTable({
    postId: v.id("posts"),
    author: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
  })
    .index("by_postId", ["postId"])
    .index("by_author", ["author"]),
  likes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_postId", ["postId"])
    .index("by_userId", ["userId"]),
});

export default schema;
