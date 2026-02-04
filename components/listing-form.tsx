"use client";

import { useState, useCallback, useRef } from "react";
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

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
}

interface Division {
  id: string;
  name: string;
  districts: District[];
}

interface District {
  id: string;
  name: string;
  divisionId: string;
}

interface ListingImage {
  id: string;
  url: string;
  publicId: string;
  order: number;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  condition: string;
  categoryId: string;
  districtId: string;
  images: ListingImage[];
  district?: { divisionId: string };
}

interface ListingFormProps {
  categories: Category[];
  divisions: Division[];
  listing?: Listing;
}

const CONDITIONS = [
  { value: "NEW", label: "Brand New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
];

export default function ListingForm({ categories, divisions, listing }: ListingFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!listing;

  const [title, setTitle] = useState(listing?.title || "");
  const [description, setDescription] = useState(listing?.description || "");
  const [price, setPrice] = useState(listing?.price?.toString() || "");
  const [negotiable, setNegotiable] = useState(listing?.negotiable ?? true);
  const [condition, setCondition] = useState(listing?.condition || "GOOD");
  const [categoryId, setCategoryId] = useState(listing?.categoryId || "");
  const [divisionId, setDivisionId] = useState(listing?.district?.divisionId || "");
  const [districtId, setDistrictId] = useState(listing?.districtId || "");
  const [images, setImages] = useState<ListingImage[]>(listing?.images || []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const parentCategories = categories.filter((c) => !c.parentId);
  const selectedParent = parentCategories.find((c) =>
    c.id === categoryId || c.children?.some((sub) => sub.id === categoryId)
  );
  const subcategories = selectedParent?.children || [];
  const selectedDivision = divisions.find((d) => d.id === divisionId);
  const districts = selectedDivision?.districts || [];

  const handleImageUpload = useCallback(async (files: FileList) => {
    if (!listing && !isEditing) {
      setError("Please save the listing first before uploading images");
      return;
    }

    if (images.length + files.length > 20) {
      setError("Maximum 20 images allowed");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch(`/api/listings/${listing!.id}/images`, {
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
  }, [listing, images.length, isEditing]);

  const handleDeleteImage = async (imageId: string) => {
    if (!listing) return;

    try {
      const res = await fetch(`/api/listings/${listing.id}/images?imageId=${imageId}`, {
        method: "DELETE",
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
      await fetch(`/api/listings/${listing.id}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds: images.map((img) => img.id) }),
      });
    } catch {
      setError("Failed to reorder images");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload = {
      title,
      description,
      price: parseFloat(price),
      negotiable,
      condition,
      categoryId,
      districtId,
    };

    try {
      const url = isEditing ? `/api/listings/${listing.id}` : "/api/listings";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save listing");
      }

      if (!isEditing) {
        router.push(`/listings/new?id=${data.listing.id}`);
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

          <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="negotiable"
              checked={negotiable}
              onChange={(e) => setNegotiable(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="negotiable" className="font-normal">
              Price is negotiable
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={selectedParent?.id || ""}
                onValueChange={(value) => {
                  const parent = parentCategories.find((c) => c.id === value);
                  if (parent?.children?.length) {
                    setCategoryId("");
                  } else {
                    setCategoryId(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {subcategories.length > 0 && (
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Division</Label>
              <Select
                value={divisionId}
                onValueChange={(value) => {
                  setDivisionId(value);
                  setDistrictId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((div) => (
                    <SelectItem key={div.id} value={div.id}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {districts.length > 0 && (
              <div className="space-y-2">
                <Label>District</Label>
                <Select value={districtId} onValueChange={setDistrictId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((dist) => (
                      <SelectItem key={dist.id} value={dist.id}>
                        {dist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Images ({images.length}/20)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    draggedIndex === index ? "border-primary opacity-50" : "border-transparent"
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
              ))}

              {images.length < 20 && (
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
              Drag to reorder. First image will be the cover photo.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create & Add Images"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
