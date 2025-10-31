import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Users, Package, DollarSign, ShoppingCart, BadgeCheck, XCircle, CheckCircle, Trash2, Edit, Shield, MoreVertical, ArrowDownToLine, ArrowUpFromLine, Receipt, UserX } from "lucide-react";
import type { User, ProductWithSeller, Transaction, VerificationRequestWithUser } from "@shared/schema";

type AdminSection = 'users' | 'services' | 'verifications' | 'transactions' | 'deposits' | 'withdrawals' | 'banned';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("tiro-admin");
    return saved ? JSON.parse(saved) : null;
  });
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [currentSection, setCurrentSection] = useState<AdminSection>('users');

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

  const sections = [
    { id: 'users' as AdminSection, label: 'Users', icon: Users },
    { id: 'services' as AdminSection, label: 'Services', icon: Package },
    { id: 'verifications' as AdminSection, label: 'Verifications', icon: BadgeCheck },
    { id: 'transactions' as AdminSection, label: 'Transactions', icon: Receipt },
    { id: 'deposits' as AdminSection, label: 'Deposits', icon: ArrowDownToLine },
    { id: 'withdrawals' as AdminSection, label: 'Withdrawals', icon: ArrowUpFromLine },
    { id: 'banned' as AdminSection, label: 'Banned Users', icon: UserX },
  ];

  const currentSectionData = sections.find(s => s.id === currentSection);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-accent font-bold neon-text-glow mb-2" data-testid="text-admin-title">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Welcome, {adminUser.username}</p>
            </div>
            {/* Navigation Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="neon-glow-primary"
                  data-testid="button-admin-menu"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 glass-morphism">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <DropdownMenuItem
                      key={section.id}
                      onClick={() => setCurrentSection(section.id)}
                      className={currentSection === section.id ? 'bg-primary/20' : ''}
                      data-testid={`menu-item-${section.id}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {section.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-admin-logout">
            Logout
          </Button>
        </div>

        {/* Stats Overview */}
        <StatsOverview adminId={adminUser.id} />

        {/* Current Section Header */}
        {currentSectionData && (
          <div className="flex items-center gap-2">
            {(() => {
              const Icon = currentSectionData.icon;
              return <Icon className="w-6 h-6 text-primary" />;
            })()}
            <h2 className="text-2xl font-bold neon-text-glow" data-testid={`text-section-${currentSection}`}>
              {currentSectionData.label}
            </h2>
          </div>
        )}

        {/* Management Sections */}
        <div className="mt-6">
          {currentSection === 'users' && <UsersManagement adminId={adminUser.id} />}
          {currentSection === 'services' && <ServicesManagement adminId={adminUser.id} />}
          {currentSection === 'verifications' && <VerificationsManagement adminId={adminUser.id} />}
          {currentSection === 'transactions' && <TransactionsManagement adminId={adminUser.id} />}
          {currentSection === 'deposits' && <DepositsManagement adminId={adminUser.id} />}
          {currentSection === 'withdrawals' && <WithdrawalsManagement adminId={adminUser.id} />}
          {currentSection === 'banned' && <BannedUsersManagement adminId={adminUser.id} />}
        </div>
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
  const [banUserId, setBanUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');
  const [userSearch, setUserSearch] = useState('');
  
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
      queryClient.refetchQueries({ queryKey: ['/api/admin/users'] });
      queryClient.refetchQueries({ queryKey: ['/api/admin/banned-users'] });
      queryClient.refetchQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "تم التحديث",
        description: "User updated successfully",
      });
    },
  });

  const createVerificationRequestMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch('/api/admin/verification-requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': adminId 
        },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create verification request');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verification-requests'] });
      toast({
        title: "تم إنشاء طلب التحقق",
        description: "Verification request created. Go to Verifications panel to approve.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle>Users Management</CardTitle>
        <CardDescription>Manage all platform users</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Box */}
        <div className="mb-4">
          <Input
            placeholder="Search by username..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="glass-morphism border-border/50 max-w-sm"
            data-testid="input-user-search"
          />
        </div>

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
              {filteredUsers.map((user) => (
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
                        onClick={() => createVerificationRequestMutation.mutate(user.id)}
                        disabled={createVerificationRequestMutation.isPending}
                        data-testid={`button-verify-${user.id}`}
                      >
                        <BadgeCheck className="w-4 h-4 mr-1" />
                        Verify
                      </Button>
                    )}
                    {!user.isBanned && !user.isAdmin && (
                      <Dialog open={banUserId === user.id} onOpenChange={(open) => {
                        if (!open) {
                          setBanUserId(null);
                          setBanReason('');
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setBanUserId(user.id);
                              setBanReason('');
                            }}
                            data-testid={`button-ban-${user.id}`}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Ban
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-morphism">
                          <DialogHeader>
                            <DialogTitle>Ban User</DialogTitle>
                            <DialogDescription>
                              Ban user "{user.username}" from the platform. Please provide a reason.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <Label htmlFor="ban-reason">Ban Reason</Label>
                              <Input
                                id="ban-reason"
                                placeholder="Enter reason for banning this user"
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                data-testid="input-ban-reason"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setBanUserId(null);
                                  setBanReason('');
                                }}
                                data-testid="button-cancel-ban"
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  updateUserMutation.mutate({ 
                                    id: user.id, 
                                    data: { 
                                      isBanned: true, 
                                      banReason: banReason || 'No reason provided',
                                      bannedAt: new Date()
                                    } 
                                  });
                                  setBanUserId(null);
                                  setBanReason('');
                                }}
                                disabled={updateUserMutation.isPending}
                                data-testid="button-confirm-ban"
                              >
                                {updateUserMutation.isPending ? "Banning..." : "Confirm Ban"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
    onSuccess: async () => {
      // Invalidate and refetch all related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/admin/verification-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] }),
      ]);
      // Force refetch users to ensure UI updates
      await queryClient.refetchQueries({ queryKey: ['/api/admin/users'] });
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

// Deposits Management Component
function DepositsManagement({ adminId }: { adminId: string }) {
  const { toast } = useToast();
  const { data: deposits = [] } = useQuery<(Transaction & { user?: User })[]>({
    queryKey: ['/api/admin/transactions?type=deposit'],
    queryFn: async () => {
      const res = await fetch('/api/admin/transactions?type=deposit', {
        headers: { 'x-user-id': adminId },
      });
      if (!res.ok) throw new Error('Failed to fetch deposits');
      return res.json();
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'completed' | 'failed' }) => {
      const res = await fetch(`/api/admin/transactions/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': adminId 
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update transaction');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate deposit queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions?type=deposit'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      
      // CRITICAL: Invalidate all user queries so wallet balances update
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      
      toast({
        title: "تم التحديث",
        description: "Deposit request updated successfully",
      });
    },
  });

  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const completedDeposits = deposits.filter(d => d.status === 'completed');
  const rejectedDeposits = deposits.filter(d => d.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Pending Deposits */}
      <Card className="glass-morphism border-2 border-yellow-500/30 neon-glow-warning">
        <CardHeader>
          <CardTitle>Pending Deposit Requests</CardTitle>
          <CardDescription>Approve or reject pending deposit requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingDeposits.map((deposit) => (
                  <TableRow key={deposit.id} data-testid={`row-deposit-${deposit.id}`}>
                    <TableCell className="font-medium">{deposit.user?.username || deposit.userId.slice(0, 8)}</TableCell>
                    <TableCell className="font-semibold text-green-400">${deposit.amount}</TableCell>
                    <TableCell className="font-mono text-xs">{deposit.accountNumber || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{deposit.description || '-'}</TableCell>
                    <TableCell className="text-xs">{new Date(deposit.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">pending</Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateTransactionMutation.mutate({ id: deposit.id, status: 'completed' })}
                        disabled={updateTransactionMutation.isPending}
                        data-testid={`button-approve-deposit-${deposit.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateTransactionMutation.mutate({ id: deposit.id, status: 'failed' })}
                        disabled={updateTransactionMutation.isPending}
                        data-testid={`button-reject-deposit-${deposit.id}`}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingDeposits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No pending deposit requests
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Completed Deposits */}
      <Card className="glass-morphism">
        <CardHeader>
          <CardTitle>Recent Completed Deposits ({completedDeposits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedDeposits.slice(0, 10).map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell className="font-medium">{deposit.user?.username || deposit.userId.slice(0, 8)}</TableCell>
                    <TableCell className="font-semibold text-green-400">${deposit.amount}</TableCell>
                    <TableCell className="text-xs">{new Date(deposit.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">Approved</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Rejected Deposits */}
      {rejectedDeposits.length > 0 && (
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>Recent Rejected Deposits ({rejectedDeposits.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedDeposits.slice(0, 10).map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell className="font-medium">{deposit.user?.username || deposit.userId.slice(0, 8)}</TableCell>
                      <TableCell className="font-semibold text-red-400">${deposit.amount}</TableCell>
                      <TableCell className="text-xs">{new Date(deposit.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-500">Rejected</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Withdrawals Management Component
function WithdrawalsManagement({ adminId }: { adminId: string }) {
  const { toast } = useToast();
  const { data: withdrawals = [] } = useQuery<(Transaction & { user?: User })[]>({
    queryKey: ['/api/admin/transactions?type=withdraw'],
    queryFn: async () => {
      const res = await fetch('/api/admin/transactions?type=withdraw', {
        headers: { 'x-user-id': adminId },
      });
      if (!res.ok) throw new Error('Failed to fetch withdrawals');
      return res.json();
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'completed' | 'failed' }) => {
      const res = await fetch(`/api/admin/transactions/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': adminId 
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update transaction');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate withdrawal queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions?type=withdraw'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      
      // CRITICAL: Invalidate all user queries so wallet balances update
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      
      toast({
        title: "تم التحديث",
        description: "Withdrawal request updated successfully",
      });
    },
  });

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const completedWithdrawals = withdrawals.filter(w => w.status === 'completed');
  const rejectedWithdrawals = withdrawals.filter(w => w.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Pending Withdrawals */}
      <Card className="glass-morphism border-2 border-yellow-500/30 neon-glow-warning">
        <CardHeader>
          <CardTitle>Pending Withdrawal Requests</CardTitle>
          <CardDescription>Approve or reject pending withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id} data-testid={`row-withdrawal-${withdrawal.id}`}>
                    <TableCell className="font-medium">{withdrawal.user?.username || withdrawal.userId.slice(0, 8)}</TableCell>
                    <TableCell className="font-semibold text-red-400">${withdrawal.amount}</TableCell>
                    <TableCell className="font-mono text-xs">{withdrawal.accountNumber || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{withdrawal.description || '-'}</TableCell>
                    <TableCell className="text-xs">{new Date(withdrawal.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">pending</Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateTransactionMutation.mutate({ id: withdrawal.id, status: 'completed' })}
                        disabled={updateTransactionMutation.isPending}
                        data-testid={`button-approve-withdrawal-${withdrawal.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateTransactionMutation.mutate({ id: withdrawal.id, status: 'failed' })}
                        disabled={updateTransactionMutation.isPending}
                        data-testid={`button-reject-withdrawal-${withdrawal.id}`}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingWithdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No pending withdrawal requests
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Completed Withdrawals */}
      <Card className="glass-morphism">
        <CardHeader>
          <CardTitle>Recent Completed Withdrawals ({completedWithdrawals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedWithdrawals.slice(0, 10).map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">{withdrawal.user?.username || withdrawal.userId.slice(0, 8)}</TableCell>
                    <TableCell className="font-semibold text-red-400">${withdrawal.amount}</TableCell>
                    <TableCell className="text-xs">{new Date(withdrawal.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">Approved</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Rejected Withdrawals */}
      {rejectedWithdrawals.length > 0 && (
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>Recent Rejected Withdrawals ({rejectedWithdrawals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedWithdrawals.slice(0, 10).map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="font-medium">{withdrawal.user?.username || withdrawal.userId.slice(0, 8)}</TableCell>
                      <TableCell className="font-semibold text-red-400">${withdrawal.amount}</TableCell>
                      <TableCell className="text-xs">{new Date(withdrawal.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-500">Rejected</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Banned Users Management Component
function BannedUsersManagement({ adminId }: { adminId: string }) {
  const { toast } = useToast();
  const [unbanUserId, setUnbanUserId] = useState<string | null>(null);
  
  const { data: bannedUsers = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/banned-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/banned-users', {
        headers: { 'x-user-id': adminId },
      });
      if (!res.ok) throw new Error('Failed to fetch banned users');
      return res.json();
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': adminId 
        },
      });
      if (!res.ok) throw new Error('Failed to unban user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['/api/admin/banned-users'] });
      queryClient.refetchQueries({ queryKey: ['/api/admin/users'] });
      queryClient.refetchQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "تم إلغاء الحظر",
        description: "User has been unbanned successfully",
      });
      setUnbanUserId(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card className="glass-morphism">
        <CardHeader>
          <CardTitle>Banned Users ({bannedUsers.length})</CardTitle>
          <CardDescription>View and manage banned users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ban Reason</TableHead>
                  <TableHead>Banned At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bannedUsers.map((user) => (
                  <TableRow key={user.id} data-testid={`row-banned-user-${user.id}`}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{user.banReason || 'No reason provided'}</TableCell>
                    <TableCell className="text-xs">
                      {user.bannedAt ? new Date(user.bannedAt).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Dialog open={unbanUserId === user.id} onOpenChange={(open) => !open && setUnbanUserId(null)}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => setUnbanUserId(user.id)}
                            data-testid={`button-unban-${user.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Unban
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-morphism">
                          <DialogHeader>
                            <DialogTitle>Confirm Unban</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to unban user "{user.username}"? They will be able to access the platform again.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              variant="outline"
                              onClick={() => setUnbanUserId(null)}
                              data-testid="button-cancel-unban"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="default"
                              onClick={() => unbanUserMutation.mutate(user.id)}
                              disabled={unbanUserMutation.isPending}
                              data-testid="button-confirm-unban"
                            >
                              {unbanUserMutation.isPending ? "Unbanning..." : "Confirm Unban"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
                {bannedUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No banned users
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
