"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQuery } from "@/lib/queries";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Settings,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  _count: { children: number; listings: number; attributes: number };
  children?: Category[];
}

interface Attribute {
  id: string;
  name: string;
  slug: string;
  type: string;
  options: string[];
  unit: string | null;
  required: boolean;
  filterable: boolean;
  order: number;
}

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data, isLoading } = useQuery(adminQuery(user?.id).categories());
  const categories: Category[] = data?.categories ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <CategoryDialog
          categories={categories}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ["admin"] })
          }
        />
      </div>

      <Tabs
        value={selectedCategory ?? "list"}
        onValueChange={(v) =>
          setSelectedCategory(v === "list" ? null : v)
        }
      >
        <TabsList>
          <TabsTrigger value="list">Categories</TabsTrigger>
          {selectedCategory && (
            <TabsTrigger value={selectedCategory}>
              Attributes
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <p className="text-muted-foreground py-8 text-center">
                  Loading...
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead>Subcategories</TableHead>
                      <TableHead>Listings</TableHead>
                      <TableHead>Attributes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <CategoryRow
                        key={cat.id}
                        category={cat}
                        allCategories={categories}
                        onSelectAttributes={() =>
                          setSelectedCategory(cat.id)
                        }
                        onRefresh={() =>
                          queryClient.invalidateQueries({
                            queryKey: ["admin"],
                          })
                        }
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {selectedCategory && (
          <TabsContent value={selectedCategory}>
            <AttributeManager
              categoryId={selectedCategory}
              categoryName={
                findCategory(categories, selectedCategory)?.name ?? ""
              }
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function findCategory(
  categories: Category[],
  id: string
): Category | undefined {
  for (const cat of categories) {
    if (cat.id === id) return cat;
    if (cat.children) {
      const found = findCategory(cat.children, id);
      if (found) return found;
    }
  }
}

function CategoryRow({
  category,
  allCategories,
  onSelectAttributes,
  onRefresh,
  depth = 0,
}: {
  category: Category;
  allCategories: Category[];
  onSelectAttributes: () => void;
  onRefresh: () => void;
  depth?: number;
}) {
  const deleteCategory = useMutation({
    mutationFn: async () => {
      const res = await api("admin/categories/[id]", {
        method: "DELETE",
        params: { id: category.id },
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || "Failed to delete");
      }
      return res.json();
    },
    onSuccess: () => {
      onRefresh();
      toast.success("Category deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <span style={{ paddingLeft: depth * 20 }}>
            {depth > 0 && (
              <ChevronRight className="inline h-3 w-3 mr-1 text-muted-foreground" />
            )}
            {category.name}
          </span>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {category.slug}
        </TableCell>
        <TableCell className="text-sm">{category.icon || "—"}</TableCell>
        <TableCell>{category._count.children}</TableCell>
        <TableCell>{category._count.listings}</TableCell>
        <TableCell>
          <Badge variant="secondary">{category._count.attributes}</Badge>
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Manage attributes"
              onClick={onSelectAttributes}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <CategoryDialog
              category={category}
              categories={allCategories}
              onSuccess={onRefresh}
              trigger={
                <Button variant="ghost" size="icon" title="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  disabled={category._count.listings > 0}
                  title={
                    category._count.listings > 0
                      ? "Cannot delete: has listings"
                      : "Delete"
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete category?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{category.name}&quot;.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => deleteCategory.mutate()}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
      {category.children?.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          allCategories={allCategories}
          onSelectAttributes={() => {}}
          onRefresh={onRefresh}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

function CategoryDialog({
  category,
  categories = [],
  onSuccess,
  trigger,
}: {
  category?: Category;
  categories: Category[];
  onSuccess: () => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "");
  const [parentId, setParentId] = useState(category?.parentId ?? "");

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        name,
        slug,
        icon: icon || undefined,
        parentId: parentId || undefined,
      };
      if (category) {
        const res = await api("admin/categories/[id]", {
          method: "PUT",
          params: { id: category.id },
          body,
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error || "Failed to update");
        }
        return res.json();
      } else {
        const res = await api("admin/categories", {
          method: "POST",
          body,
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error || "Failed to create");
        }
        return res.json();
      }
    },
    onSuccess: () => {
      onSuccess();
      setOpen(false);
      if (!category) {
        setName("");
        setSlug("");
        setIcon("");
        setParentId("");
      }
      toast.success(category ? "Category updated" : "Category created");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "New Category"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!category) {
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")
                  );
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Icon (emoji or text)</Label>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Parent Category</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="None (top level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (top level)</SelectItem>
                {categories
                  .filter((c) => c.id !== category?.id)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!name || !slug || mutation.isPending}
          >
            {mutation.isPending
              ? "Saving..."
              : category
                ? "Update"
                : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AttributeManager({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    adminQuery(user?.id).categoryAttributes(categoryId)
  );
  const attributes: Attribute[] = data?.attributes ?? [];

  const deleteAttr = useMutation({
    mutationFn: async (attrId: string) => {
      const res = await api("admin/categories/[id]/attributes/[attrId]", {
        method: "DELETE",
        params: { id: categoryId, attrId },
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || "Failed to delete");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Attribute deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          Attributes for {categoryName}
        </CardTitle>
        <AttributeDialog
          categoryId={categoryId}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ["admin"] })
          }
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground py-8 text-center">Loading...</p>
        ) : attributes.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            No attributes yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Filterable</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributes.map((attr) => (
                <TableRow key={attr.id}>
                  <TableCell className="font-medium">{attr.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {attr.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{attr.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">
                    {attr.options.length > 0
                      ? attr.options.join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {attr.unit || "—"}
                  </TableCell>
                  <TableCell>
                    {attr.required ? (
                      <Badge>Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {attr.filterable ? (
                      <Badge>Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <AttributeDialog
                        categoryId={categoryId}
                        attribute={attr}
                        onSuccess={() =>
                          queryClient.invalidateQueries({
                            queryKey: ["admin"],
                          })
                        }
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete attribute?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete &quot;{attr.name}&quot; and all its
                              values.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => deleteAttr.mutate(attr.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AttributeDialog({
  categoryId,
  attribute,
  onSuccess,
  trigger,
}: {
  categoryId: string;
  attribute?: Attribute;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(attribute?.name ?? "");
  const [slug, setSlug] = useState(attribute?.slug ?? "");
  const [type, setType] = useState(attribute?.type ?? "TEXT");
  const [options, setOptions] = useState(
    attribute?.options.join(", ") ?? ""
  );
  const [unit, setUnit] = useState(attribute?.unit ?? "");
  const [required, setRequired] = useState(attribute?.required ?? false);
  const [filterable, setFilterable] = useState(
    attribute?.filterable ?? true
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        name,
        slug,
        type: type as "SELECT" | "MULTI_SELECT" | "TEXT" | "NUMBER" | "BOOLEAN",
        options: options
          ? options.split(",").map((o) => o.trim()).filter(Boolean)
          : [],
        unit: unit || undefined,
        required,
        filterable,
      };
      if (attribute) {
        const res = await api("admin/categories/[id]/attributes/[attrId]", {
          method: "PUT",
          params: { id: categoryId, attrId: attribute.id },
          body,
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error || "Failed to update");
        }
        return res.json();
      } else {
        const res = await api("admin/categories/[id]/attributes", {
          method: "POST",
          params: { id: categoryId },
          body,
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error || "Failed to create");
        }
        return res.json();
      }
    },
    onSuccess: () => {
      onSuccess();
      setOpen(false);
      if (!attribute) {
        setName("");
        setSlug("");
        setType("TEXT");
        setOptions("");
        setUnit("");
        setRequired(false);
        setFilterable(true);
      }
      toast.success(attribute ? "Attribute updated" : "Attribute created");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Attribute
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {attribute ? "Edit Attribute" : "New Attribute"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!attribute) {
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")
                  );
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXT">Text</SelectItem>
                <SelectItem value="NUMBER">Number</SelectItem>
                <SelectItem value="SELECT">Select</SelectItem>
                <SelectItem value="MULTI_SELECT">Multi Select</SelectItem>
                <SelectItem value="BOOLEAN">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(type === "SELECT" || type === "MULTI_SELECT") && (
            <div className="space-y-2">
              <Label>Options (comma-separated)</Label>
              <Input
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}
          {type === "NUMBER" && (
            <div className="space-y-2">
              <Label>Unit (optional)</Label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. km, kg, cc"
              />
            </div>
          )}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="required"
                checked={required}
                onCheckedChange={(v) => setRequired(v === true)}
              />
              <Label htmlFor="required">Required</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="filterable"
                checked={filterable}
                onCheckedChange={(v) => setFilterable(v === true)}
              />
              <Label htmlFor="filterable">Filterable</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!name || !slug || mutation.isPending}
          >
            {mutation.isPending
              ? "Saving..."
              : attribute
                ? "Update"
                : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
