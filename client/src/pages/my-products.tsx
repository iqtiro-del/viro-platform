import { useState } from "react";
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
import { 
  Plus, 
  Edit, 
  Trash2, 
  ShoppingBag,
  Eye,
  DollarSign,
  Package
} from "lucide-react";
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

export function MyProductsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

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

  // Category mappings - value is what's stored in DB, label is translation key
  const categories = [
    { value: "Design", label: t("services.categories.design") },
    { value: "Development", label: t("services.categories.development") },
    { value: "Marketing", label: t("services.categories.marketing") },
    { value: "Writing", label: t("services.categories.writing") },
    { value: "Video & Animation", label: t("services.categories.videoAnimation") },
    { value: "Music & Audio", label: t("services.categories.musicAudio") },
  ];

  const ProductForm = ({ product, onClose }: { product?: Product; onClose: () => void }) => {
    const form = useForm<InsertProduct>({
      resolver: zodResolver(insertProductSchema),
      defaultValues: product ? {
        sellerId: product.sellerId,
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
      } : {
        sellerId: user?.id || "",
        title: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
        isActive: true,
      },
    });

    const onSubmit = (data: InsertProduct) => {
      if (product) {
        updateMutation.mutate({ id: product.id, data });
      } else {
        createMutation.mutate(data);
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    className="glass-morphism border-border/50"
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
                    className="glass-morphism border-border/50 min-h-[100px]"
                    data-testid="input-product-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("myProducts.priceUSD")}</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="number" 
                      placeholder={t("myProducts.pricePlaceholder")}
                      className="glass-morphism border-border/50"
                      data-testid="input-product-price"
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
                const selectedCategory = categories.find(c => c.value === field.value);
                return (
                  <FormItem>
                    <FormLabel>{t("myProducts.category")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-morphism border-border/50" data-testid="select-product-category">
                          <SelectValue placeholder={t("myProducts.selectCategory")}>
                            {selectedCategory?.label || t("myProducts.selectCategory")}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-morphism-strong border-border/50">
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <Button 
            type="submit"
            className="w-full neon-glow-primary" 
            disabled={createMutation.isPending || updateMutation.isPending}
            data-testid={product ? "button-update-product" : "button-create-product"}
          >
            {(createMutation.isPending || updateMutation.isPending) ? t("myProducts.saving") : product ? t("myProducts.updateService") : t("myProducts.createServiceBtn")}
          </Button>
        </form>
      </Form>
    );
  };

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

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="neon-glow-primary" data-testid="button-add-product">
                <Plus className="w-4 h-4 mr-2" />
                {t("myProducts.addNewService")}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-morphism-strong border-border/50 max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("myProducts.addNewService")}</DialogTitle>
                <DialogDescription>
                  {t("myProducts.createService")}
                </DialogDescription>
              </DialogHeader>
              <ProductForm onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

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
        <div className="space-y-4">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="glass-morphism border-border/30 hover:border-primary/50 transition-all"
              data-testid={`card-product-${product.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-primary" />
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
                      <DialogContent className="glass-morphism-strong border-border/50 max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{t("myProducts.editService")}</DialogTitle>
                          <DialogDescription>
                            {t("myProducts.updateDetails")}
                          </DialogDescription>
                        </DialogHeader>
                        <ProductForm product={product} onClose={() => setEditingProduct(null)} />
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
