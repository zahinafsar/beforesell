"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Upload, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { DynamicAttributeField, type CategoryAttribute } from "@/components/dynamic-attribute-field";

export function ListingForm({
  categories,
  locations,
  listing,
  userPhone,
}: {
  categories: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    parentId: string | null;
    children?: { id: string; name: string; slug: string }[];
  }[];
  locations: {
    id: string;
    address: string;
  }[];
  listing?: {
    id: string;
    title: string;
    description: string;
    price: number;
    negotiable: boolean;
    phone?: string | null;
    status?: string;
    categoryId?: string | null;
    locationId: string;
    images: { id: string; url: string; publicId: string; order: number }[];
    attributeValues?: { attribute: { slug: string }; value: string }[];
  };
  userPhone?: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!listing;

  const [title, setTitle] = useState(listing?.title || "");
  const [status, setStatus] = useState(listing?.status || "ACTIVE");
  const [description, setDescription] = useState(listing?.description || "");
  const [price, setPrice] = useState(listing?.price?.toString() || "");
  const [negotiable, setNegotiable] = useState(listing?.negotiable ?? true);
  const [phone, setPhone] = useState(listing?.phone || userPhone || "");
  const [categoryId, setCategoryId] = useState(listing?.categoryId || "");
  const [locationId, setLocationId] = useState(listing?.locationId || "");
  const [images, setImages] = useState(
    listing?.images ||
      ([] as { id: string; url: string; publicId: string; order: number }[]),
  );
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string | string[]>>(() => {
    if (listing?.attributeValues) {
      const values: Record<string, string | string[]> = {};
      listing.attributeValues.forEach((av) => {
        values[av.attribute.slug] = av.value;
      });
      return values;
    }
    return {};
  });
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  const categoryMap = useMemo(() => {
    const m = new Map<string, (typeof categories)[number]>();
    categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );

  // Walk parents from listing.categoryId to derive initial path
  const [categoryPath, setCategoryPath] = useState<string[]>(() => {
    if (!listing?.categoryId) return [];
    const path: string[] = [];
    let cur = categoryMap.get(listing.categoryId);
    while (cur) {
      path.unshift(cur.id);
      cur = cur.parentId ? categoryMap.get(cur.parentId) : undefined;
    }
    return path;
  });

  // Options for a given level: roots at level 0, or children of selection at level - 1
  const optionsForLevel = useCallback(
    (level: number) => {
      if (level === 0) return rootCategories;
      const parentId = categoryPath[level - 1];
      return parentId ? categoryMap.get(parentId)?.children || [] : [];
    },
    [rootCategories, categoryPath, categoryMap],
  );

  // Render one Select per level. Stop when the current level has no options.
  const levels = useMemo(() => {
    const arr: number[] = [];
    let i = 0;
    while (true) {
      const opts = optionsForLevel(i);
      if (opts.length === 0) break;
      arr.push(i);
      if (!categoryPath[i]) break;
      i++;
    }
    return arr;
  }, [optionsForLevel, categoryPath]);

  // Fetch category attributes when categoryId changes
  useEffect(() => {
    async function fetchAttributes() {
      if (!categoryId) {
        setCategoryAttributes([]);
        return;
      }

      setLoadingAttributes(true);
      try {
        const res = await api("categories/[id]/attributes", {
          method: "GET",
          params: { id: categoryId },
        });
        if (res.ok) {
          const data = await res.json();
          setCategoryAttributes(data.attributes || []);
          // Reset attribute values when category changes (but keep if editing)
          if (!listing) {
            setAttributeValues({});
          }
        }
      } catch {
        console.error("Failed to fetch category attributes");
      } finally {
        setLoadingAttributes(false);
      }
    }

    fetchAttributes();
  }, [categoryId, listing]);

  const handleImageUpload = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);

      // In create mode, store files locally for upload after listing creation
      if (!listing) {
        if (pendingFiles.length + fileArray.length > 20) {
          setError("Maximum 20 images allowed");
          return;
        }
        setPendingFiles((prev) => [...prev, ...fileArray]);
        return;
      }

      if (images.length + fileArray.length > 20) {
        setError("Maximum 20 images allowed");
        return;
      }

      setUploading(true);
      setError("");

      const formData = new FormData();
      fileArray.forEach((file) => {
        formData.append("images", file);
      });

      try {
        const res = await fetch(`/api/listings/${listing.id}/images`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        setImages((prev) => [...prev, ...data.images]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [listing, images.length, pendingFiles.length],
  );

  const handleDeleteImage = async (imageId: string) => {
    if (!listing) return;

    try {
      const res = await api("listings/[id]/images", {
        method: "DELETE",
        params: { id: listing.id },
        query: { imageId },
      });

      if (!res.ok) throw new Error("Failed to delete");

      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      setError("Failed to delete image");
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (!listing || draggedIndex === null) return;
    setDraggedIndex(null);

    try {
      await api("listings/[id]/images", {
        method: "PUT",
        params: { id: listing.id },
        body: { imageIds: images.map((img) => img.id) },
      });
    } catch {
      setError("Failed to reorder images");
    }
  };

  const handleAttributeChange = (slug: string, value: string | string[]) => {
    setAttributeValues((prev) => ({ ...prev, [slug]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!categoryId) {
      setError("Category is required");
      return;
    }

    // Validate required attributes
    for (const attr of categoryAttributes) {
      if (attr.required) {
        const val = attributeValues[attr.slug];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          setError(`${attr.name} is required`);
          return;
        }
      }
    }

    setIsSubmitting(true);

    const payload = {
      title,
      description,
      price: parseFloat(price),
      negotiable,
      phone: phone.trim() || null,
      ...(isEditing && { status: status as "DRAFT" | "ACTIVE" | "SOLD" | "EXPIRED" | "DELETED" }),
      categoryId,
      locationId,
      attributes: attributeValues,
    };

    try {
      const res = isEditing
        ? await api("listings/[id]", {
            method: "PUT",
            params: { id: listing.id },
            body: payload,
          })
        : await api("listings", { method: "POST", body: payload });

      let data: { listing?: { id: string }; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to save listing");
      }

      // Upload pending images after creating listing
      if (!isEditing && pendingFiles.length > 0 && data.listing?.id) {
        const formData = new FormData();
        pendingFiles.forEach((file) => {
          formData.append("images", file);
        });

        const uploadRes = await fetch(`/api/listings/${data.listing.id}/images`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          throw new Error(uploadData.error || "Failed to upload images");
        }
      }

      if (!isEditing) {
        router.push(`/listings/${data.listing!.id}`);
        router.refresh();
      } else {
        router.push(`/listings/${listing.id}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isEditing && (
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Listing</h1>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SOLD">Sold</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you selling?"
              required
              minLength={5}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item in detail..."
              required
              minLength={20}
              maxLength={5000}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (BDT)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              required
              min={0}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="negotiable"
              checked={negotiable}
              onCheckedChange={(v) => setNegotiable(v === true)}
            />
            <Label htmlFor="negotiable" className="font-normal">
              Price is negotiable
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1XXX-XXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              Visible to buyers on this listing
            </p>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {levels.map((lvl) => {
            const opts = optionsForLevel(lvl);
            return (
              <div key={lvl} className="space-y-2">
                <Label>{lvl === 0 ? "Select a category" : "Select a subcategory"}</Label>
                <Select
                  value={categoryPath[lvl] || ""}
                  onValueChange={(value) => {
                    setCategoryPath((p) => [...p.slice(0, lvl), value]);
                    setCategoryId(value);
                    setAttributeValues({});
                    setCategoryAttributes([]);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {opts.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {categoryId && (loadingAttributes || categoryAttributes.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingAttributes ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading attributes...
              </div>
            ) : (
              categoryAttributes.map((attr) => (
                <DynamicAttributeField
                  key={attr.id}
                  attribute={attr}
                  value={attributeValues[attr.slug] || ""}
                  onChange={(value) => handleAttributeChange(attr.slug, value)}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Location</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images ({isEditing ? images.length : pendingFiles.length}/20)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) =>
              e.target.files && handleImageUpload(e.target.files)
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {isEditing
              ? images.map((image, index) => (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                      draggedIndex === index
                        ? "border-primary opacity-50"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <GripVertical className="h-6 w-6 text-white cursor-grab" />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.id)}
                        className="p-1 bg-red-500 rounded-full"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    {index === 0 && (
                      <span className="absolute top-1 left-1 px-2 py-0.5 bg-primary text-white text-xs rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))
              : pendingFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent"
                  >
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          setPendingFiles((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="p-1 bg-red-500 rounded-full"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    {index === 0 && (
                      <span className="absolute top-1 left-1 px-2 py-0.5 bg-primary text-white text-xs rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}

            {(isEditing ? images.length : pendingFiles.length) < 20 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Add Photos</span>
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Drag to reorder. First image will be the cover photo."
              : "First image will be the cover photo."}
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEditing ? "Saving..." : "Publishing..."}
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Publish Listing"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
