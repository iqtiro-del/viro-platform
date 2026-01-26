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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* 🚀 New Futuristic Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Layers */}
        <div className="absolute inset-0 z-0">
          <NeonBackground />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_70%)] opacity-80" />
          
          {/* Animated Grid Floor */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[linear-gradient(to_bottom,transparent,hsl(var(--primary)/0.05))] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]">
            <div className="absolute inset-0 bg-[grid-line] opacity-20" style={{ backgroundImage: 'linear-gradient(to right, hsl(var(--primary)/0.2) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary)/0.2) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
          </div>
        </div>

        <div className="container relative z-10 mx-auto px-4 flex flex-col items-center">
          {/* Floating Badge */}
          <div className="mb-12 animate-bounce-slow">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold tracking-widest uppercase text-primary/80">{t("home.subtitle")}</span>
            </div>
          </div>

          {/* Epic Title */}
          <div className="relative mb-10 group">
            <div className="absolute -inset-4 bg-primary/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter leading-[0.8] mb-4 bg-gradient-to-b from-white via-white/80 to-primary/50 bg-clip-text text-transparent animate-in fade-in zoom-in-90 duration-1000">
              فيرو
            </h1>
            <div className="h-2 w-48 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_0_30px_rgba(168,85,247,0.8)]" />
          </div>

          <p className="text-2xl md:text-3xl font-light text-muted-foreground/80 max-w-3xl text-center mb-16 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            {t("home.description")}
          </p>

          {/* Action Hub */}
          {!user ? (
            <div className="flex flex-col md:flex-row gap-8 items-center w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Button 
                size="lg" 
                onClick={() => setLoginDialogOpen(true)}
                className="group relative h-20 w-full md:flex-1 rounded-2xl overflow-hidden bg-primary hover:bg-primary transition-all duration-500 shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10 flex items-center gap-3 text-2xl font-black">
                  <LogIn className="w-7 h-7" />
                  {t("auth.login")}
                </span>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setRegisterDialogOpen(true)}
                className="h-20 w-full md:flex-1 rounded-2xl border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-500 text-2xl font-bold"
              >
                <UserPlus className="w-7 h-7 ml-3" />
                {t("auth.signUp")}
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <div className="relative p-1 rounded-[3rem] bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30">
                <div className="relative flex items-center bg-background/90 rounded-[2.9rem] p-3 backdrop-blur-2xl">
                  <Search className="w-8 h-8 ml-6 text-primary" />
                  <Input 
                    placeholder={t("home.search.placeholder")} 
                    className="flex-1 h-20 bg-transparent border-0 text-2xl focus-visible:ring-0 placeholder:text-muted-foreground/40"
                  />
                  <Button size="lg" className="h-16 px-12 rounded-[2rem] text-xl font-black bg-primary shadow-lg hover:scale-105 active:scale-95 transition-all">
                    {t("home.search.button")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 📊 Holographic Stats Section */}
      <section className="container mx-auto px-4 -mt-32 relative z-20 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="group relative p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent hover:from-primary/20 transition-all duration-700"
              >
                <div className="relative h-full bg-background/40 backdrop-blur-3xl rounded-[2.4rem] p-10 overflow-hidden border border-white/5">
                  {/* Holographic lines */}
                  <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(255,255,255,0.05)_3px)]" />
                  
                  <div className="relative flex flex-col items-center text-center">
                    <div className={cn(
                      "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-2xl",
                      stat.iconBg
                    )}>
                      <Icon className={cn("w-10 h-10", stat.iconColor)} />
                    </div>
                    <h3 className="text-6xl font-black tracking-tighter mb-2 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                      {stat.value}
                    </h3>
                    <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 📦 Minimalist Modern Grid */}
      <section className="container mx-auto px-4 py-32">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20 border-b border-white/5 pb-10">
          <div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-4">
              {t("home.featuredServices")}
            </h2>
            <p className="text-2xl text-muted-foreground max-w-2xl font-light leading-relaxed">
              {t("home.featuredServices.subtitle")}
            </p>
          </div>
          <Button variant="ghost" className="h-20 px-10 text-2xl font-black group hover:bg-white/5 rounded-3xl">
            {t("home.viewAll")}
            <ArrowRight className="w-8 h-8 mr-4 group-hover:translate-x-[-8px] transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {productsLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[500px] rounded-[3rem] bg-white/5 animate-pulse" />
            ))
          ) : (
            products.slice(0, 6).map((product) => (
              <div 
                key={product.id} 
                className="group relative flex flex-col bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-primary/20 rounded-[3rem] transition-all duration-700 overflow-hidden h-full"
              >
                {/* Image Container */}
                <div className="relative h-72 overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag className="w-32 h-32 text-white/5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700" />
                  </div>
                  <Badge className="absolute top-8 left-8 bg-black/40 backdrop-blur-xl border-white/10 text-white px-5 py-2 text-sm rounded-full">
                    {getCategoryLabel(product.category)}
                  </Badge>
                </div>

                <div className="flex-1 p-10 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-6 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-8">
                      <Avatar className="w-14 h-14 border-2 border-white/5">
                        <AvatarImage src={product.seller.avatarUrl || undefined} />
                        <AvatarFallback>{product.seller.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xl">{product.seller.fullName}</p>
                          {product.seller.isVerified && <BadgeCheck className="w-5 h-5 text-secondary" />}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="text-sm font-black">{product.seller.rating || "5.0"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{t("home.startingAt")}</span>
                      <span className="text-4xl font-black text-white">${product.price}</span>
                    </div>
                    <Link href={`/service/${product.id}`}>
                      <Button size="icon" className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-primary transition-all duration-500">
                        <ArrowRight className="w-8 h-8" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 🌌 Gravity CTA Section */}
      <section className="container mx-auto px-4 pb-48">
        <div className="relative rounded-[4rem] overflow-hidden bg-white/[0.02] border border-white/5 p-12 md:p-32 text-center group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10 max-w-5xl mx-auto">
            <h2 className="text-6xl md:text-9xl font-black mb-12 tracking-tighter leading-none">
              {t("home.cta.title")}
            </h2>
            <p className="text-2xl md:text-3xl text-muted-foreground/80 mb-20 leading-relaxed font-light">
              {t("home.cta.description")}
            </p>
            <div className="flex flex-col md:flex-row gap-10 justify-center items-center">
              <Button size="lg" className="h-24 px-16 rounded-[2rem] bg-white text-black hover:bg-white/90 text-3xl font-black transition-all">
                {t("home.cta.getStarted")}
              </Button>
              <Button size="lg" variant="outline" className="h-24 px-16 rounded-[2rem] border-white/10 bg-white/5 backdrop-blur-xl text-3xl font-bold hover:bg-white/10 transition-all">
                {t("home.learnMore")}
              </Button>
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
