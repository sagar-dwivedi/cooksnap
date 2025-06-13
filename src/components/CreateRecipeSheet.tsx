"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import MediaUploader from "./MediaUploader";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  caption: z.string().min(1, "Caption is required").max(200),
  ingredients: z.array(
    z.object({
      value: z.string().min(1, "Ingredient can't be empty").max(100),
    })
  ),
  steps: z.array(
    z.object({
      value: z.string().min(1, "Step can't be empty").max(500),
    })
  ),
  tags: z
    .array(
      z.object({
        value: z.string().min(1).max(20),
      })
    )
    .optional(),
});

type RecipeType = z.infer<typeof recipeSchema>;

type MediaFile = File & { preview: string };

export function CreateRecipeDialog() {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);

  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const saveMedia = useMutation(api.media.saveMedia);
  const savePost = useMutation(api.recipes.createRecipe);

  const form = useForm<RecipeType>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      caption: "",
      ingredients: [{ value: "" }],
      steps: [{ value: "" }],
      tags: [{ value: "" }],
    },
  });

  const ingredientArray = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const stepsArray = useFieldArray({
    control: form.control,
    name: "steps",
  });

  const tagsArray = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const getMediaType = (mime: string): "image" | "video" => {
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    throw new Error(`Unsupported media type: ${mime}`);
  };

  const onSubmit = async (data: RecipeType) => {
    try {
      const uploadedMedia: Id<"media">[] = [];

      for (const file of media) {
        const postUrl = await generateUploadUrl();

        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error("Upload to storage failed.");
        }

        const { storageId } = await result.json();

        const mediaType = getMediaType(file.type);

        const mediaId = await saveMedia({
          storageId,
          type: mediaType,
        });

        if (!mediaId) {
          throw new Error("saveMedia returned null or undefined");
        }

        uploadedMedia.push(mediaId);
      }

      await savePost({
        title: data.title,
        caption: data.caption,
        mediaIds: uploadedMedia,
        ingredients: data.ingredients.map((i) => i.value),
        steps: data.steps.map((s) => s.value),
        tags: data.tags?.map((t) => t.value) ?? [],
      });

      setOpen(false);
      form.reset();
      setMedia([]);
    } catch (error) {
      console.error("Error submitting recipe:", error);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      tagsArray.append({ value: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="lg">
          Create
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-2xl p-0 rounded-lg"
        showCloseButton={false}
      >
        <div className="relative">
          <ScrollArea className="h-[80vh] p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">
                Create New Recipe
              </DialogTitle>
              <DialogDescription>
                Share your culinary masterpiece with the community
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Media Upload */}
                <div className="space-y-2">
                  <Label>Recipe Media</Label>
                  <MediaUploader media={media} onMediaChange={setMedia} />
                  <p className="text-sm text-muted-foreground">
                    Upload images or short videos (max 10s) of your dish
                  </p>
                </div>

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipe Title*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Creamy Garlic Parmesan Pasta"
                          className="text-lg font-medium"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Caption */}
                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your dish..."
                          rows={3}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ingredients */}
                <div className="space-y-3">
                  <FormLabel>Ingredients*</FormLabel>
                  <div className="space-y-2">
                    {ingredientArray.fields.map((item, index) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name={`ingredients.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <div className="flex items-center gap-2 w-full">
                              <div className="flex items-start pt-2">
                                <Badge
                                  variant="secondary"
                                  className="h-6 w-6 justify-center flex-shrink-0"
                                >
                                  {index + 1}
                                </Badge>
                              </div>
                              <FormControl>
                                <Input
                                  placeholder={`Add ingredient`}
                                  {...field}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => ingredientArray.remove(index)}
                                disabled={ingredientArray.fields.length === 1}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => ingredientArray.append({ value: "" })}
                  >
                    <Plus size={14} />
                    Add Ingredient
                  </Button>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  <FormLabel>Instructions*</FormLabel>
                  <div className="space-y-3">
                    {stepsArray.fields.map((item, index) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name={`steps.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex gap-3">
                              <div className="flex items-start pt-2">
                                <Badge
                                  variant="secondary"
                                  className="h-6 w-6 justify-center flex-shrink-0"
                                >
                                  {index + 1}
                                </Badge>
                              </div>
                              <div className="flex-1 space-y-1">
                                <FormControl>
                                  <Textarea
                                    placeholder={`Describe step ${index + 1}`}
                                    rows={2}
                                    className="resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive mt-2"
                                onClick={() => stepsArray.remove(index)}
                                disabled={stepsArray.fields.length === 1}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => stepsArray.append({ value: "" })}
                  >
                    <Plus size={14} />
                    Add Step
                  </Button>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <FormLabel>Tags</FormLabel>
                  <div className="space-y-2">
                    {tagsArray.fields.map((item, index) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name={`tags.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                placeholder={`Add tag (press enter to add more)`}
                                onKeyDown={(e) => handleTagKeyDown(e)}
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => tagsArray.remove(index)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => tagsArray.append({ value: "" })}
                  >
                    <Plus size={14} />
                    Add Tag
                  </Button>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setOpen(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Submitting..."
                      : "Create Recipe"}
                  </Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
