import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { SellerProfilePage } from "./seller-profile";

export default function NotFound() {
  const { t } = useLanguage();
  const [location] = useLocation();
  
  // If the path starts with @, we might be here because of a routing race or refresh
  // although App.tsx should handle it, this is a safety net
  if (location.startsWith("/@")) {
    const username = location.substring(2);
    if (username) {
      return <SellerProfilePage params={{ username }} />;
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-accent font-bold neon-text-glow">404</h1>
          <p className="text-2xl font-semibold text-foreground mt-4">{t("notFound.title")}</p>
          <p className="text-muted-foreground mt-2">
            {t("notFound.message")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <a>
              <Button className="neon-glow-primary" data-testid="button-home">
                <Home className="w-4 h-4 mr-2" />
                {t("notFound.goHome")}
              </Button>
            </a>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="border-border/50"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("notFound.goBack")}
          </Button>
        </div>
      </div>
    </div>
  );
}
