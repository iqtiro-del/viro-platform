import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Users, ShoppingBag, Star, ArrowRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import heroImage from "@assets/generated_images/Digital_marketplace_neon_hero_background_e0f69832.png";

export function Dashboard() {
  // Mock data - will be replaced with real data in integration phase
  const stats = [
    { label: "Active Services", value: "1,234", icon: ShoppingBag, trend: "+12%" },
    { label: "Verified Sellers", value: "567", icon: Users, trend: "+8%" },
    { label: "Total Sales", value: "$45.2K", icon: TrendingUp, trend: "+23%" },
  ];

  const featuredServices = [
    {
      id: "1",
      title: "Professional Logo Design",
      price: "$50",
      seller: "Ahmad Hassan",
      sellerAvatar: "",
      rating: 4.9,
      reviews: 124,
      isVerified: true,
      category: "Design"
    },
    {
      id: "2",
      title: "SEO Optimization Package",
      price: "$120",
      seller: "Sara Mohamed",
      sellerAvatar: "",
      rating: 5.0,
      reviews: 89,
      isVerified: true,
      category: "Marketing"
    },
    {
      id: "3",
      title: "React Web Development",
      price: "$200",
      seller: "Omar Ali",
      sellerAvatar: "",
      rating: 4.8,
      reviews: 156,
      isVerified: true,
      category: "Development"
    },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        {/* Hero Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Digital marketplace" 
            className="w-full h-full object-cover"
          />
          {/* Neon gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-secondary/40" />
          <div className="absolute inset-0 bg-background/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-accent font-bold mb-6 neon-text-glow tracking-tight">
            TIRO
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 mb-8 max-w-3xl mx-auto">
            Iraq's Premier Digital Services Marketplace
          </p>
          <p className="text-base md:text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Connect with verified sellers, discover quality services, and grow your digital business
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative glass-morphism-strong border border-primary/30 rounded-lg overflow-hidden neon-glow-primary">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search for services..." 
                className="pl-12 pr-4 h-14 bg-transparent border-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                data-testid="input-search"
              />
              <Button 
                className="absolute right-2 top-1/2 -translate-y-1/2 neon-glow-secondary"
                data-testid="button-search"
              >
                <Zap className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index}
                  className="glass-morphism p-4 rounded-lg border border-border/30 hover-elevate transition-all"
                >
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <Badge variant="secondary" className="mt-2 text-xs bg-green-500/10 text-green-500 border-green-500/20">
                    {stat.trend}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Featured Services</h2>
            <p className="text-muted-foreground">Top-rated services from verified sellers</p>
          </div>
          <Button variant="outline" className="border-primary/30 hover:border-primary neon-glow-primary" data-testid="button-view-all">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service) => (
            <Card 
              key={service.id} 
              className="glass-morphism border-border/30 hover:border-primary/50 transition-all hover-elevate group overflow-hidden"
              data-testid={`card-service-${service.id}`}
            >
              {/* Service Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-primary/40" />
                </div>
                <Badge className="absolute top-3 right-3 bg-primary/90 border-primary neon-glow-primary">
                  {service.category}
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                <CardDescription className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6 border border-primary/30">
                      <AvatarImage src={service.sellerAvatar} />
                      <AvatarFallback className="text-xs bg-primary/20">
                        {service.seller.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{service.seller}</span>
                    {service.isVerified && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center neon-glow-success">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{service.rating}</span>
                    <span className="text-muted-foreground text-sm">({service.reviews})</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Starting at</p>
                    <p className="text-xl font-bold text-primary neon-text-glow">{service.price}</p>
                  </div>
                </div>

                <Button className="w-full mt-4 neon-glow-secondary" data-testid={`button-view-service-${service.id}`}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="glass-morphism-strong border-primary/30 neon-glow-primary overflow-hidden">
          <div className="relative p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Start Selling Your Services Today
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of sellers on Tiro and reach customers across Iraq
              </p>
              <Button size="lg" className="neon-glow-primary" data-testid="button-start-selling">
                <Zap className="w-5 h-5 mr-2" />
                Start Selling Now
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
