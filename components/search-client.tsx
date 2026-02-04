"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
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

interface SearchParams {
  search?: string;
  categoryId?: string;
  divisionId?: string;
  districtId?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  sort?: string;
  page?: string;
}

interface SearchClientProps {
  categories: Category[];
  divisions: Division[];
  initialParams: SearchParams;
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

export function SearchClient({ categories, divisions, initialParams }: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialParams.search || "");
  const [categoryId, setCategoryId] = useState(initialParams.categoryId || "");
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const selectedDivision = divisions.find((d) => d.id === divisionId);
  const districts = selectedDivision?.districts || [];

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.children || [];

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryId) params.set("categoryId", categoryId);
    if (divisionId) params.set("divisionId", divisionId);
    if (districtId) params.set("districtId", districtId);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (condition) params.set("condition", condition);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());
    return params.toString();
  }, [search, categoryId, divisionId, districtId, minPrice, maxPrice, condition, sort, page]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const query = buildQueryString();
      const res = await fetch(`/api/listings${query ? `?${query}` : ""}`);
      const data = await res.json();
      setListings(data.listings || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    const query = buildQueryString();
    router.replace(`/search${query ? `?${query}` : ""}`, { scroll: false });
    fetchListings();
  }, [buildQueryString, fetchListings, router]);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategoryId(searchParams.get("categoryId") || "");
    setDivisionId(searchParams.get("divisionId") || "");
    setDistrictId(searchParams.get("districtId") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setCondition(searchParams.get("condition") || "");
    setSort(searchParams.get("sort") || "newest");
    setPage(parseInt(searchParams.get("page") || "1"));
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setDivisionId("");
    setDistrictId("");
    setMinPrice("");
    setMaxPrice("");
    setCondition("");
    setSort("newest");
    setPage(1);
  };

  const activeFilterCount = [
    categoryId,
    divisionId,
    districtId,
    minPrice,
    maxPrice,
    condition,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={categoryId}
          onValueChange={(value) => {
            setCategoryId(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {subcategories.length > 0 && (
          <Select
            value=""
            onValueChange={(value) => {
              if (value) {
                setCategoryId(value);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by subcategory" />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

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
    <div className="space-y-6">
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
            <Button variant="outline" size="icon" className="lg:hidden">
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
      </form>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
              >
                {filtersExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            {filtersExpanded && <FilterContent />}
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {pagination ? `${pagination.total} results found` : "Loading..."}
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

          {search && (
            <div className="mb-4">
              <Badge variant="secondary" className="gap-1">
                Search: {search}
                <button onClick={() => setSearch("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}

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
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No listings found</p>
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
