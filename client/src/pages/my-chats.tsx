import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Clock, CheckCircle, XCircle, Package } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getUserAvatar } from "@/lib/utils";
import type { ChatWithDetails } from "@shared/schema";
import { ChatDialog } from "@/components/chat-dialog";

export function MyChatsPage() {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  const { data: chats = [], isLoading } = useQuery<ChatWithDetails[]>({
    queryKey: [`/api/chats?userId=${user?.id}`],
    enabled: !!user,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Sort chats: active first, then by created date (newest first)
  const sortedChats = [...chats].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getStatusInfo = (chat: ChatWithDetails) => {
    const isSeller = user?.id === chat.sellerId;
    
    switch (chat.status) {
      case 'active':
        return {
          label: 'نشطة',
          color: 'bg-green-500/20 text-green-400 border-green-400/30',
          icon: <MessageCircle className="w-4 h-4" />,
        };
      case 'under_review':
        return {
          label: 'قيد المراجعة',
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
          icon: <Clock className="w-4 h-4" />,
        };
      case 'closed_buyer':
        return {
          label: 'مغلقة - لصالح البائع',
          color: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case 'closed_seller':
        return {
          label: 'مغلقة - لصالح المشتري',
          color: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case 'resolved_seller':
        return {
          label: 'محلولة - لصالح البائع',
          color: 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30',
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case 'resolved_buyer':
        return {
          label: 'محلولة - لصالح المشتري',
          color: 'bg-pink-500/20 text-pink-400 border-pink-400/30',
          icon: <CheckCircle className="w-4 h-4" />,
        };
      default:
        return {
          label: 'مغلقة',
          color: 'bg-gray-500/20 text-gray-400 border-gray-400/30',
          icon: <XCircle className="w-4 h-4" />,
        };
    }
  };

  const handleChatClick = (chatId: string) => {
    setSelectedChatId(chatId);
    setChatDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-morphism border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-60" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <MessageCircle className="w-10 h-10 text-primary neon-glow-primary" />
            محادثاتي
          </h1>
          <p className="text-muted-foreground">
            جميع محادثاتك النشطة والمغلقة محفوظة هنا كسجل دائم للمراجعة والإثبات
          </p>
        </div>

        {/* Chats List */}
        {sortedChats.length === 0 ? (
          <Card className="glass-morphism border-border/30">
            <CardContent className="p-12 text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                لا توجد محادثات بعد
              </h3>
              <p className="text-muted-foreground">
                عندما تشتري أو تبيع منتجاً، ستظهر المحادثات هنا وتبقى محفوظة دائماً
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedChats.map((chat) => {
              const isSeller = user?.id === chat.sellerId;
              const otherUser = isSeller ? chat.buyer : chat.seller;
              const statusInfo = getStatusInfo(chat);
              const isActive = chat.status === 'active';
              const createdDate = new Date(chat.createdAt).toLocaleDateString('ar-IQ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <Card
                  key={chat.id}
                  className={`glass-morphism border-border/30 cursor-pointer transition-all hover-elevate active-elevate-2 ${
                    isActive ? 'border-primary/30' : ''
                  }`}
                  onClick={() => handleChatClick(chat.id)}
                  data-testid={`card-chat-${chat.id}`}
                >
                  <CardContent className="p-3 md:p-6">
                    <div className="flex items-start gap-2.5 md:gap-4">
                      {/* Avatar */}
                      <Avatar className="w-10 h-10 md:w-14 md:h-14 ring-1 md:ring-2 ring-primary/30" data-testid={`avatar-${otherUser.id}`}>
                        <AvatarImage src={getUserAvatar(otherUser.id)} alt={otherUser.username} />
                        <AvatarFallback className="bg-primary/20 text-primary text-sm md:text-lg font-bold">
                          {otherUser.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-semibold text-foreground mb-0.5 md:mb-1" data-testid={`text-username-${chat.id}`}>
                              {otherUser.username}
                              {otherUser.isVerified && (
                                <span className="inline-block mr-1 text-green-500 text-sm md:text-base">✓</span>
                              )}
                            </h3>
                            <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1.5 md:gap-2 flex-wrap">
                              <span className="font-medium">{isSeller ? 'مشتري' : 'بائع'}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 md:px-2 py-0 md:py-0.5 border-primary/30 text-primary neon-glow-primary" data-testid={`badge-conversation-${chat.id}`}>
                                #{chat.conversationId}
                              </Badge>
                              <span className="hidden sm:inline">•</span>
                              <span className="truncate hidden sm:inline">{createdDate}</span>
                            </p>
                          </div>
                          
                          {/* Status Badge */}
                          <Badge 
                            className={`${statusInfo.color} flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 neon-glow-primary whitespace-nowrap text-xs md:text-sm`}
                            data-testid={`badge-status-${chat.id}`}
                          >
                            <span className="w-3 h-3 md:w-4 md:h-4">{statusInfo.icon}</span>
                            <span className="hidden sm:inline">{statusInfo.label}</span>
                          </Badge>
                        </div>

                        {/* Product Info */}
                        <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-3 rounded-lg bg-background/50 border border-border/30 mt-2 md:mt-3">
                          <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-foreground truncate" data-testid={`text-product-${chat.id}`}>
                              {chat.product.title}
                            </p>
                            <p className="text-[10px] md:text-xs text-muted-foreground">
                              {Number(chat.product.price).toLocaleString('ar-IQ')} IQD
                            </p>
                          </div>
                        </div>

                        {/* Expiration Info for Active Chats */}
                        {isActive && (
                          <div className="flex items-center gap-1.5 md:gap-2 mt-2 md:mt-3 text-[10px] md:text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                            <span className="truncate">
                              تنتهي في: {new Date(chat.expiresAt).toLocaleDateString('ar-IQ', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}

                        {/* Payment Scheduled Info */}
                        {chat.paymentScheduledAt && (
                          <div className="flex items-center gap-1.5 md:gap-2 mt-1.5 md:mt-2 p-1.5 md:p-2 rounded bg-blue-500/10 border border-blue-400/30">
                            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400 flex-shrink-0" />
                            <span className="text-[10px] md:text-xs text-blue-300 truncate">
                              الدفع مجدول في: {new Date(chat.paymentScheduledAt).toLocaleDateString('ar-IQ', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat Dialog */}
      {selectedChatId && user && (
        <ChatDialog
          chatId={selectedChatId}
          currentUser={user}
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
        />
      )}
    </div>
  );
}
