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
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingSupport from "@/components/FloatingSupport";
import { TelegramDialog } from "@/components/telegram-dialog";
import NotFound from "@/pages/not-found";
import { Dashboard } from "@/pages/dashboard";
import { AuthPage } from "@/pages/auth";
import { ServicesPage } from "@/pages/services";
import { ServiceDetailPage } from "@/pages/service-detail";
import { WalletPage } from "@/pages/wallet";
import { MyProductsPage } from "@/pages/my-products";
import { PromotePage } from "@/pages/promote";
import { ProfilePage } from "@/pages/profile";
import { MyChatsPage } from "@/pages/my-chats";
import { SellerProfilePage } from "@/pages/seller-profile";
import AdminDashboard from "@/pages/admin";
import { useState } from "react";

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
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
