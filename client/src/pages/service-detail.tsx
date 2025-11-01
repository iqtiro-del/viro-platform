import { useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { queryClient } from "@/lib/queryClient";
import { getProductImage } from "@/lib/category-images";
import { getUserAvatar } from "@/lib/utils";
import { 
  Star, 
  BadgeCheck, 
  ShoppingBag, 
  Eye,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import type { ProductWithSeller } from "@shared/schema";

export function ServiceDetailPage() {
  const [, params] = useRoute("/service/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const productId = params?.id;

  const { data: product, isLoading } = useQuery<ProductWithSeller>({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
  });

  useEffect(() => {
    if (product && !isLoading) {
      const updateViews = async () => {
        try {
          await fetch(`/api/products/${productId}/view`, {
            method: 'POST',
          });
          queryClient.invalidateQueries({ queryKey: ['/api/products', productId] });
        } catch (error) {
          console.error('Failed to update views:', error);
        }
      };
      updateViews();
    }
  }, [product, productId, isLoading]);

  const purchaseMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      const res = await fetch(`/api/products/${productId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: user.id }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Purchase failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId] });
      toast({
        title: t("services.purchaseSuccess"),
        description: t("services.purchaseSuccess.description"),
      });
      navigate("/my-chats");
    },
    onError: (error: Error) => {
      toast({
        title: t("services.purchaseError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Skeleton className="h-96 w-full mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass-morphism text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">{t("services.notFound")}</h2>
            <Button onClick={() => navigate("/")}>{t("common.goHome")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnProduct = user?.id === product.sellerId;
  const canPurchase = user && !isOwnProduct && product.isActive;

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 hover-elevate"
          onClick={() => navigate("/services")}
          data-testid="button-back"
        >
          {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          {t("common.back")}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <Card className="glass-morphism overflow-hidden">
              <div className="relative h-96">
                <img 
                  src={getProductImage(product.category, product.imageUrl)}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <Badge className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm neon-glow-primary">
                  {product.category}
                </Badge>
                {!product.isActive && (
                  <Badge className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-sm">
                    {t("services.inactive")}
                  </Badge>
                )}
              </div>
            </Card>

            {/* Title and Description */}
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="text-3xl mb-4">{product.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Service Details */}
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="text-xl">{t("services.details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border/30">
                  <span className="text-muted-foreground">{t("services.category")}</span>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/30">
                  <span className="text-muted-foreground">{t("services.views")}</span>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{product.views || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground">{t("services.sales")}</span>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{product.sales || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Seller and Purchase */}
          <div className="space-y-6">
            {/* Seller Card */}
            <Card className="glass-morphism sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">{t("services.seller")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seller Info */}
                <Link href={`/seller/${product.seller.id}`}>
                  <button 
                    className="flex items-center gap-3 w-full hover-elevate rounded-lg p-3 -m-3 transition-all"
                    data-testid="link-seller-profile"
                  >
                    <Avatar className="w-16 h-16 border-2 border-primary/30 ring-2 ring-background">
                      <AvatarImage src={getUserAvatar(product.seller.id)} />
                      <AvatarFallback className="text-lg bg-primary/20">
                        {product.seller.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <h4 className="font-semibold">{product.seller.fullName}</h4>
                        {product.seller.isVerified && (
                          <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">@{product.seller.username}</p>
                    </div>
                  </button>
                </Link>

                {/* Rating */}
                <div className="flex items-center justify-between py-3 border-t border-border/30">
                  <span className="text-sm text-muted-foreground">{t("services.rating")}</span>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold">{product.seller.rating || "0.0"}</span>
                    <span className="text-xs text-muted-foreground">({product.seller.totalReviews || 0})</span>
                  </div>
                </div>

                {/* Price */}
                <div className="py-4 border-t border-border/30">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t("services.price")}</span>
                    <div className="flex items-baseline gap-2">
                      {product.oldPrice && (
                        <span className="text-sm text-muted-foreground line-through">${product.oldPrice}</span>
                      )}
                      <span className="text-3xl font-bold text-primary">${product.price}</span>
                    </div>
                  </div>
                  {product.oldPrice && (
                    <p className="text-xs text-green-500 text-left">
                      {t("services.discount")} {Math.round((1 - Number(product.price) / Number(product.oldPrice)) * 100)}%
                    </p>
                  )}
                </div>

                {/* Purchase Button */}
                <Button
                  className="w-full neon-glow-primary text-lg h-12"
                  onClick={() => purchaseMutation.mutate(product.id)}
                  disabled={!canPurchase || purchaseMutation.isPending}
                  data-testid="button-purchase"
                >
                  {purchaseMutation.isPending ? (
                    t("services.purchasing")
                  ) : !user ? (
                    t("services.loginToBuy")
                  ) : isOwnProduct ? (
                    t("services.yourProduct")
                  ) : !product.isActive ? (
                    t("services.inactive")
                  ) : (
                    t("services.buyNow")
                  )}
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    {t("services.loginRequired")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
