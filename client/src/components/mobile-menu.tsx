import { Link, useLocation } from "wouter";
import { 
  Home,
  ShoppingBag, 
  Wallet, 
  Package, 
  Megaphone, 
  User,
  LogOut,
  Sun,
  Moon,
  CheckCircle,
  X
} from "lucide-react";
import { useTheme } from "./theme-provider";
import { useLanguage } from "@/lib/language-context";
import { getUserAvatar } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileMenuProps {
  user?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
    isVerified: boolean;
  } | null;
  onLogout?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ user, onLogout, open, onOpenChange }: MobileMenuProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  const navItems = user ? [
    { icon: Home, label: t("nav.dashboard"), path: "/" },
    { icon: ShoppingBag, label: t("nav.services"), path: "/services" },
    { icon: Wallet, label: t("nav.wallet"), path: "/wallet" },
    { icon: Package, label: t("nav.myProducts"), path: "/my-products" },
    { icon: Megaphone, label: t("nav.promote"), path: "/promote" },
  ] : [];

  const handleNavClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-80 glass-morphism-strong border-l border-border/50 p-0"
      >
        <SheetHeader className="p-4 border-b border-border/50">
          <SheetTitle className="text-2xl font-accent font-bold neon-text-glow text-center">
            تيرو
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-5rem)] overflow-y-auto">
          {user ? (
            <>
              {/* User Profile Section */}
              <div className="p-4">
                <Link href="/profile">
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg hover-elevate active-elevate-2 transition-all cursor-pointer" 
                    data-testid="link-profile"
                    onClick={handleNavClick}
                  >
                    <Avatar className="h-12 w-12 border-2 border-primary neon-glow-primary">
                      <AvatarImage src={getUserAvatar(user.id)} alt={user.fullName} />
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {user.fullName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium text-foreground truncate">{user.fullName}</p>
                        {user.isVerified && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" data-testid="icon-verified" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                    </div>
                  </div>
                </Link>
              </div>

              <Separator className="my-2" />

              {/* Navigation Menu */}
              <div className="px-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">{t("nav.navigation")}</p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start gap-3 ${isActive ? "neon-glow-primary" : ""}`}
                        data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={handleNavClick}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>

              <Separator className="my-2" />

              {/* Settings */}
              <div className="px-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">{t("nav.settings")}</p>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  data-testid="button-mobile-theme-toggle"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-5 h-5" />
                      <span>{t("nav.lightMode")}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5" />
                      <span>{t("nav.darkMode")}</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-auto p-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    onLogout?.();
                    handleNavClick();
                  }}
                  data-testid="button-mobile-logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t("nav.logout")}</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="p-4 space-y-2">
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  data-testid="button-mobile-login"
                  onClick={handleNavClick}
                >
                  {t("nav.login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  variant="default" 
                  className="w-full neon-glow-primary" 
                  data-testid="button-mobile-register"
                  onClick={handleNavClick}
                >
                  {t("nav.signup")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
