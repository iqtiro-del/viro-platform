import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-accent font-bold neon-text-glow">404</h1>
          <p className="text-2xl font-semibold text-foreground mt-4">Page Not Found</p>
          <p className="text-muted-foreground mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <a>
              <Button className="neon-glow-primary" data-testid="button-home">
                <Home className="w-4 h-4 mr-2" />
                Go Home
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
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
