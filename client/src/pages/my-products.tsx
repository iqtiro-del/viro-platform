import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ShoppingBag,
  Eye,
  DollarSign,
  Package,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

import { getProductImage } from "@/lib/category-images";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Product, type InsertProduct, insertProductSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Precompute resolver once at module level for better performance
const productFormResolver = zodResolver(insertProductSchema);

// Category values (static, used for form)
const CATEGORY_VALUES = [
  "Design",
  "Development", 
  "Marketing",
  "Writing",
  "Video & Animation",
  "Music & Audio",
  "Instagram",
  "TikTok",
  "Netflix",
] as const;

// Memoized ProductForm component - extracted outside to prevent re-creation on parent re-renders
interface ProductFormProps {
  product?: Product;
  userId: string;
  onSubmit: (data: InsertProduct) => void;
  isPending: boolean;
  t: (key: string) => string;
}

const ProductForm = memo(function ProductForm({ 
  product, 
  userId, 
  onSubmit, 
  isPending,
  t 
}: ProductFormProps) {
  const form = useForm<InsertProduct>({
    resolver: productFormResolver,
    defaultValues: product ? {
      sellerId: product.sellerId,
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      oldPrice: product.oldPrice ? product.oldPrice.toString() : "",
      category: product.category,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      accountUsername: product.accountUsername || "",
      accountPassword: product.accountPassword || "",
      accountEmail: product.accountEmail || "",
      accountEmailPassword: product.accountEmailPassword || "",
      subscriptionDuration: product.subscriptionDuration || "",
    } : {
      sellerId: userId,
      title: "",
      description: "",
      price: "",
      oldPrice: "",
      category: "",
      imageUrl: "",
      isActive: true,
      accountUsername: "",
      accountPassword: "",
      accountEmail: "",
      accountEmailPassword: "",
      subscriptionDuration: "",
    },
  });

  const selectedCategory = form.watch("category");
  const showAccountFields = selectedCategory === "Instagram" || selectedCategory === "TikTok";
  const showNetflixFields = selectedCategory === "Netflix";

  // Get translated category labels
  const categories = useMemo(() => [
    { value: "Design", label: t("services.categories.design") },
    { value: "Development", label: t("services.categories.development") },
    { value: "Marketing", label: t("services.categories.marketing") },
    { value: "Writing", label: t("services.categories.writing") },
    { value: "Video & Animation", label: t("services.categories.videoAnimation") },
    { value: "Music & Audio", label: t("services.categories.musicAudio") },
    { value: "Instagram", label: t("services.categories.instagram") },
    { value: "TikTok", label: t("services.categories.tiktok") },
    { value: "Netflix", label: t("services.categories.netflix") },
  ], [t]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("myProducts.serviceTitle")}</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  placeholder={t("myProducts.titlePlaceholder")}
                  className="glass-morphism border-border/50 h-12 text-base touch-manipulation"
                  data-testid="input-product-title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("myProducts.description")}</FormLabel>
              <FormControl>
                <Textarea 
                  {...field}
                  placeholder={t("myProducts.descriptionPlaceholder")}
                  className="glass-morphism border-border/50 min-h-[100px] text-base touch-manipulation"
                  data-testid="input-product-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => {
            const selectedCat = categories.find(c => c.value === field.value);
            return (
              <FormItem>
                <FormLabel>{t("myProducts.category")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="glass-morphism border-border/50 h-12 text-base touch-manipulation" data-testid="select-product-category">
                      <SelectValue placeholder={t("myProducts.selectCategory")}>
                        {selectedCat?.label || t("myProducts.selectCategory")}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="glass-morphism-strong border-border/50">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="h-11 touch-manipulation">{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="oldPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>السعر القديم (قبل التخفيض)</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    type="number" 
                    inputMode="decimal"
                    placeholder="مثال: 150"
                    className="glass-morphism border-border/50 h-12 text-base touch-manipulation"
                    data-testid="input-product-old-price"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>السعر الجديد (بعد التخفيض)</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    type="number" 
                    inputMode="decimal"
                    placeholder={t("myProducts.pricePlaceholder")}
                    className="glass-morphism border-border/50 h-12 text-base touch-manipulation"
                    data-testid="input-product-price"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showAccountFields && (
          <div className="space-y-5 pt-4 border-t border-border/50">
            <h3 className="text-sm font-medium text-foreground">{t("myProducts.accountDetails")}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("myProducts.accountUsername")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder={t("myProducts.usernamePlaceholder")}
                        className="glass-morphism border-border/50 h-12 text-base touch-manipulation"
                        data-testid="input-account-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("myProducts.accountPassword")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="password"
                        placeholder={t("myProducts.passwordPlaceholder")}
                        className="glass-morphism border-border/50 h-12 text-base touch-manipulation"
                        data-testid="input-account-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("myProducts.accountEmail")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="email"
                        inputMode="email"
                        placeholder={t("myProducts.emailPlaceholder")}
                        className="glass-morphism border-border/50 h-12 text-base touch-manipulation"
                        data-testid="input-account-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountEmailPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("myProducts.accountEmailPassword")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="password"
                        placeholder={t("myProducts.emailPasswordPlaceholder")}
                        className="glass-morphism border-border/50 h-12 text-base touch-manipulation"
                        data-testid="input-account-email-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {showNetflixFields && (
          <div className="space-y-5 pt-4 border-t border-border/50">
            <h3 className="text-sm font-medium text-foreground">{t("myProducts.netflixDetails")}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("myProducts.accountEmail")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="email"
                        inputMode="email"
                        placeholder={t("myProducts.emailPlaceholder")}
                        className="glass-morphism border-border/50 h-12 text-base touch-manipulation"
                        data-testid="input-netflix-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("myProducts.accountPassword")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="password"
                        placeholder={t("myProducts.passwordPlaceholder")}
                        className="glass-morphism border-border/50 h-12 text-base touch-manipulation"
                        data-testid="input-netflix-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subscriptionDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("myProducts.subscriptionDuration")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="glass-morphism border-border/50 h-12 text-base touch-manipulation" data-testid="select-subscription-duration">
                        <SelectValue placeholder={t("myProducts.selectDuration")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass-morphism-strong border-border/50">
                      <SelectItem value="1_month" className="h-11 touch-manipulation">{t("myProducts.1month")}</SelectItem>
                      <SelectItem value="3_months" className="h-11 touch-manipulation">{t("myProducts.3months")}</SelectItem>
                      <SelectItem value="6_months" className="h-11 touch-manipulation">{t("myProducts.6months")}</SelectItem>
                      <SelectItem value="12_months" className="h-11 touch-manipulation">{t("myProducts.12months")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Button 
          type="submit"
          className="w-full neon-glow-primary h-12 text-base touch-manipulation" 
          disabled={isPending}
          data-testid={product ? "button-update-product" : "button-create-product"}
        >
          {isPending ? t("myProducts.saving") : product ? t("myProducts.updateService") : t("myProducts.createServiceBtn")}
        </Button>
      </form>
    </Form>
  );
});

export function MyProductsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Category mappings for display - memoized for performance
  const categories = useMemo(() => [
    { value: "Design", label: t("services.categories.design") },
    { value: "Development", label: t("services.categories.development") },
    { value: "Marketing", label: t("services.categories.marketing") },
    { value: "Writing", label: t("services.categories.writing") },
    { value: "Video & Animation", label: t("services.categories.videoAnimation") },
    { value: "Music & Audio", label: t("services.categories.musicAudio") },
    { value: "Instagram", label: t("services.categories.instagram") },
    { value: "TikTok", label: t("services.categories.tiktok") },
    { value: "Netflix", label: t("services.categories.netflix") },
  ], [t]);

  // Fetch user's products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/users', user?.id, 'products'],
    enabled: !!user,
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await apiRequest('POST', '/api/products', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] }); // Refresh stats after product creation
      toast({
        title: t("common.success"),
        description: t("myProducts.createSuccess"),
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProduct> }) => {
      const res = await apiRequest('PATCH', `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] }); // Refresh stats after product update
      toast({
        title: t("common.success"),
        description: t("myProducts.updateSuccess"),
      });
      setEditingProduct(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/products/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] }); // Refresh stats after product deletion
      toast({
        title: t("common.success"),
        description: t("myProducts.deleteSuccess"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Memoized handlers for the ProductForm
  const handleCreateProduct = useCallback((data: InsertProduct) => {
    createMutation.mutate(data);
  }, [createMutation]);

  const handleUpdateProduct = useCallback((data: InsertProduct) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    }
  }, [editingProduct, updateMutation]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-morphism border-border/30">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-morphism border-border/30">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{t("myProducts.title")}</h1>
            <p className="text-muted-foreground">{t("myProducts.subtitle")}</p>
          </div>

          {user?.isVerified ? (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow-primary" data-testid="button-add-product">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("myProducts.addNewService")}
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-morphism-strong border-border/50 max-w-lg max-h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-2">
                  <DialogTitle>{t("myProducts.addNewService")}</DialogTitle>
                  <DialogDescription>
                    {t("myProducts.createService")}
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-6 pb-6 overscroll-contain touch-pan-y">
                  <ProductForm 
                    userId={user?.id || ""} 
                    onSubmit={handleCreateProduct}
                    isPending={createMutation.isPending}
                    t={t}
                  />
                </div>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>

        {/* Verification Required Alert */}
        {!user?.isVerified && (
          <Alert className="glass-morphism border-primary/30 mb-8" data-testid="alert-verification-required">
            <AlertCircle className="h-5 w-5 text-primary" />
            <AlertTitle className="text-xl mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              {t("myProducts.verificationRequired")}
            </AlertTitle>
            <AlertDescription className="space-y-4">
              <p className="text-muted-foreground">
                {t("myProducts.verificationMessage")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/profile">
                  <Button className="neon-glow-primary w-full sm:w-auto" data-testid="button-start-verification">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {t("myProducts.applyForVerification")}
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-morphism border-border/30">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                {t("myProducts.totalServices")}
              </CardDescription>
              <CardTitle className="text-3xl" data-testid="text-total-services">{products.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="glass-morphism border-border/30">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {t("myProducts.totalViews")}
              </CardDescription>
              <CardTitle className="text-3xl" data-testid="text-total-views">
                {products.reduce((sum, p) => sum + p.views, 0)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="glass-morphism border-border/30">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                {t("myProducts.totalSales")}
              </CardDescription>
              <CardTitle className="text-3xl" data-testid="text-total-sales">
                {products.reduce((sum, p) => sum + p.sales, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Products List */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="glass-morphism border-border/30 hover:border-primary/50 transition-all"
              data-testid={`card-product-${product.id}`}
            >
              <CardContent className="p-3 md:p-6">
                {/* Mobile Layout (2 columns) */}
                <div className="md:hidden flex flex-col gap-2">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={getProductImage(product.category, product.imageUrl)} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1" data-testid={`text-product-title-mobile-${product.id}`}>
                        {product.title}
                      </h3>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                        {categories.find(c => c.value === product.category)?.label || product.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary" data-testid={`text-product-price-mobile-${product.id}`}>
                      ${product.price}
                    </span>
                    <Badge className={product.isActive ? "bg-green-500/20 text-green-500 border-green-500/30 text-[10px] px-1.5 py-0 h-5" : "bg-gray-500/20 text-gray-500 border-gray-500/30 text-[10px] px-1.5 py-0 h-5"}>
                      {product.isActive ? t("myProducts.active") : t("myProducts.inactive")}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span data-testid={`text-product-views-mobile-${product.id}`}>{product.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      <span data-testid={`text-product-sales-mobile-${product.id}`}>{product.sales}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-border/30">
                    <Dialog open={editingProduct?.id === product.id} onOpenChange={(open) => !open && setEditingProduct(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-border/50 text-xs"
                          onClick={() => setEditingProduct(product)}
                          data-testid={`button-edit-mobile-${product.id}`}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          {t("common.edit")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-morphism-strong border-border/50 max-w-lg max-h-[90vh] p-0 overflow-hidden">
                        <DialogHeader className="px-6 pt-6 pb-2">
                          <DialogTitle>{t("myProducts.editService")}</DialogTitle>
                          <DialogDescription>
                            {t("myProducts.updateDetails")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-6 pb-6 overscroll-contain touch-pan-y">
                          <ProductForm 
                            product={product}
                            userId={user?.id || ""} 
                            onSubmit={handleUpdateProduct}
                            isPending={updateMutation.isPending}
                            t={t}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                          data-testid={`button-delete-mobile-${product.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-morphism-strong border-border/50">
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("myProducts.deleteService")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("myProducts.deleteConfirm")} "{product.title}"? {t("myProducts.deleteWarning")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="glass-morphism border-border/50">{t("common.cancel")}</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600" 
                            onClick={() => deleteMutation.mutate(product.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-confirm-delete-${product.id}`}
                          >
                            {deleteMutation.isPending ? t("myProducts.deleting") : t("common.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Desktop Layout (full width) */}
                <div className="hidden md:flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                        <img 
                          src={getProductImage(product.category, product.imageUrl)} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground" data-testid={`text-product-title-${product.id}`}>{product.title}</h3>
                          <Badge className={product.isActive ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-gray-500/20 text-gray-500 border-gray-500/30"}>
                            {product.isActive ? t("myProducts.active") : t("myProducts.inactive")}
                          </Badge>
                          <Badge variant="secondary">{categories.find(c => c.value === product.category)?.label || product.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          <span className="font-semibold text-primary" data-testid={`text-product-price-${product.id}`}>${product.price}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground" data-testid={`text-product-views-${product.id}`}>{product.views} {t("myProducts.views")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground" data-testid={`text-product-sales-${product.id}`}>{product.sales} {t("myProducts.sales")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog open={editingProduct?.id === product.id} onOpenChange={(open) => !open && setEditingProduct(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="border-border/50"
                          onClick={() => setEditingProduct(product)}
                          data-testid={`button-edit-${product.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-morphism-strong border-border/50 max-w-lg max-h-[90vh] p-0 overflow-hidden">
                        <DialogHeader className="px-6 pt-6 pb-2">
                          <DialogTitle>{t("myProducts.editService")}</DialogTitle>
                          <DialogDescription>
                            {t("myProducts.updateDetails")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-6 pb-6 overscroll-contain touch-pan-y">
                          <ProductForm 
                            product={product}
                            userId={user?.id || ""} 
                            onSubmit={handleUpdateProduct}
                            isPending={updateMutation.isPending}
                            t={t}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                          data-testid={`button-delete-${product.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-morphism-strong border-border/50">
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("myProducts.deleteService")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("myProducts.deleteConfirm")} "{product.title}"? {t("myProducts.deleteWarning")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="glass-morphism border-border/50">{t("common.cancel")}</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600" 
                            onClick={() => deleteMutation.mutate(product.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-confirm-delete-${product.id}`}
                          >
                            {deleteMutation.isPending ? t("myProducts.deleting") : t("common.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card className="glass-morphism border-border/30">
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">{t("myProducts.noProducts")}</h3>
              <p className="text-muted-foreground mb-6">{t("myProducts.noProductsDescription")}</p>
              <Button className="neon-glow-primary" onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-product">
                <Plus className="w-4 h-4 mr-2" />
                {t("myProducts.addFirstService")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
