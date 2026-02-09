import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LanguageProvider, useLanguage } from "@/lib/language-context";
import { NeonBackground } from "@/components/neon-background";
import { AppNavbar } from "@/components/app-navbar";
import { MobileMenu } from "@/components/mobile-menu";
import { PageTransition } from "@/components/page-transition";
import { Menu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingSupport from "@/components/FloatingSupport";
import { TelegramDialog } from "@/components/telegram-dialog";
import { useState, lazy, Suspense } from "react";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/dashboard").then(module => ({ default: module.Dashboard })));
const AuthPage = lazy(() => import("./pages/auth").then(module => ({ default: module.AuthPage })));
const ServicesPage = lazy(() => import("./pages/services").then(module => ({ default: module.ServicesPage })));
const ServiceDetailPage = lazy(() => import("./pages/service-detail").then(module => ({ default: module.ServiceDetailPage })));
const WalletPage = lazy(() => import("./pages/wallet").then(module => ({ default: module.WalletPage })));
const MyProductsPage = lazy(() => import("./pages/my-products").then(module => ({ default: module.MyProductsPage })));
const PromotePage = lazy(() => import("./pages/promote").then(module => ({ default: module.PromotePage })));
const ProfilePage = lazy(() => import("./pages/profile").then(module => ({ default: module.ProfilePage })));
const MyChatsPage = lazy(() => import("./pages/my-chats").then(module => ({ default: module.MyChatsPage })));
const SellerProfilePage = lazy(() => import("./pages/seller-profile").then(module => ({ default: module.SellerProfilePage })));
const AdminDashboard = lazy(() => import("./pages/admin"));
const NotFound = lazy(() => import("./pages/not-found"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse neon-text-glow text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user && location !== "/login" && location !== "/register") {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function Router() {
  const [location] = useLocation();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show a simple loading state while auth is initializing to avoid white screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse neon-text-glow text-2xl font-accent">فيرو</div>
      </div>
    );
  }

  // Auth routes (no navbar)
  if (location === "/login" || location === "/register") {
    return (
      <>
        <NeonBackground />
        <PageTransition>
          <Switch>
            <Route path="/login" component={() => <AuthPage mode="login" />} />
            <Route path="/register" component={() => <AuthPage mode="register" />} />
          </Switch>
        </PageTransition>
      </>
    );
  }

  // Main layout with navbar
  return (
    <>
      <div className="min-h-screen w-full">
        <NeonBackground />
        
        {/* Main Content Area */}
        <div className="flex flex-col relative">
          {/* Top Header */}
          <header className="sticky top-0 z-50 w-full border-b border-border/50 glass-morphism">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              {/* Logo (left on desktop, center on mobile) */}
              <div className="flex items-center">
                <h1 className="text-2xl font-accent font-bold neon-text-glow tracking-tight md:ml-0">
                  {t("home.title")}
                </h1>
              </div>
              
              {/* Desktop Navigation - Centered */}
              <div className="hidden md:flex flex-1 justify-center">
                <AppNavbar user={user} onLogout={logout} />
              </div>
              
              {/* Mobile Hamburger Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 pb-16 md:pb-0">
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/admin" component={AdminDashboard} />
                  <Route path="/services" component={ServicesPage} />
                  <Route path="/service/:id" component={ServiceDetailPage} />
                  <Route path="/@:username">
                    {(params: { username: string }) => <SellerProfilePage username={params.username} />}
                  </Route>
                  <Route path="/seller/:id">
                    {(params: { id: string }) => <SellerProfilePage id={params.id} />}
                  </Route>
                  <Route path="/wallet">
                    <ProtectedRoute>
                      <WalletPage />
                    </ProtectedRoute>
                  </Route>
                  <Route path="/my-products">
                    <ProtectedRoute>
                      <MyProductsPage />
                    </ProtectedRoute>
                  </Route>
                  <Route path="/promote">
                    <ProtectedRoute>
                      <PromotePage />
                    </ProtectedRoute>
                  </Route>
                  <Route path="/profile">
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  </Route>
                  <Route path="/my-chats">
                    <ProtectedRoute>
                      <MyChatsPage />
                    </ProtectedRoute>
                  </Route>
                  <Route component={NotFound} />
                </Switch>
              </PageTransition>
            </Suspense>
          </main>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        user={user} 
        onLogout={logout} 
        open={mobileMenuOpen} 
        onOpenChange={setMobileMenuOpen} 
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider defaultTheme="dark">
            <TooltipProvider>
              <Toaster />
              <FloatingSupport />
              <TelegramDialog />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
