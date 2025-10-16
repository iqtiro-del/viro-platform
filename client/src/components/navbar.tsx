import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShoppingBag, 
  Wallet, 
  Package, 
  Megaphone, 
  User,
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "./theme-provider";
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
    avatarUrl: string;
    isVerified: boolean;
  } | null;
  onLogout?: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const navItems = user ? [
    { icon: ShoppingBag, label: "Services", path: "/services" },
    { icon: Wallet, label: "Wallet", path: "/wallet" },
    { icon: Package, label: "My Products", path: "/my-products" },
    { icon: Megaphone, label: "Promote", path: "/promote" },
  ] : [];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 glass-morphism">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center space-x-2 hover-elevate rounded-lg px-3 py-2 transition-all" data-testid="link-home">
            <h1 className="text-2xl font-accent font-bold neon-text-glow tracking-tight">
              TIRO
            </h1>
          </a>
        </Link>

        {/* Navigation Links - Desktop */}
        {user && (
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <a>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={isActive ? "neon-glow-primary" : ""}
                      data-testid={`link-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </a>
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Side - User Menu or Auth Buttons */}
        <div className="flex items-center space-x-3">
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
                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
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
                    Profile
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem onClick={onLogout} data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <a>
                  <Button variant="ghost" data-testid="button-login">
                    Login
                  </Button>
                </a>
              </Link>
              <Link href="/register">
                <a>
                  <Button variant="default" className="neon-glow-primary" data-testid="button-register">
                    Sign Up
                  </Button>
                </a>
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
                  <a className="flex flex-col items-center justify-center flex-1 h-full hover-elevate transition-all">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary neon-glow-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs mt-1 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
