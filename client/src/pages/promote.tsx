import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  TrendingUp,
  Star,
  Zap,
  Crown,
  Check
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, Promotion, InsertPromotion } from "@shared/schema";

export function PromotePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [openDialogTier, setOpenDialogTier] = useState<string | null>(null);

  // Fetch user's products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({ 
    queryKey: ['/api/users', user?.id, 'products'], 
    enabled: !!user 
  });

  // Fetch active promotions
  const { data: promotions = [], isLoading: promotionsLoading } = useQuery<Promotion[]>({ 
    queryKey: ['/api/promotions/active'] 
  });

  // Create promotion mutation
  const createPromotionMutation = useMutation({
    mutationFn: async (data: InsertPromotion) => {
      const res = await apiRequest('POST', '/api/promotions', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'products'] });
      toast({
        title: "Success!",
        description: "Your promotion has been created successfully.",
      });
      setOpenDialogTier(null);
      setSelectedProductId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create promotion",
        variant: "destructive",
      });
    },
  });

  const promotionTiers = [
    {
      tier: "top_3" as const,
      name: "Premium Spotlight",
      price: 5,
      position: "Top 3",
      icon: Crown,
      color: "text-yellow-500",
      glowClass: "neon-glow-primary",
      duration: 7,
      benefits: [
        "Featured in top 3 products",
        "Maximum visibility",
        "Highlighted with gold badge",
        "7 days promotion",
        "Priority in search results"
      ],
      description: "Get maximum exposure with premium placement"
    },
    {
      tier: "top_5" as const,
      name: "Featured Position",
      price: 3,
      position: "Top 5",
      icon: Star,
      color: "text-primary",
      glowClass: "neon-glow-secondary",
      duration: 5,
      benefits: [
        "Featured in top 5 products",
        "High visibility",
        "Featured badge",
        "5 days promotion",
        "Boosted in search"
      ],
      description: "Stand out with featured positioning"
    },
    {
      tier: "top_10" as const,
      name: "Visibility Boost",
      price: 2,
      position: "Top 10",
      icon: TrendingUp,
      color: "text-secondary",
      glowClass: "border-secondary/30",
      duration: 3,
      benefits: [
        "Featured in top 10 products",
        "Good visibility",
        "Promoted badge",
        "3 days promotion",
        "Search ranking boost"
      ],
      description: "Get your service noticed"
    },
  ];

  const handleCreatePromotion = (tier: typeof promotionTiers[number]) => {
    if (!selectedProductId) {
      toast({
        title: "Error",
        description: "Please select a product to promote",
        variant: "destructive",
      });
      return;
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + tier.duration);

    const promotionData: InsertPromotion = {
      productId: selectedProductId,
      tier: tier.tier,
      price: tier.price.toString(),
      endDate,
    };

    createPromotionMutation.mutate(promotionData);
  };

  // Get user's active promotions
  const userPromotions = promotions.filter(promo => {
    const product = products.find(p => p.id === promo.productId);
    return product && promo.isActive;
  });

  // Calculate days remaining for a promotion
  const getDaysRemaining = (endDate: Date | string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  // Get tier display info
  const getTierInfo = (tier: string) => {
    const tierMap: Record<string, { name: string; position: string }> = {
      top_3: { name: "Premium Spotlight", position: "Top 3" },
      top_5: { name: "Featured Position", position: "Top 5" },
      top_10: { name: "Visibility Boost", position: "Top 10" },
    };
    return tierMap[tier] || { name: "Unknown", position: "N/A" };
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3" data-testid="heading-promote">
            <Megaphone className="w-10 h-10 text-primary" />
            Promote Your Services
          </h1>
          <p className="text-muted-foreground" data-testid="text-description">
            Boost your visibility and reach more customers with our promotion packages
          </p>
        </div>

        {/* Promotion Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {promotionTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card 
                key={tier.tier}
                className={`glass-morphism border-border/30 hover:border-primary/50 transition-all group relative overflow-hidden ${tier.glowClass}`}
                data-testid={`card-tier-${tier.tier}`}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
                
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-8 h-8 ${tier.color}`} />
                    <Badge className={`${tier.color} border-current/30 neon-pulse`} data-testid={`badge-position-${tier.tier}`}>
                      {tier.position}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl" data-testid={`text-tier-name-${tier.tier}`}>{tier.name}</CardTitle>
                  <CardDescription data-testid={`text-tier-description-${tier.tier}`}>{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-primary neon-text-glow" data-testid={`text-price-${tier.tier}`}>${tier.price}</span>
                      <span className="text-muted-foreground">/promotion</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm" data-testid={`text-benefit-${tier.tier}-${index}`}>
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Dialog open={openDialogTier === tier.tier} onOpenChange={(open) => setOpenDialogTier(open ? tier.tier : null)}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full neon-glow-secondary"
                        data-testid={`button-select-${tier.tier}`}
                        disabled={productsLoading || products.length === 0}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Select Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-morphism-strong border-border/50">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2" data-testid={`text-dialog-title-${tier.tier}`}>
                          <Icon className={`w-6 h-6 ${tier.color}`} />
                          {tier.name} - ${tier.price}
                        </DialogTitle>
                        <DialogDescription data-testid={`text-dialog-description-${tier.tier}`}>
                          Select a product to promote with {tier.name} package
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="product-select">Select Product</Label>
                          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                            <SelectTrigger className="glass-morphism border-border/50 mt-2" data-testid={`select-product-${tier.tier}`}>
                              <SelectValue placeholder="Choose a product to promote" />
                            </SelectTrigger>
                            <SelectContent className="glass-morphism-strong border-border/50">
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id} data-testid={`option-product-${product.id}`}>
                                  {product.title} - ${product.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Card className="glass-morphism border-primary/20">
                          <CardContent className="pt-6">
                            <h4 className="font-semibold mb-3">Promotion Summary</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Package:</span>
                                <span className="font-medium" data-testid={`text-summary-package-${tier.tier}`}>{tier.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Position:</span>
                                <span className="font-medium" data-testid={`text-summary-position-${tier.tier}`}>{tier.position}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="font-medium" data-testid={`text-summary-duration-${tier.tier}`}>
                                  {tier.duration} days
                                </span>
                              </div>
                              <div className="border-t border-border/50 pt-2 mt-2 flex justify-between">
                                <span className="font-semibold">Total:</span>
                                <span className="text-xl font-bold text-primary neon-text-glow" data-testid={`text-summary-total-${tier.tier}`}>${tier.price}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <DialogFooter>
                        <Button 
                          className="w-full neon-glow-primary"
                          data-testid={`button-confirm-promotion-${tier.tier}`}
                          onClick={() => handleCreatePromotion(tier)}
                          disabled={createPromotionMutation.isPending || !selectedProductId}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          {createPromotionMutation.isPending ? "Creating..." : "Start Promotion"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Promotions */}
        <Card className="glass-morphism border-border/30">
          <CardHeader>
            <CardTitle data-testid="heading-active-promotions">Active Promotions</CardTitle>
            <CardDescription data-testid="text-active-promotions-description">Your currently running promotion campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            {promotionsLoading ? (
              <div className="space-y-4" data-testid="loading-promotions">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : userPromotions.length > 0 ? (
              <div className="space-y-4">
                {userPromotions.map((promotion) => {
                  const product = products.find(p => p.id === promotion.productId);
                  const tierInfo = getTierInfo(promotion.tier);
                  const daysRemaining = getDaysRemaining(promotion.endDate);
                  
                  if (!product) return null;

                  return (
                    <div 
                      key={promotion.id} 
                      className="flex items-center justify-between p-4 rounded-lg glass-morphism border border-border/30"
                      data-testid={`card-active-promotion-${promotion.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Megaphone className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium" data-testid={`text-promotion-product-${promotion.id}`}>{product.title}</p>
                          <p className="text-sm text-muted-foreground" data-testid={`text-promotion-tier-${promotion.id}`}>
                            {tierInfo.name} ({tierInfo.position})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          className="bg-green-500/20 text-green-500 border-green-500/30 mb-2"
                          data-testid={`badge-status-${promotion.id}`}
                        >
                          Active
                        </Badge>
                        <p className="text-sm text-muted-foreground" data-testid={`text-days-remaining-${promotion.id}`}>
                          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12" data-testid="empty-promotions">
                <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground" data-testid="text-no-promotions">No active promotions</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start promoting your services to increase visibility
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
