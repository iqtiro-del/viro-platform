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

export function PromotePage() {
  // Mock products for selection
  const myProducts = [
    { id: "1", title: "Professional Logo Design", price: "$50" },
    { id: "2", title: "SEO Optimization Package", price: "$120" },
    { id: "3", title: "React Web Development", price: "$200" },
  ];

  const promotionTiers = [
    {
      tier: "top_3",
      name: "Premium Spotlight",
      price: 5,
      position: "Top 3",
      icon: Crown,
      color: "text-yellow-500",
      glowClass: "neon-glow-primary",
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
      tier: "top_5",
      name: "Featured Position",
      price: 3,
      position: "Top 5",
      icon: Star,
      color: "text-primary",
      glowClass: "neon-glow-secondary",
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
      tier: "top_10",
      name: "Visibility Boost",
      price: 2,
      position: "Top 10",
      icon: TrendingUp,
      color: "text-secondary",
      glowClass: "border-secondary/30",
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

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Megaphone className="w-10 h-10 text-primary" />
            Promote Your Services
          </h1>
          <p className="text-muted-foreground">
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
                    <Badge className={`${tier.color} border-current/30 neon-pulse`}>
                      {tier.position}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-primary neon-text-glow">${tier.price}</span>
                      <span className="text-muted-foreground">/promotion</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full neon-glow-secondary"
                        data-testid={`button-select-${tier.tier}`}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Select Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-morphism-strong border-border/50">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Icon className={`w-6 h-6 ${tier.color}`} />
                          {tier.name} - ${tier.price}
                        </DialogTitle>
                        <DialogDescription>
                          Select a product to promote with {tier.name} package
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="product-select">Select Product</Label>
                          <Select>
                            <SelectTrigger className="glass-morphism border-border/50 mt-2" data-testid={`select-product-${tier.tier}`}>
                              <SelectValue placeholder="Choose a product to promote" />
                            </SelectTrigger>
                            <SelectContent className="glass-morphism-strong border-border/50">
                              {myProducts.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.title} - {product.price}
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
                                <span className="font-medium">{tier.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Position:</span>
                                <span className="font-medium">{tier.position}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="font-medium">
                                  {tier.tier === 'top_3' ? '7 days' : tier.tier === 'top_5' ? '5 days' : '3 days'}
                                </span>
                              </div>
                              <div className="border-t border-border/50 pt-2 mt-2 flex justify-between">
                                <span className="font-semibold">Total:</span>
                                <span className="text-xl font-bold text-primary neon-text-glow">${tier.price}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <DialogFooter>
                        <Button 
                          className="w-full neon-glow-primary"
                          data-testid={`button-confirm-promotion-${tier.tier}`}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Start Promotion
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
            <CardTitle>Active Promotions</CardTitle>
            <CardDescription>Your currently running promotion campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock active promotion */}
              <div className="flex items-center justify-between p-4 rounded-lg glass-morphism border border-border/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Megaphone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Professional Logo Design</p>
                    <p className="text-sm text-muted-foreground">Premium Spotlight (Top 3)</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30 mb-2">
                    Active
                  </Badge>
                  <p className="text-sm text-muted-foreground">3 days remaining</p>
                </div>
              </div>

              {/* Empty state if no promotions */}
              {/* <div className="text-center py-12">
                <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No active promotions</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start promoting your services to increase visibility
                </p>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
