"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

type RequestStatus = "OPEN" | "FULFILLED" | "CLOSED";

const parseBudget = (value: string) => {
  if (value.trim() === "") {
    return null;
  }
  return Number(value);
};

export function ProductRequestForm({
  categories,
  locations,
  productRequest,
  userPhone,
}: {
  categories: {
    id: string;
    name: string;
    parentId: string | null;
    children: { id: string; name: string }[];
  }[];
  locations: { id: string; address: string }[];
  productRequest?: {
    id: string;
    slug: string;
    title: string;
    description: string;
    minBudget: number | null;
    maxBudget: number | null;
    phone: string | null;
    status: RequestStatus;
    categoryId: string | null;
    locationId: string;
  };
  userPhone?: string | null;
}) {
  const router = useRouter();
  const isEditing = !!productRequest;

  const [title, setTitle] = useState(productRequest?.title || "");
  const [description, setDescription] = useState(productRequest?.description || "");
  const [minBudget, setMinBudget] = useState(productRequest?.minBudget?.toString() || "");
  const [maxBudget, setMaxBudget] = useState(productRequest?.maxBudget?.toString() || "");
  const [phone, setPhone] = useState(productRequest?.phone || userPhone || "");
  const [categoryId, setCategoryId] = useState(productRequest?.categoryId || "");
  const [locationId, setLocationId] = useState(productRequest?.locationId || "");
  const [status, setStatus] = useState<RequestStatus>(productRequest?.status || "OPEN");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryMap = useMemo(() => {
    const map = new Map<string, (typeof categories)[number]>();
    categories.forEach((category) => map.set(category.id, category));
    return map;
  }, [categories]);

  const rootCategories = useMemo(
    () => categories.filter((category) => !category.parentId),
    [categories],
  );

  const [categoryPath, setCategoryPath] = useState<string[]>(() => {
    if (!productRequest?.categoryId) {
      return [];
    }
    const path: string[] = [];
    let current = categoryMap.get(productRequest.categoryId);
    while (current) {
      path.unshift(current.id);
      if (current.parentId) {
        current = categoryMap.get(current.parentId);
      } else {
        current = undefined;
      }
    }
    return path;
  });

  const optionsForLevel = useCallback(
    (level: number) => {
      if (level === 0) {
        return rootCategories;
      }
      const parentId = categoryPath[level - 1];
      if (!parentId) {
        return [];
      }
      return categoryMap.get(parentId)?.children || [];
    },
    [rootCategories, categoryPath, categoryMap],
  );

  const levels = useMemo(() => {
    const result: number[] = [];
    let level = 0;
    while (optionsForLevel(level).length > 0) {
      result.push(level);
      if (!categoryPath[level]) {
        break;
      }
      level++;
    }
    return result;
  }, [optionsForLevel, categoryPath]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!locationId) {
      setError("Location is required");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title,
      description,
      minBudget: parseBudget(minBudget),
      maxBudget: parseBudget(maxBudget),
      phone: phone.trim() || null,
      categoryId: categoryId || null,
      locationId,
    };

    try {
      let res;
      if (isEditing) {
        res = await api("requests/[id]", {
          method: "PUT",
          params: { id: productRequest.id },
          body: { ...payload, status },
        });
      } else {
        res = await api("requests", { method: "POST", body: payload });
      }

      const data = (await res.json()) as { request?: { slug: string }; error?: string };
      if (!res.ok || !data.request) {
        throw new Error(data.error || "Failed to save request");
      }

      if (isEditing) {
        router.push(`/requests/${data.request.slug}`);
      } else {
        router.push(`/requests/${data.request.slug}/boost`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!productRequest || !confirm("Are you sure you want to delete this request?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await api("requests/[id]", {
        method: "DELETE",
        params: { id: productRequest.id },
      });
      if (!res.ok) {
        throw new Error("Failed to delete request");
      }
      toast.success("Request deleted");
      router.push("/dashboard/requests");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete request");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isEditing && (
        <div className="flex items-center justify-between gap-4">
          <Label>Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as RequestStatus)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="FULFILLED">Fulfilled</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>What do you need?</CardTitle>
          <CardDescription>Be specific so sellers know exactly what to offer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. iPhone 13 128GB, good condition"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Details</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Model, condition, color, anything that matters to you"
              rows={5}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {levels.map((level) => (
            <div key={level} className="space-y-2">
              <Label>{level === 0 ? "Select a category" : "Select a subcategory"}</Label>
              <Select
                value={categoryPath[level] || ""}
                onValueChange={(value) => {
                  setCategoryPath((path) => [...path.slice(0, level), value]);
                  setCategoryId(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {optionsForLevel(level).map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget and contact</CardTitle>
          <CardDescription>Leave the budget empty if you are flexible.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min-budget">Minimum budget (৳)</Label>
              <Input
                id="min-budget"
                type="number"
                min={0}
                value={minBudget}
                onChange={(event) => setMinBudget(event.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-budget">Maximum budget (৳)</Label>
              <Input
                id="max-budget"
                type="number"
                min={0}
                value={maxBudget}
                onChange={(event) => setMaxBudget(event.target.value)}
                placeholder="50000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="01XXXXXXXXX"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {isEditing ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting || isSubmitting}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete request
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" size="lg" disabled={isSubmitting || isDeleting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? "Save changes" : "Post request"}
        </Button>
      </div>
    </form>
  );
}
