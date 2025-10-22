import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User as UserIcon, 
  Mail, 
  Camera, 
  Edit3,
  Save,
  X,
  Star,
  Package,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  const { data: userData, isLoading } = useQuery<User>({ 
    queryKey: ['/api/users', user?.id], 
    enabled: !!user 
  });

  const { data: userProducts = [] } = useQuery<any[]>({ 
    queryKey: ['/api/users', user?.id, 'products'],
    enabled: !!user
  });

  const totalSales = userProducts.reduce((sum, p) => sum + (p.sales || 0), 0);
  
  const { data: statsData } = useQuery<{ verifiedSellers: number }>({
    queryKey: ['/api/stats']
  });
  
  const sellerRank = userData && statsData 
    ? Math.min(100, Math.round((1 - (statsData.verifiedSellers > 0 ? (parseFloat(userData.rating || "0") / 5) : 0)) * 100))
    : 100;

  const updateProfileMutation = useMutation({ 
    mutationFn: async (data: Partial<User>) => {
      const response = await apiRequest('PATCH', `/api/users/${user?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id] });
      setIsEditing(false);
    }
  });

  const handleSaveProfile = () => {
    const formData = {
      fullName: (document.getElementById('fullname') as HTMLInputElement)?.value,
      username: (document.getElementById('username') as HTMLInputElement)?.value,
      email: (document.getElementById('email') as HTMLInputElement)?.value,
      bio: (document.getElementById('bio') as HTMLTextAreaElement)?.value,
    };
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          {/* Cover Section Skeleton */}
          <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-24 md:mb-32">
            <Skeleton className="absolute inset-0" />
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
              <Skeleton className="w-40 h-40 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Info Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-morphism border-border/30">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-60 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-border/30">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-60 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <Card className="glass-morphism border-border/30">
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </CardContent>
              </Card>

              <Card className="glass-morphism border-border/30">
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const memberSince = new Date(userData.createdAt).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Cover Section with Neon Gradient */}
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-24 md:mb-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary/30 to-primary/40 animated-gradient" />
          <div className="absolute inset-0 bg-background/20" />
          
          {/* Avatar positioned to overlap cover */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
            <div className="relative group">
              <Avatar className="w-40 h-40 border-4 border-background neon-glow-primary" data-testid="img-avatar">
                <AvatarImage src={userData.avatarUrl} alt={userData.fullName} />
                <AvatarFallback className="text-3xl bg-primary/20 text-primary font-bold">
                  {userData.fullName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {isEditing && (
                <Button 
                  size="icon"
                  className="absolute bottom-2 right-2 rounded-full neon-glow-secondary"
                  data-testid="button-change-avatar"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
              
              {userData.isVerified && (
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center neon-glow-success border-4 border-background">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Edit/Save Button */}
          <div className="absolute top-4 right-4">
            {isEditing ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(false)}
                  className="glass-morphism border-border/50"
                  data-testid="button-cancel-edit"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="neon-glow-primary"
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="glass-morphism border-border/50"
                data-testid="button-edit-profile"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card className="glass-morphism border-border/30">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your personal details and bio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input 
                      id="fullname"
                      defaultValue={userData.fullName}
                      disabled={!isEditing}
                      className={`glass-morphism border-border/50 mt-2 ${isEditing ? 'focus:border-primary' : ''}`}
                      data-testid="input-fullname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username"
                      defaultValue={userData.username}
                      disabled={!isEditing}
                      className={`glass-morphism border-border/50 mt-2 ${isEditing ? 'focus:border-primary' : ''}`}
                      data-testid="input-username"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    defaultValue={userData.email}
                    disabled={!isEditing}
                    className={`glass-morphism border-border/50 mt-2 ${isEditing ? 'focus:border-primary' : ''}`}
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio"
                    defaultValue={userData.bio}
                    disabled={!isEditing}
                    className={`glass-morphism border-border/50 mt-2 min-h-[100px] ${isEditing ? 'focus:border-primary' : ''}`}
                    data-testid="input-bio"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="glass-morphism border-border/30">
              <CardHeader>
                <CardTitle>Performance Stats</CardTitle>
                <CardDescription>Your achievements on Tiro</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 glass-morphism rounded-lg border border-border/30" data-testid="card-rating">
                    <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold text-foreground" data-testid="text-rating">{userData.rating}</p>
                    <p className="text-xs text-muted-foreground mt-1">Rating</p>
                    <p className="text-xs text-muted-foreground" data-testid="text-reviews">({userData.totalReviews} reviews)</p>
                  </div>
                  <div className="text-center p-4 glass-morphism rounded-lg border border-border/30" data-testid="card-sales">
                    <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-sales">{totalSales}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Sales</p>
                  </div>
                  <div className="text-center p-4 glass-morphism rounded-lg border border-border/30" data-testid="card-rank">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-secondary" />
                    <p className="text-2xl font-bold text-foreground" data-testid="text-seller-rank">Top {sellerRank}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Seller Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card className="glass-morphism border-border/30">
              <CardHeader>
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between" data-testid="text-verification-status">
                  <span className="text-sm text-muted-foreground">Verification</span>
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30 neon-glow-success" data-testid="badge-verified">
                    {userData.isVerified ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between" data-testid="text-member-since">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">{memberSince}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Type</span>
                  <Badge variant="secondary">Seller</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-morphism border-border/30">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start border-border/50" data-testid="button-change-password">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start border-border/50" data-testid="button-notification-settings">
                  <Mail className="w-4 h-4 mr-2" />
                  Notification Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
