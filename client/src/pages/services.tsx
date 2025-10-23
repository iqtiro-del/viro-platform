import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductWithSeller } from "@shared/schema";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSeller | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<ProductWithSeller[]>({ 
    queryKey: ['/api/products'] 
  });

  // Filter products based on search, category, and price range
  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory !== "all" && product.category !== selectedCategory) {
      return false;
    }
    
    // Price filter
    if (priceRange !== "all") {
      const price = parseFloat(product.price);
      if (priceRange === "0-50" && price >= 50) return false;
      if (priceRange === "50-100" && (price < 50 || price >= 100)) return false;
      if (priceRange === "100-200" && (price < 100 || price >= 200)) return false;
      if (priceRange === "200+" && price < 200) return false;
    }
    
    return true;
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}/purchase`, {
        method: "POST",
        body: JSON.stringify({ buyerId: user?.id }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("services.purchaseError"));
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      setUser(data.buyer);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions', user?.id] });
      toast({
        title: t("services.purchaseSuccess"),
        description: `${t("services.purchasedProduct")} "${selectedProduct?.title}"`,
      });
      setPurchaseDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("services.purchaseFailed"),
        description: error.message || t("services.purchaseError"),
      });
    }
  });

  const categories = [
    { value: "all", label: t("services.allCategories") },
    { value: "Design", label: t("services.design") },
    { value: "Development", label: t("services.development") },
    { value: "Marketing", label: t("services.marketing") },
    { value: "Writing", label: t("services.writing") },
    { value: "Video & Animation", label: t("services.videoAnimation") },
    { value: "Music & Audio", label: t("services.musicAudio") },
    { value: "Instagram", label: t("services.instagram") },
    { value: "TikTok", label: t("services.tiktok") },
  ];

  const priceRanges = [
    { label: t("services.allPrices"), value: "all" },
    { label: t("services.under50"), value: "0-50" },
    { label: t("services.50to100"), value: "50-100" },
    { label: t("services.100to200"), value: "100-200" },
    { label: t("services.over200"), value: "200+" },
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-3 block">{t("services.category")}</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="glass-morphism border-border/50" data-testid="select-category">
            <SelectValue placeholder={t("services.selectCategory")} />
          </SelectTrigger>
          <SelectContent className="glass-morphism-strong border-border/50">
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">{t("services.priceRange")}</label>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="glass-morphism border-border/50" data-testid="select-price">
            <SelectValue placeholder={t("services.selectPriceRange")} />
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
        {t("services.clearFilters")}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{t("services.title")}</h1>
          <p className="text-muted-foreground">{t("services.subtitle")}</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t("services.searchPlaceholder")}
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
                  <SheetTitle>{t("services.filters")}</SheetTitle>
                  <SheetDescription>
                    {t("services.filterDescription")}
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
                  {t("services.search")}: {searchQuery}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {t("services.category")}: {categories.find(c => c.value === selectedCategory)?.label || selectedCategory}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
                </Badge>
              )}
              {priceRange !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {t("services.priceLabel")}: {priceRanges.find(r => r.value === priceRange)?.label}
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
                  {t("services.filters")}
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
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{t("services.noResults")}</h3>
                <p className="text-muted-foreground">{t("services.tryDifferent")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
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
                          <AvatarImage src={product.seller.avatarUrl || undefined} />
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
                        onClick={() => {
                          setSelectedProduct(product);
                          setPurchaseDialogOpen(true);
                        }}
                        disabled={!user || user.id === product.sellerId}
                        data-testid={`button-buy-${product.id}`}
                      >
                        {!user ? t("services.loginToBuy") : (user.id === product.sellerId) ? t("services.yourProduct") : t("services.buyNow")}
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
                  {t("services.loadMore")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="glass-morphism-strong border-border/50">
          <DialogHeader>
            <DialogTitle>{t("services.confirmPurchase")}</DialogTitle>
            <DialogDescription>
              {t("services.reviewDetails")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("services.service")}:</span>
                  <span className="font-medium">{selectedProduct.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("services.seller")}:</span>
                  <span className="font-medium">{selectedProduct.seller.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("services.price")}:</span>
                  <span className="font-bold text-primary">${selectedProduct.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("services.yourBalance")}:</span>
                  <span className="font-medium">${user?.balance}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">{t("services.balanceAfter")}:</span>
                  <span className="font-bold">
                    ${(parseFloat(user?.balance || "0") - parseFloat(selectedProduct.price)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-border/50" 
                  onClick={() => setPurchaseDialogOpen(false)}
                  disabled={purchaseMutation.isPending}
                  data-testid="button-cancel-purchase"
                >
                  {t("services.cancel")}
                </Button>
                <Button 
                  className="flex-1 neon-glow-primary" 
                  onClick={() => purchaseMutation.mutate(selectedProduct.id)}
                  disabled={purchaseMutation.isPending}
                  data-testid="button-confirm-purchase"
                >
                  {purchaseMutation.isPending ? t("services.processing") : t("services.confirm")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
