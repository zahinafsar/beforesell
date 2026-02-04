"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard } from "@/components/listing-card";

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
  url: string;
}

interface ListingDistrict {
  name: string;
  division: { name: string };
}

interface Listing {
  id: string;
  title: string;
  slug: string;
  price: number;
  negotiable: boolean;
  condition: string;
  status: string;
  views: number;
  createdAt: Date;
  images: ListingImage[];
  district: ListingDistrict;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface InitialParams {
  page?: string;
  sort?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  divisionId?: string;
  districtId?: string;
}

interface CategoryListingsProps {
  categoryId: string;
  divisions: Division[];
  initialParams: InitialParams;
}

const CONDITIONS = [
  { value: "NEW", label: "Brand New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export function CategoryListings({
  categoryId,
  divisions,
  initialParams,
}: CategoryListingsProps) {
  const router = useRouter();

  const [divisionId, setDivisionId] = useState(initialParams.divisionId || "");
  const [districtId, setDistrictId] = useState(initialParams.districtId || "");
  const [minPrice, setMinPrice] = useState(initialParams.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialParams.maxPrice || "");
  const [condition, setCondition] = useState(initialParams.condition || "");
  const [sort, setSort] = useState(initialParams.sort || "newest");
  const [page, setPage] = useState(parseInt(initialParams.page || "1"));

  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectedDivision = divisions.find((d) => d.id === divisionId);
  const districts = selectedDivision?.districts || [];

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.set("categoryId", categoryId);
    if (divisionId) params.set("divisionId", divisionId);
    if (districtId) params.set("districtId", districtId);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (condition) params.set("condition", condition);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());
    return params.toString();
  }, [categoryId, divisionId, districtId, minPrice, maxPrice, condition, sort, page]);

  const buildUrlQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (divisionId) params.set("divisionId", divisionId);
    if (districtId) params.set("districtId", districtId);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (condition) params.set("condition", condition);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());
    return params.toString();
  }, [divisionId, districtId, minPrice, maxPrice, condition, sort, page]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = buildQueryString();
      const res = await fetch(`/api/listings?${query}`);
      if (!res.ok) {
        throw new Error("Failed to fetch listings");
      }
      const data = await res.json();
      setListings(data.listings || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setError("Failed to load listings. Please try again.");
      setListings([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    const urlQuery = buildUrlQueryString();
    const currentPath = window.location.pathname;
    router.replace(`${currentPath}${urlQuery ? `?${urlQuery}` : ""}`, { scroll: false });
    fetchListings();
  }, [buildUrlQueryString, fetchListings, router]);

  const clearFilters = () => {
    setDivisionId("");
    setDistrictId("");
    setMinPrice("");
    setMaxPrice("");
    setCondition("");
    setSort("newest");
    setPage(1);
  };

  const activeFilterCount = [
    divisionId,
    districtId,
    minPrice,
    maxPrice,
    condition,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Location</Label>
        <Select
          value={divisionId}
          onValueChange={(value) => {
            setDivisionId(value);
            setDistrictId("");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All divisions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All divisions</SelectItem>
            {divisions.map((div) => (
              <SelectItem key={div.id} value={div.id}>
                {div.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {districts.length > 0 && (
          <Select
            value={districtId}
            onValueChange={(value) => {
              setDistrictId(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All districts</SelectItem>
              {districts.map((dist) => (
                <SelectItem key={dist.id} value={dist.id}>
                  {dist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label>Price Range (BDT)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            min={0}
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            min={0}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Condition</Label>
        <Select
          value={condition}
          onValueChange={(value) => {
            setCondition(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any condition</SelectItem>
            {CONDITIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pagination ? `${pagination.total} results` : "Loading..."}
        </p>
        <div className="flex items-center gap-2">
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
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <h2 className="font-semibold mb-4">Filters</h2>
            <FilterContent />
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
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
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={fetchListings}>
                Try Again
              </Button>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No listings found in this category</p>
              {activeFilterCount > 0 && (
                <Button variant="link" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
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
              <Button
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
