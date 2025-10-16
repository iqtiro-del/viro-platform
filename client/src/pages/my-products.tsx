import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
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

export function MyProductsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Mock products data
  const products = [
    {
      id: "1",
      title: "Professional Logo Design",
      description: "Custom logo design with 3 revisions",
      price: 50,
      category: "Design",
      isActive: true,
      views: 234,
      sales: 12,
    },
    {
      id: "2",
      title: "SEO Optimization Package",
      description: "Complete SEO optimization for your website",
      price: 120,
      category: "Marketing",
      isActive: true,
      views: 567,
      sales: 8,
    },
    {
      id: "3",
      title: "React Web Development",
      description: "Modern web application development",
      price: 200,
      category: "Development",
      isActive: false,
      views: 123,
      sales: 5,
    },
  ];

  const categories = ["Design", "Development", "Marketing", "Writing", "Video & Animation", "Music & Audio"];

  const ProductForm = ({ product, onClose }: { product?: any; onClose: () => void }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Service Title</Label>
        <Input 
          id="title" 
          placeholder="Professional Logo Design" 
          defaultValue={product?.title}
          className="glass-morphism border-border/50 mt-2"
          data-testid="input-product-title"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Describe your service in detail..." 
          defaultValue={product?.description}
          className="glass-morphism border-border/50 mt-2 min-h-[100px]"
          data-testid="input-product-description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (USD)</Label>
          <Input 
            id="price" 
            type="number" 
            placeholder="50.00" 
            defaultValue={product?.price}
            className="glass-morphism border-border/50 mt-2"
            data-testid="input-product-price"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select defaultValue={product?.category}>
            <SelectTrigger className="glass-morphism border-border/50 mt-2" data-testid="select-product-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="glass-morphism-strong border-border/50">
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        className="w-full neon-glow-primary" 
        onClick={onClose}
        data-testid={product ? "button-update-product" : "button-create-product"}
      >
        {product ? "Update Service" : "Create Service"}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Products</h1>
            <p className="text-muted-foreground">Manage your services and offerings</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="neon-glow-primary" data-testid="button-add-product">
                <Plus className="w-4 h-4 mr-2" />
                Add New Service
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-morphism-strong border-border/50 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>
                  Create a new service to offer on Tiro marketplace
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
                Total Services
              </CardDescription>
              <CardTitle className="text-3xl">{products.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="glass-morphism border-border/30">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Total Views
              </CardDescription>
              <CardTitle className="text-3xl">
                {products.reduce((sum, p) => sum + p.views, 0)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="glass-morphism border-border/30">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Sales
              </CardDescription>
              <CardTitle className="text-3xl">
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
                          <h3 className="text-lg font-semibold text-foreground">{product.title}</h3>
                          <Badge className={product.isActive ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-gray-500/20 text-gray-500 border-gray-500/30"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="secondary">{product.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          <span className="font-semibold text-primary">${product.price}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{product.views} views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{product.sales} sales</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
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
                          <DialogTitle>Edit Service</DialogTitle>
                          <DialogDescription>
                            Update your service details
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
                          <AlertDialogTitle>Delete Service</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="glass-morphism border-border/50">Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-500 hover:bg-red-600" data-testid={`button-confirm-delete-${product.id}`}>
                            Delete
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
              <h3 className="text-xl font-semibold mb-2">No services yet</h3>
              <p className="text-muted-foreground mb-6">Create your first service to start selling on Tiro</p>
              <Button className="neon-glow-primary" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
