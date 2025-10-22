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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  user?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
    isVerified: boolean;
  } | null;
  onLogout?: () => void;
}

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const navItems = user ? [
    { icon: Home, label: t("nav.dashboard"), path: "/" },
    { icon: ShoppingBag, label: t("nav.services"), path: "/services" },
    { icon: Wallet, label: t("nav.wallet"), path: "/wallet" },
    { icon: Package, label: t("nav.myProducts"), path: "/my-products" },
    { icon: Megaphone, label: t("nav.promote"), path: "/promote" },
  ] : [];

  return (
    <Sidebar side="right" className="glass-morphism border-l border-border/50">
      <SidebarHeader className="p-4">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center justify-center hover-elevate rounded-lg p-3 transition-all cursor-pointer" data-testid="link-home">
            <h1 className="text-2xl font-accent font-bold neon-text-glow tracking-tight">
              تيرو
            </h1>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {user ? (
          <>
            {/* User Profile Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground">{t("nav.account")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <Link href="/profile">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover-elevate transition-all cursor-pointer" data-testid="link-profile">
                    <Avatar className="h-12 w-12 border-2 border-primary neon-glow-primary">
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
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
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="my-2" />

            {/* Navigation Menu */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground">{t("nav.navigation")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton 
                          asChild
                          isActive={isActive}
                          className={isActive ? "neon-glow-primary bg-primary text-primary-foreground" : ""}
                        >
                          <Link href={item.path}>
                            <div className="flex items-center gap-3 w-full" data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                              <Icon className="w-5 h-5" />
                              <span>{item.label}</span>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="my-2" />

            {/* Settings */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground">{t("nav.settings")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 px-2">
                  {/* Theme Toggle */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    data-testid="button-theme-toggle"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="w-5 h-5 mr-3" />
                        <span>{t("nav.lightMode")}</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-5 h-5 mr-3" />
                        <span>{t("nav.darkMode")}</span>
                      </>
                    )}
                  </Button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent className="px-4 space-y-2">
              <Link href="/login">
                <Button variant="ghost" className="w-full justify-start" data-testid="button-login">
                  {t("nav.login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" className="w-full neon-glow-primary" data-testid="button-register">
                  {t("nav.signup")}
                </Button>
              </Link>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {user && (
        <SidebarFooter className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>{t("nav.logout")}</span>
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
