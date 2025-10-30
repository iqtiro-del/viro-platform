import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Users, Package, DollarSign, ShoppingCart, BadgeCheck, XCircle, CheckCircle, Trash2, Edit, Shield } from "lucide-react";
import type { User, ProductWithSeller, Transaction, VerificationRequestWithUser } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("tiro-admin");
    return saved ? JSON.parse(saved) : null;
  });
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Login failed");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      setAdminUser(data);
      localStorage.setItem("tiro-admin", JSON.stringify(data));
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "Welcome to admin dashboard",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem("tiro-admin");
    toast({
      title: "تم تسجيل الخروج",
      description: "Logged out successfully",
    });
  };

  // If not logged in, show login form
  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-morphism border-2 border-primary/30 neon-glow-primary">
          <CardHeader>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <CardTitle className="text-3xl font-accent neon-text-glow">Admin Login</CardTitle>
            </div>
            <CardDescription>Enter your admin credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                  data-testid="input-admin-username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  data-testid="input-admin-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full neon-glow-primary" 
                disabled={loginMutation.isPending}
                data-testid="button-admin-login"
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-accent font-bold neon-text-glow mb-2" data-testid="text-admin-title">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Welcome, {adminUser.username}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-admin-logout">
            Logout
          </Button>
        </div>

        {/* Stats Overview */}
        <StatsOverview adminId={adminUser.id} />

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">Services</TabsTrigger>
            <TabsTrigger value="verifications" data-testid="tab-verifications">Verifications</TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UsersManagement adminId={adminUser.id} />
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <ServicesManagement adminId={adminUser.id} />
          </TabsContent>

          <TabsContent value="verifications" className="mt-6">
            <VerificationsManagement adminId={adminUser.id} />
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <TransactionsManagement adminId={adminUser.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Stats Overview Component
function StatsOverview({ adminId }: { adminId: string }) {
  const { data: stats } = useQuery<{
    activeServices: number;
    inactiveServices: number;
    totalServices: number;
    verifiedSellers: number;
    activeUsers: number;
    totalUsers: number;
    totalSales: string;
    pendingOrders: number;
    completedOrders: number;
    totalOrders: number;
    pendingVerifications: number;
  }>({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-user-id': adminId },
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    refetchInterval: 30000,
    staleTime: 0,
  });

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      subtitle: `${stats?.activeUsers || 0} active`,
      icon: Users,
      color: "text-primary",
      glow: "neon-glow-primary",
    },
    {
      title: "Services",
      value: stats?.totalServices || 0,
      subtitle: `${stats?.activeServices || 0} active`,
      icon: Package,
      color: "text-cyan-400",
      glow: "neon-glow-secondary",
    },
    {
      title: "Total Sales",
      value: `$${stats?.totalSales || "0.00"}`,
      subtitle: `${stats?.completedOrders || 0} orders`,
      icon: DollarSign,
      color: "text-green-400",
      glow: "neon-glow-success",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      subtitle: `${stats?.totalOrders || 0} total`,
      icon: ShoppingCart,
      color: "text-yellow-400",
      glow: "neon-glow-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={`glass-morphism border-2 hover-elevate ${stat.glow}`} data-testid={`card-stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`} data-testid={`text-stat-value-${stat.title.toLowerCase().replace(' ', '-')}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Users Management Component
function UsersManagement({ adminId }: { adminId: string }) {
  const { toast } = useToast();
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-user-id': adminId },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': adminId 
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "تم التحديث",
        description: "User updated successfully",
      });
    },
  });

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle>Users Management</CardTitle>
        <CardDescription>Manage all platform users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell className="font-medium">
                    {user.username}
                    {user.isVerified && <BadgeCheck className="w-4 h-4 inline ml-2 text-green-500" />}
                  </TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>${user.balance}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    {user.isActive ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateUserMutation.mutate({ id: user.id, data: { isActive: false } })}
                        data-testid={`button-deactivate-${user.id}`}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateUserMutation.mutate({ id: user.id, data: { isActive: true } })}
                        data-testid={`button-activate-${user.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Activate
                      </Button>
                    )}
                    {!user.isVerified && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateUserMutation.mutate({ id: user.id, data: { isVerified: true } })}
                        data-testid={`button-verify-${user.id}`}
                      >
                        <BadgeCheck className="w-4 h-4 mr-1" />
                        Verify
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Services Management Component
function ServicesManagement({ adminId }: { adminId: string }) {
  const { toast } = useToast();
  const { data: products = [] } = useQuery<ProductWithSeller[]>({
    queryKey: ['/api/admin/products'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products', {
        headers: { 'x-user-id': adminId },
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': adminId },
      });
      if (!res.ok) throw new Error('Failed to delete product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "تم الحذف",
        description: "Service deleted successfully",
      });
    },
  });

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle>Services Management</CardTitle>
        <CardDescription>Manage all platform services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                  <TableCell className="font-medium max-w-xs truncate">{product.title}</TableCell>
                  <TableCell>{product.seller.username}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.sales || 0}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteProductMutation.mutate(product.id)}
                      data-testid={`button-delete-product-${product.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Verifications Management Component
function VerificationsManagement({ adminId }: { adminId: string }) {
  const { toast } = useToast();
  const { data: requests = [] } = useQuery<VerificationRequestWithUser[]>({
    queryKey: ['/api/admin/verification-requests'],
    queryFn: async () => {
      const res = await fetch('/api/admin/verification-requests?status=pending', {
        headers: { 'x-user-id': adminId },
      });
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, userId }: { id: string; status: string; userId: string }) => {
      const res = await fetch(`/api/admin/verification-requests/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': adminId 
        },
        body: JSON.stringify({ status, userId }),
      });
      if (!res.ok) throw new Error('Failed to update request');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verification-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "تم التحديث",
        description: "Verification request updated",
      });
    },
  });

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle>Verification Requests</CardTitle>
        <CardDescription>Approve or reject seller verification requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id} data-testid={`row-verification-${request.id}`}>
                  <TableCell className="font-medium">{request.user.username}</TableCell>
                  <TableCell>{request.fullName}</TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{request.status}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => updateRequestMutation.mutate({ 
                        id: request.id, 
                        status: 'approved',
                        userId: request.userId 
                      })}
                      data-testid={`button-approve-${request.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateRequestMutation.mutate({ 
                        id: request.id, 
                        status: 'rejected',
                        userId: request.userId 
                      })}
                      data-testid={`button-reject-${request.id}`}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No pending verification requests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Transactions Management Component
function TransactionsManagement({ adminId }: { adminId: string }) {
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    queryFn: async () => {
      const res = await fetch('/api/admin/transactions', {
        headers: { 'x-user-id': adminId },
      });
      if (!res.ok) throw new Error('Failed to fetch transactions');
      return res.json();
    },
  });

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>View all platform transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 50).map((transaction) => (
                <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                  <TableCell className="font-mono text-xs">{transaction.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.type}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">${transaction.amount}</TableCell>
                  <TableCell>
                    <Badge variant={
                      transaction.status === 'completed' ? 'default' : 
                      transaction.status === 'pending' ? 'secondary' : 
                      'destructive'
                    }>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{transaction.description || '-'}</TableCell>
                  <TableCell className="text-xs">{new Date(transaction.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
