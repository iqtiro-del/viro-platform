import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Users, ShoppingBag, Star, ArrowRight, Zap, Sparkles, BadgeCheck, Loader2, UserPlus, LogIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import type { ProductWithSeller } from "@shared/schema";
import { NeonBackground } from "@/components/neon-background";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, "Full name is required"),
});

export function Dashboard() {
  const { user, login, register: registerUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useQuery<ProductWithSeller[]>({ 
    queryKey: ['/api/products'] 
  });

  const { data: statsData } = useQuery<{ activeServices: number; verifiedSellers: number; totalSales: string }>({
    queryKey: ['/api/stats'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds for real-time updates
    staleTime: 0, // Always fetch fresh data
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
    },
  });

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      await login(data.username, data.password);
      toast({
        title: t("auth.loginSuccess"),
        description: t("auth.welcomeTo"),
      });
      setLoginDialogOpen(false);
      loginForm.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    try {
      await registerUser({
        username: data.username,
        password: data.password,
        fullName: data.fullName,
      });
      toast({
        title: t("auth.accountCreated"),
        description: t("auth.welcomeToPlatform"),
      });
      setRegisterDialogOpen(false);
      registerForm.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Category translation mapping
  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      "Design": t("services.categories.design"),
      "Development": t("services.categories.development"),
      "Marketing": t("services.categories.marketing"),
      "Writing": t("services.categories.writing"),
      "Video & Animation": t("services.categories.videoAnimation"),
      "Music & Audio": t("services.categories.musicAudio"),
    };
    return categoryMap[category] || category;
  };

  const stats = [
    { 
      label: t("home.stats.activeServices"), 
      value: statsData?.activeServices.toString() || "0", 
      icon: ShoppingBag, 
      gradient: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    { 
      label: t("home.stats.verifiedSellers"), 
      value: statsData?.verifiedSellers.toString() || "0", 
      icon: Users, 
      gradient: "from-secondary/20 to-secondary/5",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary"
    },
    { 
      label: t("home.stats.totalSales"), 
      value: `$${statsData?.totalSales || "0"}`, 
      icon: TrendingUp, 
      gradient: "from-accent/20 to-accent/5",
      iconBg: "bg-accent/10",
      iconColor: "text-accent"
    },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Modern Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Neon Background */}
        <div className="absolute inset-0 h-[600px]">
          <NeonBackground />
          <div className="absolute inset-0 bg-background/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Title with enhanced styling */}
            <div className="mb-6">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Sparkles className="w-3 h-3 ml-1" />
                {t("home.subtitle")}
              </Badge>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-accent font-bold mb-6 neon-text-glow tracking-tight">
              {t("home.title")}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              {t("home.description")}
            </p>

            {/* Auth Buttons for non-logged in users */}
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={() => setLoginDialogOpen(true)}
                  className="neon-glow-primary text-lg px-10 h-14 gap-2" 
                  data-testid="button-hero-login"
                >
                  <LogIn className="w-5 h-5" />
                  {t("auth.login")}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setRegisterDialogOpen(true)}
                  className="border-primary/30 hover:border-primary text-lg px-10 h-14 gap-2"
                  data-testid="button-hero-signup"
                >
                  <UserPlus className="w-5 h-5" />
                  {t("auth.signUp")}
                </Button>
              </div>
            ) : (
              /* Enhanced Search Bar for logged in users */
              <div className="max-w-2xl mx-auto">
                <div className="relative glass-morphism-strong border-2 border-primary/40 rounded-xl shadow-2xl neon-glow-primary">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl" />
                  <div className="relative flex items-center">
                    <Search className="absolute left-6 w-5 h-5 text-muted-foreground" />
                    <Input 
                      placeholder={t("home.search.placeholder")} 
                      className="pl-14 pr-40 h-16 bg-transparent border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                      data-testid="input-search"
                    />
                    <Button 
                      size="lg"
                      className="absolute right-3 neon-glow-secondary h-12"
                      data-testid="button-search"
                    >
                      <Zap className="w-4 h-4 ml-2" />
                      {t("home.search.button")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards - Professional Neon Style */}
        <div className="relative z-20 container mx-auto px-4 -mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index}
                  className="group relative overflow-hidden glass-morphism-strong border-2 hover:border-primary/40 transition-all duration-300 hover-elevate shadow-xl"
                  style={{
                    borderColor: index === 0 ? 'hsl(280 85% 65% / 0.3)' : index === 1 ? 'hsl(195 100% 55% / 0.3)' : 'hsl(330 85% 65% / 0.3)',
                  }}
                >
                  {/* Neon glow effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
                    style={{
                      background: index === 0 ? 'hsl(280 85% 65% / 0.15)' : index === 1 ? 'hsl(195 100% 55% / 0.15)' : 'hsl(330 85% 65% / 0.15)',
                    }}
                  />
                  
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      {/* Icon with neon background */}
                      <div 
                        className="p-4 rounded-xl relative"
                        style={{
                          background: index === 0 
                            ? 'linear-gradient(135deg, hsl(280 85% 65% / 0.15), hsl(280 85% 65% / 0.05))'
                            : index === 1 
                            ? 'linear-gradient(135deg, hsl(195 100% 55% / 0.15), hsl(195 100% 55% / 0.05))'
                            : 'linear-gradient(135deg, hsl(330 85% 65% / 0.15), hsl(330 85% 65% / 0.05))',
                        }}
                      >
                        <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                      </div>
                    </div>
                    
                    {/* Value */}
                    <p className="text-5xl font-bold text-foreground mb-3 tracking-tight">{stat.value}</p>
                    
                    {/* Label */}
                    <p className="text-sm font-medium text-muted-foreground/80">{stat.label}</p>
                    
                    {/* Bottom accent line */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 opacity-60"
                      style={{
                        background: index === 0 
                          ? 'linear-gradient(90deg, hsl(280 85% 65% / 0.5), transparent)'
                          : index === 1 
                          ? 'linear-gradient(90deg, hsl(195 100% 55% / 0.5), transparent)'
                          : 'linear-gradient(90deg, hsl(330 85% 65% / 0.5), transparent)',
                      }}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Services - Modern Grid */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full" />
              <h2 className="text-4xl font-bold text-foreground">{t("home.featuredServices")}</h2>
            </div>
            <Button 
              variant="outline" 
              className="border-primary/30 hover:border-primary neon-glow-primary gap-2" 
              data-testid="button-view-all"
            >
              {t("home.viewAll")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-muted-foreground text-lg mr-12">{t("home.featuredServices.subtitle")}</p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productsLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="glass-morphism border-border/30 overflow-hidden">
                <Skeleton className="h-56 rounded-t-lg" />
                <CardHeader className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full">
              <Card className="glass-morphism border-border/30">
                <CardContent className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-primary/50" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">{t("home.noServices")}</h3>
                  <p className="text-muted-foreground">{t("home.noServices.description")}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            products.slice(0, 6).map((product) => (
              <Card 
                key={product.id} 
                className="glass-morphism border-border/30 hover:border-primary/50 transition-all hover-elevate group overflow-hidden"
                data-testid={`card-service-${product.id}`}
              >
                {/* Image with overlay on hover */}
                <div className="relative h-56 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                      <ShoppingBag className="relative w-20 h-20 text-primary/40" />
                    </div>
                  </div>
                  
                  {/* Category badge */}
                  <Badge className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm border-primary/30 text-foreground shadow-lg">
                    {getCategoryLabel(product.category)}
                  </Badge>
                </div>

                <CardHeader className="space-y-3 pb-4">
                  <CardTitle className="text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {product.title}
                  </CardTitle>
                  
                  {/* Seller Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border-2 border-primary/30 ring-2 ring-background">
                      <AvatarImage src={product.seller.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs bg-primary/20 font-semibold">
                        {product.seller.fullName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.seller.fullName}</p>
                    </div>
                    {product.seller.isVerified && (
                      <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Rating and Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-bold text-sm">{product.seller.rating || "0.0"}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">({product.seller.totalReviews || 0})</span>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">{t("home.startingAt")}</p>
                      <p className="text-2xl font-bold text-primary">${product.price}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full neon-glow-secondary group-hover:scale-[1.02] transition-transform" 
                    data-testid={`button-view-service-${product.id}`}
                  >
                    {t("home.viewDetails")}
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* CTA Section - Modern Design */}
      <section className="container mx-auto px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
          
          {/* Content */}
          <Card className="glass-morphism-strong border-primary/30 neon-glow-primary relative">
            <CardContent className="p-12 md:p-20 text-center">
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 mb-4">
                  <Zap className="w-10 h-10 text-primary" />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent">
                    {t("home.cta.title")}
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {t("home.cta.description")}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Button 
                    size="lg" 
                    className="neon-glow-primary text-lg px-8 h-14 gap-2" 
                    data-testid="button-start-selling"
                  >
                    <Zap className="w-5 h-5" />
                    {t("home.cta.getStarted")}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-primary/30 hover:border-primary text-lg px-8 h-14"
                  >
                    {t("home.learnMore")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="glass-morphism-strong border-primary/20 neon-glow-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center neon-text-glow">
              {t("auth.welcomeBack")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("auth.enterCredentials")}
            </DialogDescription>
          </DialogHeader>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.username")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="glass-morphism border-border/50 focus:border-primary focus:ring-primary"
                        data-testid="input-login-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.password")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="glass-morphism border-border/50 focus:border-primary focus:ring-primary"
                        data-testid="input-login-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full neon-glow-primary" 
                disabled={isLoading}
                data-testid="button-login-submit"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("auth.login")}
              </Button>
            </form>
          </Form>
          <div className="text-center text-sm mt-4">
            <span className="text-muted-foreground">{t("auth.dontHaveAccount")}</span>
            {" "}
            <button 
              onClick={() => {
                setLoginDialogOpen(false);
                setRegisterDialogOpen(true);
              }}
              className="text-primary hover:text-primary/80 font-medium"
              data-testid="link-to-signup"
            >
              {t("auth.signUp")}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent className="glass-morphism-strong border-primary/20 neon-glow-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center neon-text-glow">
              {t("auth.createAccount")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("auth.joinTiro")}
            </DialogDescription>
          </DialogHeader>
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.fullName")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="glass-morphism border-border/50 focus:border-primary focus:ring-primary"
                        data-testid="input-register-fullname"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.username")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="glass-morphism border-border/50 focus:border-primary focus:ring-primary"
                        data-testid="input-register-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.password")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="glass-morphism border-border/50 focus:border-primary focus:ring-primary"
                        data-testid="input-register-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full neon-glow-primary" 
                disabled={isLoading}
                data-testid="button-register-submit"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("auth.createAccount")}
              </Button>
            </form>
          </Form>
          <div className="text-center text-sm mt-4">
            <span className="text-muted-foreground">{t("auth.alreadyHaveAccount")}</span>
            {" "}
            <button 
              onClick={() => {
                setRegisterDialogOpen(false);
                setLoginDialogOpen(true);
              }}
              className="text-primary hover:text-primary/80 font-medium"
              data-testid="link-to-login"
            >
              {t("auth.login")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
