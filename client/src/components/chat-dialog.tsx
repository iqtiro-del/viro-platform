import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUserAvatar } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import type { ChatWithDetails, MessageWithSender, User } from "@shared/schema";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
  currentUser: Omit<User, 'password'> | User;
}

export function ChatDialog({ open, onOpenChange, chatId, currentUser }: ChatDialogProps) {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Fetch chat details
  const { data: chat } = useQuery<ChatWithDetails>({
    queryKey: ['/api/chats', chatId],
    enabled: open && !!chatId,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  // Fetch messages
  const { data: messages = [] } = useQuery<MessageWithSender[]>({
    queryKey: ['/api/chats', chatId, 'messages'],
    enabled: open && !!chatId,
    refetchInterval: 3000, // Poll for new messages every 3 seconds
    refetchOnMount: 'always',
    staleTime: 0,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageText: string) =>
      apiRequest('POST', `/api/chats/${chatId}/messages`, {
        senderId: currentUser.id,
        message: messageText,
      }),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chats', chatId, 'messages'] });
    },
  });

  // Close chat mutation
  const closeChatMutation = useMutation({
    mutationFn: (role: 'seller' | 'buyer') =>
      apiRequest('POST', `/api/chats/${chatId}/close`, {
        userId: currentUser.id,
        role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats', chatId] });
      // Invalidate all chats queries including my-chats page
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chats'],
        refetchType: 'all'
      });
      onOpenChange(false);
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!chat) return null;

  const isSeller = currentUser.id === chat.sellerId;
  const isBuyer = currentUser.id === chat.buyerId;
  const otherUser = isSeller ? chat.buyer : chat.seller;
  const isActive = chat.status === 'active';
  const isUnderReview = chat.status === 'under_review';
  const isClosed = chat.status.startsWith('closed_') || chat.status.startsWith('resolved_');

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!isActive) return null;
    const now = new Date();
    const expiresAt = new Date(chat.expiresAt);
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return "منتهية";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}س ${minutes}د`;
  };

  const timeRemaining = getTimeRemaining();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && isActive) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleCloseChat = () => {
    const role = isSeller ? 'seller' : 'buyer';
    const confirmMessage = isSeller 
      ? "هل أنت متأكد من إغلاق المحادثة لصالح المشتري؟ سيتم استرداد المبلغ كاملاً للمشتري فوراً." 
      : "هل أنت متأكد من إغلاق المحادثة لصالح البائع؟ سيتم إطلاق الدفع للبائع بعد 10 ساعات.";
    
    if (confirm(confirmMessage)) {
      closeChatMutation.mutate(role);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl h-[600px] flex flex-col p-0 gap-0 bg-gradient-to-br from-zinc-900/95 via-violet-950/90 to-zinc-900/95 border border-violet-500/30 shadow-2xl shadow-violet-500/20"
        data-testid="dialog-chat"
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-violet-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-violet-500/50" data-testid="avatar-other-user">
                <AvatarImage src={getUserAvatar(otherUser.id)} alt={otherUser.username} />
                <AvatarFallback className="bg-violet-600 text-white">
                  {otherUser.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-bold text-violet-50" data-testid="text-chat-title">
                  محادثة مع {otherUser.username}
                </DialogTitle>
                <p className="text-sm text-violet-300/70" data-testid="text-product-title">
                  {chat.product.title}
                </p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {isActive && timeRemaining && (
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-400/30"
                  data-testid="badge-time-remaining"
                >
                  <Clock className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium text-violet-200">{timeRemaining}</span>
                </div>
              )}
              {isUnderReview && (
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-400/30"
                  data-testid="badge-under-review"
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-200">قيد المراجعة</span>
                </div>
              )}
              {isClosed && (
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-400/30"
                  data-testid="badge-closed"
                >
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-200">مغلقة</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => {
              const isSystemMessage = msg.senderType === 'system';
              const isOwnMessage = msg.senderId === currentUser.id;
              
              // System message rendering
              if (isSystemMessage) {
                return (
                  <div
                    key={msg.id}
                    className="flex justify-center"
                    data-testid={`message-system-${msg.id}`}
                  >
                    <div className="max-w-[85%] px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-400/30">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-blue-300 mb-1">معلومات النظام</p>
                          <p className="text-sm text-blue-100 whitespace-pre-line">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // User message rendering
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                  data-testid={`message-${msg.id}`}
                >
                  <Avatar className="h-8 w-8 ring-2 ring-violet-500/30" data-testid={`avatar-sender-${msg.id}`}>
                    <AvatarImage src={getUserAvatar(msg.sender.id)} alt={msg.sender.username} />
                    <AvatarFallback className="bg-violet-600 text-white text-xs">
                      {msg.sender.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-violet-300/60" data-testid={`text-sender-name-${msg.id}`}>
                      {msg.sender.username}
                    </span>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-violet-600/80 text-violet-50'
                          : 'bg-zinc-800/80 text-zinc-100'
                      } border ${
                        isOwnMessage
                          ? 'border-violet-500/30'
                          : 'border-zinc-700/30'
                      }`}
                      data-testid={`text-message-content-${msg.id}`}
                    >
                      <p className="text-sm break-words">{msg.message}</p>
                    </div>
                    <span className="text-xs text-violet-300/40" data-testid={`text-message-time-${msg.id}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('ar-IQ', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Input / Actions */}
        <div className="p-6 pt-4 border-t border-violet-500/20 space-y-3">
          {/* Message Input */}
          {isActive && (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك..."
                className="flex-1 bg-zinc-800/50 border-violet-500/30 text-violet-50 placeholder:text-violet-300/40 focus:border-violet-400"
                disabled={sendMessageMutation.isPending}
                data-testid="input-message"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700 text-white"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}

          {/* Close Chat Buttons */}
          {isActive && (
            <div className="flex gap-2">
              {isSeller && (
                <Button
                  onClick={handleCloseChat}
                  disabled={closeChatMutation.isPending}
                  variant="destructive"
                  className="flex-1"
                  data-testid="button-close-seller"
                >
                  إغلاق المحادثة لصالح المشتري
                </Button>
              )}
              {isBuyer && (
                <Button
                  onClick={handleCloseChat}
                  disabled={closeChatMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-close-buyer"
                >
                  إغلاق المحادثة لصالح البائع
                </Button>
              )}
            </div>
          )}

          {/* Under Review Notice */}
          {isUnderReview && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-400/30" data-testid="notice-under-review">
              <p className="text-sm text-yellow-200 text-center">
                انتهت مدة المحادثة. المحادثة الآن قيد المراجعة من قبل إدارة الموقع.
              </p>
            </div>
          )}

          {/* Closed Notice */}
          {isClosed && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/30" data-testid="notice-closed">
              <div className="text-center">
                <p className="text-sm font-semibold text-blue-200 mb-1">
                  {chat.status === 'closed_buyer' && 'مغلقة – لصالح البائع'}
                  {chat.status === 'closed_seller' && 'مغلقة – لصالح المشتري'}
                  {chat.status === 'resolved_buyer' && 'محلولة – لصالح المشتري'}
                  {chat.status === 'resolved_seller' && 'محلولة – لصالح البائع'}
                  {!['closed_buyer', 'closed_seller', 'resolved_buyer', 'resolved_seller'].includes(chat.status) && 'تم إغلاق المحادثة'}
                </p>
                <p className="text-xs text-blue-300/70">
                  لا يمكن إرسال رسائل جديدة. جميع الرسائل السابقة محفوظة للسجلات.
                </p>
                {chat.closedBy === 'admin' && (
                  <p className="text-xs text-blue-300/70 mt-1">
                    تم الإغلاق من قبل الإدارة
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
