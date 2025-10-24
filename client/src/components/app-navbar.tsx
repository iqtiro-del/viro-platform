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
  CheckCircle
} from "lucide-react";
import { useTheme } from "./theme-provider";
import { useLanguage } from "@/lib/language-context";
import { getUserAvatar } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppNavbarProps {
  user?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
    isVerified: boolean;
  } | null;
  onLogout?: () => void;
}

export function AppNavbar({ user, onLogout }: AppNavbarProps) {
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

  return (
    <nav className="hidden md:flex items-center justify-center gap-2 px-4">
      {/* Navigation Links */}
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`gap-2 ${isActive ? "neon-glow-primary" : ""}`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Right Side: Theme Toggle and User Menu */}
      {user && (
        <div className="flex items-center gap-2 ml-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 px-2"
                data-testid="button-user-menu"
              >
                <Avatar className="h-8 w-8 border-2 border-primary neon-glow-primary">
                  <AvatarImage src={getUserAvatar(user.id)} alt={user.fullName} />
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                    {user.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden xl:flex flex-col items-start">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{user.fullName}</span>
                    {user.isVerified && (
                      <CheckCircle className="w-3 h-3 text-green-500" data-testid="icon-verified" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">@{user.username}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-morphism-strong border-border/50">
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer" data-testid="link-profile">
                  <User className="w-4 h-4 mr-2" />
                  <span>{t("nav.profile")}</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={onLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>{t("nav.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Guest Actions */}
      {!user && (
        <div className="flex items-center gap-2 ml-4">
          <Link href="/login">
            <Button variant="ghost" data-testid="button-login">
              {t("nav.login")}
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="default" className="neon-glow-primary" data-testid="button-register">
              {t("nav.signup")}
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
