import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import { NeonBackground } from "@/components/neon-background";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotFound from "@/pages/not-found";
import { Dashboard } from "@/pages/dashboard";
import { AuthPage } from "@/pages/auth";
import { ServicesPage } from "@/pages/services";
import { WalletPage } from "@/pages/wallet";
import { MyProductsPage } from "@/pages/my-products";
import { PromotePage } from "@/pages/promote";
import { ProfilePage } from "@/pages/profile";

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

  // Auth routes (no navbar)
  if (location === "/login" || location === "/register") {
    return (
      <>
        <NeonBackground />
        <Switch>
          <Route path="/login" component={() => <AuthPage mode="login" />} />
          <Route path="/register" component={() => <AuthPage mode="register" />} />
        </Switch>
      </>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full">
          <NeonBackground />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col relative">
            {/* Top Header with Centered Logo and Hamburger Menu */}
            <header className="sticky top-0 z-40 w-full border-b border-border/50 glass-morphism">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
                {/* Spacer for balance */}
                <div className="w-10"></div>
                
                {/* Centered Logo */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <h1 className="text-2xl font-accent font-bold neon-text-glow tracking-tight">
                    تيرو
                  </h1>
                </div>
                
                {/* Hamburger Menu on the right */}
                <SidebarTrigger className="ml-auto" data-testid="button-sidebar-toggle">
                  <Menu className="h-6 w-6" />
                </SidebarTrigger>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 pb-16 md:pb-0">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/services" component={ServicesPage} />
                <Route path="/wallet" component={WalletPage} />
                <Route path="/my-products" component={MyProductsPage} />
                <Route path="/promote" component={PromotePage} />
                <Route path="/profile" component={ProfilePage} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>

          {/* Right Sidebar */}
          <AppSidebar user={user} onLogout={logout} />
        </div>
      </SidebarProvider>
    </ProtectedRoute>
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
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
