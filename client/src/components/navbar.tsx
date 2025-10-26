import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShoppingBag, 
  Wallet, 
  Package, 
  Megaphone, 
  User,
  LogOut,
  Sun,
  Moon,
  Languages,
  MessageCircle
} from "lucide-react";
import { useTheme } from "./theme-provider";
import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  user?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
    isVerified: boolean;
  } | null;
  onLogout?: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const navItems = user ? [
    { icon: ShoppingBag, label: t("nav.services"), path: "/services" },
    { icon: Wallet, label: t("nav.wallet"), path: "/wallet" },
    { icon: Package, label: t("nav.myProducts"), path: "/my-products" },
    { icon: Megaphone, label: t("nav.promote"), path: "/promote" },
  ] : [];

  // Fetch active chats count
  const { data: activeChatsData } = useQuery<{ count: number }>({
    queryKey: [`/api/chats/active/count?userId=${user?.id}`],
    enabled: !!user?.id,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const activeChatsCount = activeChatsData?.count || 0;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 glass-morphism">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2 hover-elevate rounded-lg px-3 py-2 transition-all cursor-pointer" data-testid="link-home">
            <h1 className="text-2xl font-accent font-bold neon-text-glow tracking-tight">
              TIRO
            </h1>
          </div>
        </Link>

        {/* Navigation Links - Desktop */}
        {user && (
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={isActive ? "neon-glow-primary" : ""}
                    data-testid={`link-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Side - User Menu or Auth Buttons */}
        <div className="flex items-center gap-2">
          {/* Chat Icon - Only show if user has active chats */}
          {user && activeChatsCount > 0 && (
            <Link href="/chats">
              <Button
                variant="ghost"
                size="icon"
                data-testid="button-chats"
                className="relative"
              >
                <MessageCircle className="w-5 h-5" />
                <Badge 
                  className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-1 bg-primary text-primary-foreground neon-glow-primary text-xs"
                  data-testid="badge-chat-count"
                >
                  {activeChatsCount}
                </Badge>
              </Button>
            </Link>
          )}

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            data-testid="button-language-toggle"
            className="relative"
          >
            <Languages className="w-5 h-5" />
            <span className="absolute -bottom-0.5 text-[10px] font-bold text-primary">
              {language.toUpperCase()}
            </span>
          </Button>

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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-10 w-10 border-2 border-primary neon-glow-primary">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {user.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user.isVerified && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center neon-glow-success">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-morphism-strong border-border/50">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <Link href="/profile">
                  <DropdownMenuItem data-testid="link-profile">
                    <User className="w-4 h-4 mr-2" />
                    {t("nav.profile")}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem onClick={onLogout} data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 glass-morphism-strong">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div className="flex flex-col items-center justify-center flex-1 h-full hover-elevate transition-all cursor-pointer">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary neon-glow-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs mt-1 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
            {/* Chat icon - Only show if user has active chats */}
            {activeChatsCount > 0 && (
              <Link href="/chats">
                <div className="flex flex-col items-center justify-center flex-1 h-full hover-elevate transition-all cursor-pointer relative">
                  <MessageCircle className={`w-5 h-5 ${location === '/chats' ? 'text-primary neon-glow-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs mt-1 ${location === '/chats' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    محادثات
                  </span>
                  <Badge 
                    className="absolute top-1 right-2 h-4 min-w-4 flex items-center justify-center p-0.5 bg-primary text-primary-foreground text-[10px]"
                  >
                    {activeChatsCount}
                  </Badge>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
