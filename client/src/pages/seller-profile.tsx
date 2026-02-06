import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft,
  Star, 
  ShoppingBag,
  CheckCircle2,
  MessageCircle,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductWithSeller, User, Chat } from "@shared/schema";
import { getUserAvatar } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { getProductImage } from "@/lib/category-images";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ChatDialog } from "@/components/chat-dialog";

interface SellerProfileData {
  seller: User;
  products: ProductWithSeller[];
}

export function SellerProfilePage({ username, id: idProp }: { username?: string, id?: string }) {
  const id = username || idProp;
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSeller | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [purchasedProductData, setPurchasedProductData] = useState<any>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [purchasedChat, setPurchasedChat] = useState<Chat | null>(null);

  const { data, isLoading, isError } = useQuery<SellerProfileData>({ 
    queryKey: [`/api/sellers/${id}`],
    enabled: !!id,
    retry: false
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
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/sellers/${id}`] });
      
      setPurchaseDialogOpen(false);
      
      // Show product details dialog after purchase
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

  const handleBuyNow = (product: ProductWithSeller) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: t("services.loginRequired"),
        description: t("services.loginRequiredDescription"),
      });
      return;
    }
    setSelectedProduct(product);
    setPurchaseDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="glass-morphism border-border/30 p-6 mb-8">
            <div className="flex items-start gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glass-morphism border-border/30">
                <Skeleton className="h-40 w-full" />
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">البائع غير موجود</h3>
            <p className="text-muted-foreground mb-6">لم يتم العثور على البائع المطلوب أو رابط غير صحيح</p>
            <Link href="/services">
              <Button variant="outline" className="border-border/50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                العودة إلى الخدمات
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { seller, products } = data;
  const activeProducts = products.filter(p => p.isActive);

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/services">
            <Button 
              variant="outline" 
              className="border-border/50 hover:border-primary/50"
              data-testid="button-back-to-services"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة إلى الخدمات
            </Button>
          </Link>
        </div>

        {/* Seller Profile Card */}
        <Card className="glass-morphism border-border/30 mb-8" data-testid="card-seller-profile">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24 border-2 border-primary/50 neon-glow-primary">
                <AvatarImage src={getUserAvatar(seller.id)} alt={seller.username} />
                <AvatarFallback className="text-2xl bg-primary/20">
                  {seller.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Seller Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-seller-name">
                    {seller.fullName || seller.username}
                  </h1>
                  {seller.isVerified && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-md neon-glow-success">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-500 font-medium">موثق</span>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground mb-1">@{seller.username}</p>
                
                {seller.bio && (
                  <p className="text-foreground mb-4" data-testid="text-seller-bio">{seller.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold" data-testid="text-seller-rating">
                      {seller.rating || "0.00"}
                    </span>
                    <span className="text-muted-foreground">
                      ({seller.totalReviews || 0} تقييم)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <span className="font-semibold" data-testid="text-seller-products-count">
                      {activeProducts.length}
                    </span>
                    <span className="text-muted-foreground">
                      {activeProducts.length === 1 ? 'خدمة منشورة' : 'خدمات منشورة'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seller's Products */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            خدمات {seller.fullName || seller.username}
          </h2>
          <p className="text-muted-foreground">
            تصفح جميع الخدمات المنشورة من هذا البائع
          </p>
        </div>

        {activeProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد خدمات</h3>
            <p className="text-muted-foreground">لم ينشر هذا البائع أي خدمات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeProducts.map((product) => (
              <Card 
                key={product.id}
                className="glass-morphism border-border/30 hover:border-primary/50 transition-all hover-elevate group"
                data-testid={`card-product-${product.id}`}
              >
                {/* Service Image */}
                <div className="h-40 relative overflow-hidden">
                  <img 
                    src={getProductImage(product.category, product.imageUrl)} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-primary/90 neon-glow-primary">
                    {product.category}
                  </Badge>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-base line-clamp-1">{product.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-semibold">{seller.rating || "0.00"}</span>
                      <span className="text-xs text-muted-foreground">({seller.totalReviews || 0})</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {product.oldPrice && parseFloat(product.oldPrice) > 0 && (
                        <p className="text-sm text-red-500 line-through">
                          ${product.oldPrice}
                        </p>
                      )}
                      <p className="text-lg font-bold text-primary neon-text-glow">${product.price}</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full neon-glow-secondary" 
                    size="sm"
                    onClick={() => handleBuyNow(product)}
                    data-testid={`button-view-${product.id}`}
                  >
                    عرض الخدمة
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
          
          {selectedProduct && data && (() => {
            const userBalance = parseFloat(user?.balance || "0");
            const productPrice = parseFloat(selectedProduct.price);
            const balanceAfter = userBalance - productPrice;
            const hasInsufficientBalance = balanceAfter < 0;

            return (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("services.service")}:</span>
                    <span className="font-medium">{selectedProduct.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("services.seller")}:</span>
                    <span className="font-medium">{data.seller.username}</span>
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
                    <span className={`font-bold ${hasInsufficientBalance ? 'text-red-500' : ''}`}>
                      ${balanceAfter.toFixed(2)}
                    </span>
                  </div>
                </div>

                {hasInsufficientBalance && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-500">
                      {t("services.insufficientBalance")}
                    </p>
                  </div>
                )}

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
                    disabled={purchaseMutation.isPending || hasInsufficientBalance}
                    data-testid="button-confirm-purchase"
                  >
                    {purchaseMutation.isPending ? t("services.processing") : t("services.confirm")}
                  </Button>
                </div>
              </div>
            );
          })()}
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
