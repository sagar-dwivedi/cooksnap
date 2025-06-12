"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { PlusSquare, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  ingredients: z.array(
    z.object({
      value: z.string().min(1, "Ingredient can't be empty"),
    })
  ),
  steps: z.array(
    z.object({
      value: z.string().min(1, "Step can't be empty"),
    })
  ),
  tags: z.array(z.string().min(1)).optional(),
});

type MediaItem = {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "video";
  status: "queued" | "uploading" | "uploaded" | "failed";
  progress?: number;
  storageId?: string;
  mediaDocId?: Id<"media"> | null;
  uploadController?: AbortController;
};

export function CreateRecipeSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_CONCURRENT_UPLOADS = 3;

  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const saveMedia = useMutation(api.media.saveMedia);
  const deleteMedia = useMutation(api.media.deleteMedia);
  const createRecipe = useMutation(api.recipes.createRecipe);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      ingredients: [{ value: "" }],
      steps: [{ value: "" }],
      tags: [],
    },
  });

  const ingredientArray = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const stepArray = useFieldArray({
    control: form.control,
    name: "steps",
  });

  useEffect(() => {
    const queuedItem = mediaItems.find((item) => item.status === "queued");
    if (activeUploads < MAX_CONCURRENT_UPLOADS && queuedItem) {
      startUpload(queuedItem);
    }
  }, [activeUploads, mediaItems]);

  async function startUpload(item: MediaItem) {
    const controller = new AbortController();
    updateItem(item.id, { status: "uploading", uploadController: controller });
    setActiveUploads((c) => c + 1);

    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": item.file.type },
        body: item.file,
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { storageId } = await res.json();
      const mediaDocId = await saveMedia({ storageId, type: item.type });

      console.log(mediaDocId)

      updateItem(item.id, {
        status: "uploaded",
        storageId,
        mediaDocId,
        progress: 100,
      });
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error(`Upload failed for ${item.file.name}`);
        updateItem(item.id, { status: "failed" });
      }
    } finally {
      setActiveUploads((c) => c - 1);
    }
  }

  function updateItem(id: string, updates: Partial<MediaItem>) {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  function onSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const validItems: MediaItem[] = [];

    files.forEach((file) => {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        toast.error(`Unsupported file type: ${file.type}`);
      } else if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large: ${(file.size / 1024 ** 2).toFixed(1)}MB`);
      } else {
        validItems.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          type: file.type.startsWith("video") ? "video" : "image",
          status: "queued",
          progress: 0,
        });
      }
    });

    if (validItems.length) {
      setMediaItems((prev) => [...prev, ...validItems]);
      toast.info(`${validItems.length} file(s) added to upload queue`);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function cancelUpload(id: string) {
    setMediaItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;

      item.uploadController?.abort();
      item.previewUrl && URL.revokeObjectURL(item.previewUrl);

      return prev.filter((i) => i.id !== id);
    });
  }

  async function resetForm() {
    mediaItems.forEach((item) => {
      item.uploadController?.abort();
      item.previewUrl && URL.revokeObjectURL(item.previewUrl);
    });

    await Promise.all(
      mediaItems
        .filter((i) => i.status === "uploaded" && i.mediaDocId)
        .map((i) => deleteMedia({ mediaId: i.mediaDocId! }).catch(console.warn))
    );

    form.reset();
    setMediaItems([]);
    setActiveUploads(0);
    setIsOpen(false);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const uploading = mediaItems.filter(
      (i) => i.status === "uploading" || i.status === "queued"
    );
    const uploaded = mediaItems.filter((i) => i.status === "uploaded");

    if (!mediaItems.length) {
      toast.error("Add at least one image or video");
      return;
    }

    if (uploading.length) {
      toast.error("Wait for uploads or remove pending files");
      return;
    }

    console.log(uploaded);

    const validMediaIds = uploaded
      .map((i) => i.mediaDocId)
      .filter((id): id is Id<"media"> => Boolean(id));

    if (!validMediaIds.length) {
      toast.error("No valid media to submit");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRecipe({
        title: values.title,
        caption: values.description,
        ingredients: values.ingredients
          .map((i) => i.value.trim())
          .filter(Boolean),
        steps: values.steps.map((s) => s.value.trim()).filter(Boolean),
        mediaIds: validMediaIds,
        tags: values.tags?.length ? values.tags : undefined,
      });
      toast.success("Recipe posted!");
      resetForm();
    } catch {
      toast.error("Failed to create recipe");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <li>
          <Button variant="ghost" className="w-full justify-start text-lg">
            <PlusSquare className="mr-2 h-4 w-4" />
            Create
          </Button>
        </li>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-4 lg:max-w-2xl"
      >
        <SheetHeader>
          <SheetTitle>Upload Recipe</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-6 px-1"
            >
              {/* Media Upload */}
              <div>
                <FormLabel className="text-base font-semibold">Media</FormLabel>
                <FormItem>
                  <FormControl>
                    <Input
                      type="file"
                      accept={ACCEPTED_FILE_TYPES.join(",")}
                      multiple
                      onChange={onSelectFiles}
                      ref={fileInputRef}
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload images or videos (Max 10MB each)
                </p>
              </div>

              {/* Media Preview */}
              {mediaItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative group rounded-xl border bg-muted overflow-hidden shadow-sm"
                    >
                      {/* Status overlay */}
                      {item.status !== "uploaded" && (
                        <div className="absolute inset-0 bg-black/50 text-white z-10 flex flex-col items-center justify-center text-center p-4 text-sm">
                          {item.status === "uploading" ? (
                            <>
                              <p className="font-medium">Uploading</p>
                              <Progress
                                value={item.progress}
                                className="w-full mt-2 h-2"
                              />
                            </>
                          ) : item.status === "queued" ? (
                            <>
                              <p className="font-medium">Queued</p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-red-300">
                                Upload Failed
                              </p>
                              <p className="text-xs truncate">
                                {item.file.name}
                              </p>
                            </>
                          )}
                        </div>
                      )}

                      {/* Media content */}
                      {item.type === "video" ? (
                        <video
                          src={item.previewUrl}
                          className="w-full h-40 object-cover"
                          controls={item.status === "uploaded"}
                        />
                      ) : (
                        <img
                          src={item.previewUrl}
                          alt="Preview"
                          className="w-full h-40 object-cover"
                        />
                      )}

                      {/* Info footer */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white p-2 text-xs z-10">
                        <div className="truncate">{item.file.name}</div>
                        <div className="opacity-80">
                          {item.status === "uploaded"
                            ? "Upload complete"
                            : item.status === "failed"
                              ? "Upload failed"
                              : item.status === "queued"
                                ? "Waiting to upload"
                                : `${item.progress}% uploaded`}
                        </div>
                      </div>

                      {/* Cancel button */}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => cancelUpload(item.id)}
                        className="absolute top-2 right-2 z-20 bg-white/80 hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4 text-black" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="Recipe Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your recipe..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Ingredients*</FormLabel>
                {ingredientArray.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder={`Ingredient ${index + 1}`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => {
                        if (ingredientArray.fields.length > 1) {
                          ingredientArray.remove(index);
                        } else {
                          form.setValue(`ingredients.${index}.value`, "");
                        }
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => ingredientArray.append({ value: "" })}
                >
                  Add Ingredient
                </Button>
              </div>

              <div>
                <FormLabel>Steps*</FormLabel>
                {stepArray.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`steps.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Textarea
                              placeholder={`Step ${index + 1}`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => {
                        if (stepArray.fields.length > 1) {
                          stepArray.remove(index);
                        } else {
                          form.setValue(`steps.${index}.value`, "");
                        }
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => stepArray.append({ value: "" })}
                >
                  Add Step
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    isSubmitting ||
                    mediaItems.some((i) =>
                      ["uploading", "queued"].includes(i.status)
                    ) ||
                    mediaItems.filter((i) => i.status === "uploaded").length ===
                      0
                  }
                >
                  {isSubmitting ? "Posting..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
