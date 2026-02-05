"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X, ChevronRight, Loader2 } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard } from "@/components/listing-card";
import { CategoryIcon } from "@/components/category-icon";
import { listingsQuery } from "@/lib/queries";
import { AttributeFilters } from "@/components/attribute-filters";
import type { CategoryAttribute } from "@/components/dynamic-attribute-field";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  children?: { id: string; name: string; slug: string }[];
  parent?: { id: string; name: string; slug: string; icon: string | null } | null;
  _count?: { listings: number };
}

interface ListingsBrowserProps {
  categories: Category[];
  locations: { id: string; address: string }[];
  initialParams: Record<string, string | undefined>;
}

export function ListingsBrowser({ categories, locations, initialParams }: ListingsBrowserProps) {
  const router = useRouter();

  // State
  const [search, setSearch] = useState(initialParams.search || "");
  const [categoryId, setCategoryId] = useState(initialParams.categoryId || "");
  const [locationId, setLocationId] = useState(initialParams.locationId || "");
  const [minPrice, setMinPrice] = useState(initialParams.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialParams.maxPrice || "");
  const [sort, setSort] = useState(initialParams.sort || "newest");
  const [page, setPage] = useState(parseInt(initialParams.page || "1"));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Attribute filter state
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [attrFilters, setAttrFilters] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.entries(initialParams).forEach(([key, value]) => {
      if (key.startsWith("attr_") && value && !key.endsWith("_min") && !key.endsWith("_max")) {
        initial[key.slice(5)] = value;
      }
    });
    return initial;
  });
  const [attrRangeFilters, setAttrRangeFilters] = useState<Record<string, { min: string; max: string }>>(() => {
    const initial: Record<string, { min: string; max: string }> = {};
    Object.entries(initialParams).forEach(([key, value]) => {
      if (key.startsWith("attr_") && value) {
        const attrSlug = key.slice(5);
        if (attrSlug.endsWith("_min")) {
          const baseSlug = attrSlug.slice(0, -4);
          initial[baseSlug] = { min: value, max: initial[baseSlug]?.max || "" };
        } else if (attrSlug.endsWith("_max")) {
          const baseSlug = attrSlug.slice(0, -4);
          initial[baseSlug] = { min: initial[baseSlug]?.min || "", max: value };
        }
      }
    });
    return initial;
  });

  // Find selected category and its hierarchy
  const parentCategories = categories.filter((c) => !c.parentId);
  const allSubcategories = categories.flatMap((c) => c.children || []);

  const selectedCategory = categoryId
    ? categories.find((c) => c.id === categoryId) || allSubcategories.find((c) => c.id === categoryId)
    : null;

  const selectedParentCategory = categoryId
    ? parentCategories.find((c) => c.id === categoryId || c.children?.some((sub) => sub.id === categoryId))
    : null;

  const isSubcategorySelected = selectedCategory && selectedParentCategory && selectedCategory.id !== selectedParentCategory.id;
  const subcategories = selectedParentCategory?.children || [];

  // Fetch category attributes when a category is selected
  useEffect(() => {
    async function fetchAttributes() {
      if (!categoryId) {
        setCategoryAttributes([]);
        return;
      }

      setLoadingAttributes(true);
      try {
        const res = await fetch(`/api/categories/${categoryId}/attributes`);
        if (res.ok) {
          const data = await res.json();
          setCategoryAttributes(data.attributes || []);
        } else {
          setCategoryAttributes([]);
        }
      } catch {
        setCategoryAttributes([]);
      } finally {
        setLoadingAttributes(false);
      }
    }
    fetchAttributes();
  }, [categoryId]);

  // Build query params for API
  const attrQueryParams: Record<string, string> = {};
  Object.entries(attrFilters).forEach(([slug, value]) => {
    if (value) attrQueryParams[`attr_${slug}`] = value;
  });
  Object.entries(attrRangeFilters).forEach(([slug, range]) => {
    if (range?.min) attrQueryParams[`attr_${slug}_min`] = range.min;
    if (range?.max) attrQueryParams[`attr_${slug}_max`] = range.max;
  });

  const queryParams = {
    search: search || undefined,
    categoryId: categoryId || undefined,
    locationId: locationId || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    sort: sort !== "newest" ? sort : undefined,
    page,
    ...attrQueryParams,
  };

  const { data, isLoading, error, refetch } = useQuery(listingsQuery().list(queryParams));
  const listings = data?.listings || [];
  const pagination = data?.pagination;

  // Build URL query string
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryId) params.set("categoryId", categoryId);
    if (locationId) params.set("locationId", locationId);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());
    Object.entries(attrFilters).forEach(([slug, value]) => {
      if (value) params.set(`attr_${slug}`, value);
    });
    Object.entries(attrRangeFilters).forEach(([slug, range]) => {
      if (range?.min) params.set(`attr_${slug}_min`, range.min);
      if (range?.max) params.set(`attr_${slug}_max`, range.max);
    });
    return params.toString();
  }, [search, categoryId, locationId, minPrice, maxPrice, sort, page, attrFilters, attrRangeFilters]);

  // Sync URL
  useEffect(() => {
    const query = buildQueryString();
    router.replace(`/search${query ? `?${query}` : ""}`, { scroll: false });
  }, [buildQueryString, router]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    setAttrFilters({});
    setAttrRangeFilters({});
    setPage(1);
  };

  const handleAttrFilterChange = (slug: string, value: string) => {
    setAttrFilters((prev) => ({ ...prev, [slug]: value }));
    setPage(1);
  };

  const handleAttrRangeChange = (slug: string, type: "min" | "max", value: string) => {
    setAttrRangeFilters((prev) => ({
      ...prev,
      [slug]: { ...(prev[slug] || { min: "", max: "" }), [type]: value },
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setLocationId("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
    setAttrFilters({});
    setAttrRangeFilters({});
  };

  const attrFilterCount = Object.values(attrFilters).filter(Boolean).length +
    Object.values(attrRangeFilters).filter((r) => r?.min || r?.max).length;

  const activeFilterCount = [categoryId, locationId, minPrice, maxPrice].filter(Boolean).length + attrFilterCount;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={selectedParentCategory?.id || "__all__"}
          onValueChange={(value) => handleCategoryChange(value === "__all__" ? "" : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All categories</SelectItem>
            {parentCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {subcategories.length > 0 && (
          <Select
            value={isSubcategorySelected ? categoryId : "__all__"}
            onValueChange={(value) => handleCategoryChange(value === "__all__" ? selectedParentCategory?.id || "" : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All subcategories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All {selectedParentCategory?.name}</SelectItem>
              {subcategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Location Filter */}
      <div className="space-y-2">
        <Label>Location</Label>
        <Select
          value={locationId || "__all__"}
          onValueChange={(value) => {
            setLocationId(value === "__all__" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.address}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2">
        <Label>Price Range (BDT)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
            min={0}
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
            min={0}
          />
        </div>
      </div>

      {/* Attribute Filters */}
      {loadingAttributes ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading filters...
        </div>
      ) : categoryAttributes.length > 0 ? (
        <AttributeFilters
          attributes={categoryAttributes}
          values={attrFilters}
          onChange={handleAttrFilterChange}
          onRangeChange={handleAttrRangeChange}
          rangeValues={attrRangeFilters}
        />
      ) : null}

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Category Header (when category is selected) */}
      {selectedParentCategory && (
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/search" className="hover:text-foreground">
              All Listings
            </Link>
            <ChevronRight className="h-4 w-4" />
            {isSubcategorySelected ? (
              <>
                <button
                  onClick={() => handleCategoryChange(selectedParentCategory.id)}
                  className="hover:text-foreground"
                >
                  {selectedParentCategory.name}
                </button>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{selectedCategory?.name}</span>
              </>
            ) : (
              <span className="text-foreground font-medium">{selectedParentCategory.name}</span>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CategoryIcon
                iconName={selectedParentCategory.icon}
                className="h-6 w-6 text-primary"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                {isSubcategorySelected ? selectedCategory?.name : selectedParentCategory.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {pagination?.total || 0} listings
              </p>
            </div>
          </div>

          {/* Subcategory badges */}
          {!isSubcategorySelected && subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="cursor-default">
                All {selectedParentCategory.name}
              </Badge>
              {subcategories.map((sub) => (
                <Badge
                  key={sub.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleCategoryChange(sub.id)}
                >
                  {sub.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden relative">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 pb-4 pt-12">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </form>

      {/* Active filters display */}
      {(search || activeFilterCount > 0) && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="secondary" className="gap-1">
              Search: {search}
              <button onClick={() => setSearch("")}><X className="h-3 w-3" /></button>
            </Badge>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20 space-y-4">
            <h2 className="font-semibold">Filters</h2>
            <FilterContent />
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {pagination ? `${pagination.total} results` : "Loading..."}
            </p>
            <Select value={sort} onValueChange={(value) => { setSort(value); setPage(1); }}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] rounded-lg" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">Failed to load listings.</p>
              <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No listings found</p>
              {activeFilterCount > 0 && (
                <Button variant="link" onClick={clearFilters}>Clear all filters</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {(() => {
                  const totalPages = pagination.totalPages;
                  const pages: (number | string)[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (page > 3) pages.push("...");
                    const start = Math.max(2, page - 1);
                    const end = Math.min(totalPages - 1, page + 1);
                    for (let i = start; i <= end; i++) pages.push(i);
                    if (page < totalPages - 2) pages.push("...");
                    pages.push(totalPages);
                  }
                  return pages.map((p, idx) =>
                    typeof p === "string" ? (
                      <span key={`ellipsis-${idx}`} className="px-2">...</span>
                    ) : (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    )
                  );
                })()}
              </div>
              <Button variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
