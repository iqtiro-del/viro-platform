import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
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
  X,
  AlertCircle,
  MessageCircle
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
import type { ProductWithSeller, Chat } from "@shared/schema";
import { ChatDialog } from "@/components/chat-dialog";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUserAvatar } from "@/lib/utils";

export function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSeller | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [purchasedProductData, setPurchasedProductData] = useState<any>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [purchasedChat, setPurchasedChat] = useState<Chat | null>(null);

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
      
      setPurchaseDialogOpen(false);
      
      // Always show product details dialog after purchase
      setPurchasedProductData(data.product);
      setPurchasedChat(data.chat);
      setCredentialsDialogOpen(true);
      
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
              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id}
                    className="glass-morphism border-border/30 hover:border-primary/50 transition-all hover-elevate group"
                    data-testid={`card-product-${product.id}`}
                  >
                    {/* Service Image - Larger on mobile */}
                    <div className="h-52 md:h-40 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag className="w-16 md:w-12 h-16 md:h-12 text-primary/40" />
                      </div>
                      <Badge className="absolute top-3 right-3 md:top-2 md:right-2 bg-primary/90 neon-glow-primary text-sm md:text-xs">
                        {product.category}
                      </Badge>
                    </div>

                    {/* Card Header - Title and Seller Info */}
                    <CardHeader className="pb-4 md:pb-3 pt-5 md:pt-6">
                      {/* Title */}
                      <CardTitle className="text-lg md:text-base mb-3 md:mb-0">
                        <span className="line-clamp-2 md:line-clamp-1">{product.title}</span>
                      </CardTitle>
                      
                      {/* Seller Info - Hidden on mobile, shown on desktop */}
                      <CardDescription className="hidden md:flex items-center space-x-2 text-sm">
                        <Link href={`/seller/${product.seller.id}`}>
                          <button 
                            className="flex items-center space-x-2 hover-elevate rounded-md p-1 -m-1 transition-all"
                            data-testid={`link-seller-${product.seller.id}`}
                          >
                            <Avatar className="w-5 h-5 border border-primary/30">
                              <AvatarImage src={getUserAvatar(product.seller.id)} />
                              <AvatarFallback className="text-xs bg-primary/20">
                                {product.seller.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="hover:text-primary transition-colors">{product.seller.username}</span>
                          </button>
                        </Link>
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
                      {/* Description */}
                      <p className="text-base md:text-sm text-muted-foreground mb-4 md:mb-3 line-clamp-3 md:line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                      
                      {/* Mobile-only pricing - Stacked: old price → new price */}
                      <div className="mb-4 md:hidden">
                        {product.oldPrice && parseFloat(product.oldPrice) > 0 && (
                          <p className="text-lg text-red-500 line-through font-medium mb-1">
                            ${product.oldPrice}
                          </p>
                        )}
                        <p className="text-2xl font-bold text-primary neon-text-glow mb-4">
                          ${product.price}
                        </p>
                      </div>

                      {/* Desktop-only pricing section - Rating and price on same line */}
                      <div className="hidden md:flex md:items-center md:justify-between md:mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-semibold">{product.seller.rating || "0.00"}</span>
                          <span className="text-xs text-muted-foreground">({product.seller.totalReviews || 0})</span>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          {product.oldPrice && parseFloat(product.oldPrice) > 0 && (
                            <p className="text-sm text-red-500 line-through" data-testid={`text-old-price-${product.id}`}>
                              ${product.oldPrice}
                            </p>
                          )}
                          <p className="text-lg font-bold text-primary neon-text-glow" data-testid={`text-price-${product.id}`}>
                            ${product.price}
                          </p>
                        </div>
                      </div>

                      {/* Buy Button - Wide and tall on mobile */}
                      <Button 
                        className="w-full neon-glow-secondary h-12 md:h-9 text-base md:text-sm font-semibold" 
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
                  <div className="flex flex-col items-end gap-1">
                    {selectedProduct.oldPrice && parseFloat(selectedProduct.oldPrice) > 0 && (
                      <span className="text-sm text-red-500 line-through">${selectedProduct.oldPrice}</span>
                    )}
                    <span className="font-bold text-primary">${selectedProduct.price}</span>
                  </div>
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

      {/* Product Details Dialog - Shows after purchase */}
      <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="glass-morphism-strong border-border/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("services.purchaseSuccess")}</DialogTitle>
            <DialogDescription>
              {t("services.saveCredentials")}
            </DialogDescription>
          </DialogHeader>
          
          {purchasedProductData && (
            <div className="space-y-6 pt-4">
              {/* Product Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-foreground">{purchasedProductData.title}</h3>
                <p className="text-sm text-muted-foreground">{purchasedProductData.description}</p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("services.category")}: </span>
                    <span className="font-medium text-foreground">{purchasedProductData.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("services.price")}: </span>
                    <span className="font-bold text-primary">${purchasedProductData.price}</span>
                  </div>
                </div>
              </div>

              {/* Product Details/Credentials - Only show if at least one field has a value */}
              {purchasedProductData.credentials && (
                purchasedProductData.credentials.accountUsername || 
                purchasedProductData.credentials.accountPassword || 
                purchasedProductData.credentials.accountEmail || 
                purchasedProductData.credentials.accountEmailPassword
              ) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">{t("services.accountCredentials")}</h4>
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-md space-y-3">
                    <div className="space-y-2">
                      {purchasedProductData.credentials.accountUsername && (
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-sm text-muted-foreground">{t("myProducts.accountUsername")}:</span>
                          <span className="font-medium text-foreground break-all text-right">{purchasedProductData.credentials.accountUsername}</span>
                        </div>
                      )}
                      {purchasedProductData.credentials.accountPassword && (
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-sm text-muted-foreground">{t("myProducts.accountPassword")}:</span>
                          <span className="font-medium text-foreground break-all text-right">{purchasedProductData.credentials.accountPassword}</span>
                        </div>
                      )}
                      {purchasedProductData.credentials.accountEmail && (
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-sm text-muted-foreground">{t("myProducts.accountEmail")}:</span>
                          <span className="font-medium text-foreground break-all text-right">{purchasedProductData.credentials.accountEmail}</span>
                        </div>
                      )}
                      {purchasedProductData.credentials.accountEmailPassword && (
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-sm text-muted-foreground">{t("myProducts.accountEmailPassword")}:</span>
                          <span className="font-medium text-foreground break-all text-right">{purchasedProductData.credentials.accountEmailPassword}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-yellow-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {t("services.saveCredentials")}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="flex-1" 
                  onClick={() => {
                    setCredentialsDialogOpen(false);
                    setPurchasedProductData(null);
                    setPurchasedChat(null);
                    toast({
                      title: t("services.purchaseSuccess"),
                      description: t("services.credentialsDelivered"),
                    });
                  }}
                  data-testid="button-close-credentials"
                >
                  {t("common.close")}
                </Button>
                {purchasedChat && (
                  <Button 
                    className="flex-1 neon-glow-primary gap-2" 
                    onClick={() => {
                      setCredentialsDialogOpen(false);
                      setChatDialogOpen(true);
                    }}
                    data-testid="button-open-chat"
                  >
                    <MessageCircle className="w-4 h-4" />
                    محادثة البائع
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      {purchasedChat && user && (
        <ChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          chatId={purchasedChat.id}
          currentUser={user}
        />
      )}
    </div>
  );
}
