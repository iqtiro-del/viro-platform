import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { NeonBackground } from "@/components/neon-background";
import { Navbar } from "@/components/navbar";
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
      <NeonBackground />
      <Navbar user={user} onLogout={logout} />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/wallet" component={WalletPage} />
        <Route path="/my-products" component={MyProductsPage} />
        <Route path="/promote" component={PromotePage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
