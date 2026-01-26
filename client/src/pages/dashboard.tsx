import { useState } from "react";
import { Link } from "wouter";
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
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Background - Built into layout but enhanced for hero */}
        <div className="absolute inset-0 z-0">
          <NeonBackground />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
          
          {/* Large space-themed glowing orbs */}
          <div className="absolute top-[20%] left-[5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Title with enhanced styling */}
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Badge className="py-1.5 px-4 bg-primary/15 text-primary border-primary/30 backdrop-blur-md neon-glow-primary">
                <Sparkles className="w-4 h-4 ml-2" />
                {t("home.subtitle")}
              </Badge>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-accent font-bold mb-8 neon-text-glow tracking-tighter leading-tight animate-in fade-in zoom-in-95 duration-1000">
              {t("home.title")}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground/90 mb-14 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
              {t("home.description")}
            </p>

            {/* Auth Buttons for non-logged in users */}
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <Button 
                  size="lg" 
                  onClick={() => setLoginDialogOpen(true)}
                  className="w-full sm:w-64 neon-glow-primary text-xl h-16 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95" 
                  data-testid="button-hero-login"
                >
                  <LogIn className="w-6 h-6 ml-2" />
                  {t("auth.login")}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setRegisterDialogOpen(true)}
                  className="w-full sm:w-64 border-primary/40 bg-background/5 text-xl h-16 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-primary/5 hover:border-primary active:scale-95"
                  data-testid="button-hero-signup"
                >
                  <UserPlus className="w-6 h-6 ml-2" />
                  {t("auth.signUp")}
                </Button>
              </div>
            ) : (
              /* Enhanced Search Bar for logged in users */
              <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <div className="relative glass-morphism-strong border-2 border-primary/30 rounded-[2rem] shadow-2xl p-2 transition-all duration-500 hover:border-primary/50 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-[2rem] opacity-50" />
                  <div className="relative flex items-center">
                    <Search className="absolute left-6 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder={t("home.search.placeholder")} 
                      className="pl-16 pr-44 h-16 bg-transparent border-0 text-xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                      data-testid="input-search"
                    />
                    <Button 
                      size="lg"
                      className="absolute right-2 neon-glow-secondary h-12 px-8 rounded-3xl text-lg font-bold"
                      data-testid="button-search"
                    >
                      <Zap className="w-5 h-5 ml-2" />
                      {t("home.search.button")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modern Stats Cards Section */}
      <section className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index}
                className="group relative overflow-hidden glass-morphism-strong border-2 border-white/5 hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 rounded-3xl"
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                      stat.iconBg
                    )}>
                      <Icon className={cn("w-8 h-8", stat.iconColor)} />
                    </div>
                    <div>
                      <p className="text-4xl font-bold tracking-tight mb-1">{stat.value}</p>
                      <p className="text-muted-foreground font-medium">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Featured Services - Modern Grid */}
      <section className="container mx-auto px-4 py-24 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] -z-10" />
        <div className="mb-16 text-center md:text-right">
          <Badge variant="outline" className="mb-4 border-secondary/30 text-secondary px-4 py-1">
            {t("home.featuredServices.subtitle")}
          </Badge>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <h2 className="text-5xl font-bold bg-gradient-to-l from-foreground to-foreground/60 bg-clip-text text-transparent">
              {t("home.featuredServices")}
            </h2>
            <Button 
              variant="ghost" 
              className="group hover:bg-primary/10 text-primary gap-2 text-lg" 
              data-testid="button-view-all"
            >
              {t("home.viewAll")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
            </Button>
          </div>
        </div>

        {/* Product Grid with enhanced spacing and animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {productsLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="glass-morphism border-white/5 overflow-hidden h-[450px]">
                <Skeleton className="h-full w-full" />
              </Card>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full">
              <Card className="glass-morphism border-white/5 bg-white/5">
                <CardContent className="text-center py-24">
                  <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20">
                    <ShoppingBag className="w-12 h-12 text-primary/40" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{t("home.noServices")}</h3>
                  <p className="text-muted-foreground text-lg">{t("home.noServices.description")}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            products.slice(0, 6).map((product, idx) => (
              <Card 
                key={product.id} 
                className="group relative glass-morphism border-white/5 hover:border-primary/30 transition-all duration-500 hover:-translate-y-3 overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-white/[0.03] to-transparent"
                data-testid={`card-service-${product.id}`}
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                    <ShoppingBag className="w-24 h-24 text-white/5" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                  </div>
                  
                  {/* Category Float */}
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-background/40 backdrop-blur-xl border-white/10 text-white font-medium px-4 py-1.5 rounded-full">
                      {getCategoryLabel(product.category)}
                    </Badge>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-6 left-6">
                    <div className="bg-primary/90 text-white px-5 py-2 rounded-2xl font-bold text-2xl shadow-xl neon-glow-primary">
                      ${product.price}
                    </div>
                  </div>
                </div>

                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-bold line-clamp-1 group-hover:text-primary transition-colors mb-4">
                    {product.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-white/10 p-0.5">
                      <AvatarImage src={product.seller.avatarUrl || undefined} className="rounded-full" />
                      <AvatarFallback className="bg-secondary/20">
                        {product.seller.fullName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg leading-none">{product.seller.fullName}</p>
                        {product.seller.isVerified && (
                          <BadgeCheck className="w-5 h-5 text-secondary animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm font-bold text-foreground/80">{product.seller.rating || "5.0"}</span>
                        <span className="text-xs text-muted-foreground">({product.seller.totalReviews || 0})</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8 pt-4">
                  <Link href={`/service/${product.id}`}>
                    <Button 
                      className="w-full h-14 rounded-2xl bg-white/5 hover:bg-primary text-white border border-white/10 hover:border-primary transition-all duration-500 font-bold text-lg group/btn" 
                      data-testid={`button-view-service-${product.id}`}
                    >
                      {t("home.viewDetails")}
                      <ArrowRight className="w-5 h-5 mr-3 group-hover/btn:translate-x-[-4px] transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Final CTA Section - Ultra Modern */}
      <section className="container mx-auto px-4 pb-32">
        <div className="relative group p-1 rounded-[3rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x opacity-30 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative bg-background rounded-[2.9rem] overflow-hidden">
            <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[200%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
            <div className="relative z-10 px-8 py-24 md:py-32 text-center">
              <div className="max-w-4xl mx-auto">
                <Badge className="mb-8 bg-secondary/10 text-secondary border-secondary/20 px-6 py-2 rounded-full text-lg">
                  {t("home.cta.getStarted")}
                </Badge>
                <h2 className="text-5xl md:text-8xl font-bold mb-10 tracking-tighter leading-none">
                  {t("home.cta.title")}
                </h2>
                <p className="text-xl md:text-3xl text-muted-foreground/80 mb-14 leading-relaxed font-light">
                  {t("home.cta.description")}
                </p>
                <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-80 h-20 rounded-3xl bg-primary text-white text-2xl font-black shadow-[0_0_50px_-12px_rgba(168,85,247,0.5)] hover:shadow-primary/40 transition-all duration-500" 
                    data-testid="button-start-selling"
                  >
                    {t("home.cta.getStarted")}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-80 h-20 rounded-3xl border-white/10 bg-white/5 text-2xl font-bold backdrop-blur-xl hover:bg-white/10 transition-all"
                  >
                    {t("home.learnMore")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
