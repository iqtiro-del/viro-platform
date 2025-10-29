import { useQuery } from "@tanstack/react-query";
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
  CheckCircle2
} from "lucide-react";
import type { ProductWithSeller, User } from "@shared/schema";
import { getUserAvatar } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useState } from "react";

interface SellerProfileData {
  seller: User;
  products: ProductWithSeller[];
}

export function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSeller | null>(null);

  const { data, isLoading } = useQuery<SellerProfileData>({ 
    queryKey: [`/api/sellers/${id}`],
    enabled: !!id
  });

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

  if (!data) {
    return (
      <div className="min-h-screen pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">البائع غير موجود</h3>
            <p className="text-muted-foreground mb-6">لم يتم العثور على البائع المطلوب</p>
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

                  <Link href="/services">
                    <Button 
                      className="w-full neon-glow-secondary" 
                      size="sm"
                      data-testid={`button-view-${product.id}`}
                    >
                      عرض الخدمة
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
