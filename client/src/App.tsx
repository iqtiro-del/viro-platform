import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
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
import { useState } from "react";

function Router() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null); // Will be replaced with real auth

  const handleLogin = (userData: any) => {
    setUser(userData);
    setLocation("/");
  };

  const handleLogout = () => {
    setUser(null);
    setLocation("/login");
  };

  // Auth routes (no navbar)
  if (location === "/login" || location === "/register") {
    return (
      <>
        <NeonBackground />
        <Switch>
          <Route path="/login">
            <AuthPage mode="login" onSuccess={handleLogin} />
          </Route>
          <Route path="/register">
            <AuthPage mode="register" onSuccess={handleLogin} />
          </Route>
        </Switch>
      </>
    );
  }

  return (
    <>
      <NeonBackground />
      <Navbar user={user} onLogout={handleLogout} />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/wallet" component={WalletPage} />
        <Route path="/my-products" component={MyProductsPage} />
        <Route path="/promote" component={PromotePage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
