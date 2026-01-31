import { useState } from "react";
import { Link, useLocation } from "wouter";
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
import { cn } from "@/lib/utils";

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
  const [, setLocation] = useLocation();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden rtl select-none">
      <NeonBackground intensity="high" />
      {/* 🚀 New Futuristic Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-24 overflow-hidden border-b border-primary/10">
        {/* Background Layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_85%)] opacity-95" />
          
          {/* Animated Grid Floor */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[linear-gradient(to_bottom,transparent,hsl(var(--primary)/0.05))] [mask-image:radial-gradient(ellipse_at_center,black,transparent_90%)]">
            <div className="absolute inset-0 bg-[grid-line] opacity-10" style={{ backgroundImage: 'linear-gradient(to right, hsl(var(--primary)/0.2) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary)/0.2) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          </div>
        </div>

        <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center">
          {/* Floating Badge */}
          <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
            <Badge className="px-4 py-1.5 bg-primary/10 text-primary border-primary/20 backdrop-blur-md rounded-full text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 ml-2" />
              {t("home.subtitle")}
            </Badge>
          </div>

          {/* Epic Title */}
          <div className="relative mb-8 group">
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none bg-gradient-to-b from-white via-white/90 to-primary/40 bg-clip-text text-transparent drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              فيرو
            </h1>
            <div className="mt-4 h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
          </div>

          <p className="text-base md:text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            {t("home.description")}
          </p>

          {/* Action Hub */}
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-md">
              <Button 
                size="lg" 
                onClick={() => setLoginDialogOpen(true)}
                className="group relative h-14 w-full sm:flex-1 rounded-2xl overflow-hidden bg-primary hover:bg-primary transition-all duration-300 shadow-xl btn-glow-primary hover-scale"
              >
                <LogIn className="w-5 h-5 ml-2 icon-animate" />
                <span className="text-lg font-bold">{t("auth.login")}</span>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setRegisterDialogOpen(true)}
                className="h-14 w-full sm:flex-1 rounded-2xl border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 text-lg font-bold hover-scale"
              >
                <UserPlus className="w-5 h-5 ml-2 icon-animate" />
                {t("auth.signUp")}
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-2xl">
              <div className="relative p-1 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  className="relative flex items-center bg-background/80 rounded-[0.9rem] p-2 backdrop-blur-xl"
                >
                  <Search className="w-5 h-5 ml-3 text-primary" />
                  <Input 
                    placeholder={t("home.search.placeholder")} 
                    className="flex-1 h-12 bg-transparent border-0 text-lg focus-visible:ring-0 placeholder:text-muted-foreground/40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button 
                    type="submit"
                    size="lg" 
                    className="h-10 px-6 rounded-xl text-base font-bold bg-primary shadow-lg hover:scale-105 transition-all"
                  >
                    {t("home.search.button")}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 📊 Holographic Stats Section */}
      <section className="container mx-auto px-4 py-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="group relative p-px rounded-2xl bg-gradient-to-br from-white/10 to-transparent hover:from-primary/20 transition-all duration-500 hover-lift hover-scale"
              >
                <div className="relative h-full glass-morphism rounded-[0.95rem] p-6 overflow-hidden border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                      stat.iconBg
                    )}>
                      <Icon className={cn("w-6 h-6 icon-animate", stat.iconColor)} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-white">
                        {stat.value}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 📦 Minimalist Modern Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-12 text-center md:text-right">
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">
              {t("home.featuredServices")}
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-xl font-medium">
              {t("home.featuredServices.subtitle")}
            </p>
          </div>
          <Link href="/services">
            <Button variant="ghost" className="h-12 px-6 text-lg font-bold group hover:bg-white/5 rounded-xl border border-white/5">
              {t("home.viewAll")}
              <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-[-4px] transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {productsLoading ? (
            Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
            ))
          ) : (
            products.slice(0, 12).map((product) => (
              <div 
                key={product.id} 
                className="group relative flex flex-col glass-morphism hover:bg-white/[0.05] border border-white/5 hover:border-primary/30 rounded-2xl transition-all duration-500 overflow-hidden hover-lift hover-scale"
              >
                {/* Image Container - Square Aspect Ratio */}
                <Link href={`/service/${product.id}`} className="block relative aspect-square overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                      <ShoppingBag className="w-12 h-12 text-white" />
                    </div>
                  )}
                  
                  {/* Category Float */}
                  <Badge className="absolute top-2 left-2 bg-background/60 backdrop-blur-md border-white/10 text-white px-2 py-0.5 text-[8px] rounded-full uppercase font-bold">
                    {getCategoryLabel(product.category)}
                  </Badge>

                  {/* Price Overlay */}
                  <div className="absolute bottom-2 right-2 bg-primary/90 text-white px-2 py-1 rounded-lg font-black text-xs shadow-lg">
                    ${product.price}
                  </div>
                </Link>

                <div className="p-3 flex flex-col gap-2">
                  <Link href={`/service/${product.id}`}>
                    <h3 className="text-xs font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors h-8">
                      {product.title}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5 border border-primary/20">
                      <AvatarImage src={product.seller.avatarUrl || undefined} />
                      <AvatarFallback className="text-[8px] bg-primary/20">{product.seller.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[10px] truncate leading-none">{product.seller.fullName}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                        <span className="text-[8px] font-black">{product.seller.rating || "5.0"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 🌌 Gravity CTA Section - Replaced with Featured Sellers */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-12 text-center md:text-right">
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">
              أفضل البائعين
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-xl font-medium">
              تواصل مع المحترفين الموثوقين في منصة فيرو
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {productsLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-48 rounded-3xl bg-white/5 animate-pulse" />
            ))
          ) : (
            // Unique sellers from products
            Array.from(new Map(products.map(p => [p.seller.id, p.seller])).values()).slice(0, 6).map((seller) => (
              <Link key={seller.id} href={`/seller/${seller.id}`}>
                <div className="group relative flex flex-col items-center p-6 glass-morphism hover:bg-white/[0.05] border border-white/5 hover:border-primary/30 rounded-3xl transition-all duration-500 cursor-pointer hover-lift hover-scale">
                  <div className="relative mb-4">
                    <Avatar className="w-20 h-20 border-2 border-primary/20 group-hover:border-primary transition-colors hover-scale">
                      <AvatarImage src={seller.avatarUrl || undefined} className="transition-transform duration-500 group-hover:scale-110" />
                      <AvatarFallback className="text-xl bg-primary/20">{seller.fullName[0]}</AvatarFallback>
                    </Avatar>
                    {seller.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1 shadow-lg">
                        <BadgeCheck className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-center truncate w-full mb-1 group-hover:text-primary transition-colors">
                    {seller.fullName}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-[10px] font-black">{seller.rating || "5.0"}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
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
