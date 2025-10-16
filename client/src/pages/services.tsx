import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Star, 
  ShoppingBag, 
  Filter,
  SlidersHorizontal,
  X
} from "lucide-react";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ProductWithSeller } from "@shared/schema";

export function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");

  const { data: products = [], isLoading } = useQuery<ProductWithSeller[]>({ 
    queryKey: ['/api/products'] 
  });

  const categories = [
    "All Categories",
    "Design",
    "Development",
    "Marketing",
    "Writing",
    "Video & Animation",
    "Music & Audio"
  ];

  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under $50", value: "0-50" },
    { label: "$50 - $100", value: "50-100" },
    { label: "$100 - $200", value: "100-200" },
    { label: "Over $200", value: "200+" },
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-3 block">Category</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="glass-morphism border-border/50" data-testid="select-category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="glass-morphism-strong border-border/50">
            {categories.map((cat, index) => (
              <SelectItem key={index} value={cat.toLowerCase().replace(' ', '-')}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Price Range</label>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="glass-morphism border-border/50" data-testid="select-price">
            <SelectValue placeholder="Select price range" />
          </SelectTrigger>
          <SelectContent className="glass-morphism-strong border-border/50">
            {priceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        variant="outline" 
        className="w-full border-border/50" 
        onClick={() => {
          setSelectedCategory("all");
          setPriceRange("all");
          setSearchQuery("");
        }}
        data-testid="button-clear-filters"
      >
        <X className="w-4 h-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Discover Services</h1>
          <p className="text-muted-foreground">Browse and find the perfect service for your needs</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 glass-morphism border-border/50 focus:border-primary"
                data-testid="input-search-services"
              />
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden border-border/50" data-testid="button-filter-mobile">
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="glass-morphism-strong border-l border-border/50">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Filter services by category and price
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters */}
          {(selectedCategory !== "all" || priceRange !== "all" || searchQuery) && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Category: {selectedCategory}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
                </Badge>
              )}
              {priceRange !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Price: {priceRanges.find(r => r.value === priceRange)?.label}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange("all")} />
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Sidebar Filter */}
          <div className="hidden md:block lg:col-span-1">
            <Card className="glass-morphism border-border/30 sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterContent />
              </CardContent>
            </Card>
          </div>

          {/* Services Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="glass-morphism border-border/30">
                    <Skeleton className="h-40 w-full" />
                    <CardHeader className="pb-3">
                      <Skeleton className="h-5 w-3/4" />
                      <div className="flex items-center space-x-2 mt-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex items-center justify-between mb-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-9 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card 
                    key={product.id}
                    className="glass-morphism border-border/30 hover:border-primary/50 transition-all hover-elevate group"
                    data-testid={`card-product-${product.id}`}
                  >
                    {/* Service Image */}
                    <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-primary/40" />
                      </div>
                      <Badge className="absolute top-2 right-2 bg-primary/90 neon-glow-primary">
                        {product.category}
                      </Badge>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-base line-clamp-1">{product.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 text-sm">
                        <Avatar className="w-5 h-5 border border-primary/30">
                          <AvatarImage src={product.seller.avatarUrl} />
                          <AvatarFallback className="text-xs bg-primary/20">
                            {product.seller.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{product.seller.username}</span>
                        {product.seller.isVerified && (
                          <div className="w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center neon-glow-success">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-semibold">{product.seller.rating || "0.00"}</span>
                          <span className="text-xs text-muted-foreground">({product.seller.totalReviews || 0})</span>
                        </div>
                        <p className="text-lg font-bold text-primary neon-text-glow">${product.price}</p>
                      </div>

                      <Button 
                        className="w-full neon-glow-secondary" 
                        size="sm"
                        data-testid={`button-view-${product.id}`}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Load More */}
            {!isLoading && products.length > 0 && (
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg" className="border-primary/30 hover:border-primary neon-glow-primary" data-testid="button-load-more">
                  Load More Services
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
