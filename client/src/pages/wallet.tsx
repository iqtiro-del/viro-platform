import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Clock,
  Bitcoin,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "@shared/schema";
import { useState, useEffect } from "react";

export function WalletPage() {
  const { user, setUser, refreshUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("");
  const [userPaymentNumber, setUserPaymentNumber] = useState(""); // User's wallet/account number for deposit
  const [depositScreenshot, setDepositScreenshot] = useState<File | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [accountNumberError, setAccountNumberError] = useState("");
  const [walletAddressError, setWalletAddressError] = useState("");
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [cryptoDialogOpen, setCryptoDialogOpen] = useState(false);
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [cryptoCurrency, setCryptoCurrency] = useState("");
  
  // Check URL for payment status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const orderId = params.get('order_id');
    
    if (paymentStatus === 'success') {
      toast({
        title: "جاري معالجة الدفع",
        description: "سيتم إضافة الرصيد تلقائياً بعد تأكيد الدفع على الشبكة",
        duration: 8000
      });
      // Clean up URL
      window.history.replaceState({}, '', '/wallet');
    } else if (paymentStatus === 'cancelled') {
      toast({
        variant: "destructive",
        title: "تم إلغاء الدفع",
        description: "تم إلغاء عملية الدفع بالعملات الرقمية",
      });
      window.history.replaceState({}, '', '/wallet');
    }
  }, []);
  
  // Refresh user data when wallet page loads to get latest balance
  useEffect(() => {
    refreshUser();
  }, []);

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({ 
    queryKey: ['/api/users', user?.id, 'transactions'], 
    enabled: !!user 
  });

  const balance = user?.balance ? parseFloat(user.balance) : 0;
  const totalEarnings = user?.totalEarnings ? parseFloat(user.totalEarnings) : 0;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentEarnings = transactions
    .filter(t => t.type === 'sale' && t.status === 'completed' && new Date(t.createdAt) >= thirtyDaysAgo)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const previousEarnings = transactions
    .filter(t => t.type === 'sale' && t.status === 'completed' && new Date(t.createdAt) < thirtyDaysAgo)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const profitPercentage = previousEarnings > 0 
    ? ((recentEarnings - previousEarnings) / previousEarnings) * 100 
    : recentEarnings > 0 ? 100 : 0;
  
  const profitTrend: "up" | "down" = profitPercentage >= 0 ? "up" : "down";
  
  const walletData = {
    balance,
    totalEarnings,
    profitTrend,
    profitPercentage: Math.abs(profitPercentage),
  };

  const depositMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('userId', user?.id?.toString() || '');
      formData.append('amount', depositAmount);
      formData.append('paymentMethod', depositMethod);
      if (userPaymentNumber) {
        formData.append('payerReference', userPaymentNumber);
      }
      if (depositScreenshot) {
        formData.append('screenshot', depositScreenshot);
      }
      
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit deposit');
      }
      
      return response.json();
    },
    onSuccess: async (data) => {
      // Invalidate transaction queries
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'transactions'] });
      // Invalidate user data to refresh balance
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id] });
      // Refresh user data from server immediately
      await refreshUser();
      
      if (data.status === 'pending') {
        toast({
          title: "طلب الإيداع قيد المراجعة",
          description: "سيتم إضافة الرصيد بعد موافقة الإدارة على الطلب",
          duration: 5000
        });
      } else {
        toast({
          title: t("wallet.depositSuccess"),
          description: `$${depositAmount} ${t("wallet.addedToWallet")}`
        });
      }
      
      setDepositAmount("");
      setDepositMethod("");
      setUserPaymentNumber("");
      setDepositScreenshot(null);
      setDepositDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: t("wallet.depositFailed"),
        description: error.message || t("wallet.depositError"),
        variant: "destructive"
      });
    }
  });

  const validateAccountNumber = (value: string): boolean => {
    setAccountNumberError("");
    
    if (!value || value.trim() === "") {
      setAccountNumberError("رقم الحساب مطلوب");
      return false;
    }
    
    // FIB and other methods might allow alphanumeric characters
    // Al-Rafidain might still be digits only, but let's make it more flexible globally for now
    // as requested by the user for FIB specifically.
    
    if (value.length < 6 || value.length > 34) {
      setAccountNumberError("رقم الحساب يجب أن يكون بين 6 و 34 حرفاً أو رقماً");
      return false;
    }
    
    return true;
  };

  const validateWalletAddress = (value: string): boolean => {
    setWalletAddressError("");
    if (!value || value.trim() === "") {
      setWalletAddressError("عنوان المحفظة مطلوب");
      return false;
    }
    if (!value.startsWith("T")) {
      setWalletAddressError("يجب أن يبدأ العنوان بحرف T (شبكة TRON)");
      return false;
    }
    if (value.length < 34) {
      setWalletAddressError("عنوان المحفظة غير صحيح");
      return false;
    }
    return true;
  };

  // Crypto deposit mutation
  const cryptoDepositMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/crypto/create-invoice', {
        userId: user?.id,
        amount: cryptoAmount,
        payCurrency: cryptoCurrency || undefined
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.invoiceUrl) {
        // Redirect to NOWPayments invoice page
        window.location.href = data.invoiceUrl;
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في إنشاء الفاتورة",
          description: data.error || "حدث خطأ أثناء إنشاء فاتورة الدفع",
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "فشل إنشاء الفاتورة",
        description: error.message || "حدث خطأ أثناء إنشاء فاتورة الدفع",
      });
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      if (withdrawMethod === "Crypto") {
        if (!validateWalletAddress(walletAddress)) {
          throw new Error(walletAddressError || "عنوان المحفظة غير صحيح");
        }
        if (parseFloat(withdrawAmount) < 10) {
          throw new Error("الحد الأدنى للسحب عبر الكريبتو هو 10 دولار");
        }
      } else {
        if (!validateAccountNumber(accountNumber)) {
          throw new Error(accountNumberError || "رقم الحساب غير صحيح");
        }
      }
      
      const response = await apiRequest('POST', '/api/wallet/withdraw', {
        userId: user?.id,
        amount: withdrawAmount,
        withdrawMethod: withdrawMethod,
        account_number: withdrawMethod === "Crypto" ? undefined : accountNumber,
        walletAddress: withdrawMethod === "Crypto" ? walletAddress : undefined,
        network: withdrawMethod === "Crypto" ? "TRC20" : undefined
      });
      return response.json();
    },
    onSuccess: async (data) => {
      // Invalidate transaction queries
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'transactions'] });
      // Invalidate user data to refresh balance
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id] });
      // Refresh user data from server immediately
      await refreshUser();
      
      if (data.status === 'pending') {
        toast({
          title: "تم خصم المبلغ من رصيدك",
          description: "طلب السحب قيد المراجعة - سيتم إرجاع المبلغ إذا تم رفض الطلب",
          duration: 5000
        });
      } else {
        toast({
          title: t("wallet.withdrawSuccess"),
          description: `$${withdrawAmount} ${t("wallet.withdrawnFrom")}`
        });
      }
      
      setWithdrawAmount("");
      setWithdrawMethod("");
      setAccountNumber("");
      setWalletAddress("");
      setAccountNumberError("");
      setWalletAddressError("");
      setWithdrawDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: t("wallet.withdrawFailed"),
        description: error.message || t("wallet.withdrawError"),
        variant: "destructive"
      });
    }
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "sale":
      case "deposit":
        return <ArrowDownRight className="w-4 h-4 text-green-500" />;
      case "withdraw":
      case "promotion":
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLabels: Record<string, string> = {
      completed: t("wallet.completed"),
      pending: t("wallet.pending"),
      failed: t("wallet.failed")
    };
    const variants: Record<string, { variant: "default" | "secondary" | "outline", className: string }> = {
      completed: { variant: "default", className: "bg-green-500/20 text-green-500 border-green-500/30" },
      pending: { variant: "secondary", className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
      failed: { variant: "outline", className: "bg-red-500/20 text-red-500 border-red-500/30" },
    };

    const config = variants[status] || variants.pending;
    const label = statusLabels[status] || status;
    return (
      <Badge variant={config.variant} className={config.className}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{t("wallet.title")}</h1>
          <p className="text-muted-foreground">{t("wallet.subtitle")}</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Balance */}
          <Card className="glass-morphism border-primary/30 neon-glow-primary col-span-1 md:col-span-2 hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <CardDescription className="text-muted-foreground">{t("wallet.balance")}</CardDescription>
                  {isLoading ? (
                    <Skeleton className="h-14 w-48 mt-2" data-testid="skeleton-balance" />
                  ) : (
                    <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 neon-text-glow-cyan break-all overflow-hidden" data-testid="text-wallet-balance">
                      ${walletData.balance.toFixed(2)}
                    </CardTitle>
                  )}
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center neon-glow-primary group">
                  <WalletIcon className="w-6 h-6 md:w-8 md:h-8 text-primary icon-animate" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 neon-glow-secondary btn-glow-primary hover-scale" data-testid="button-deposit">
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      {t("wallet.deposit")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-morphism-strong border-border/50 max-h-[90vh] flex flex-col w-[90vw] sm:max-w-[380px] rounded-2xl p-4 md:p-6">
                    <DialogHeader className="flex-shrink-0">
                      <DialogTitle>{t("wallet.depositFunds")}</DialogTitle>
                      <DialogDescription>
                        {t("wallet.depositDescription")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4 overflow-y-auto flex-1 px-1">
                      <div>
                        <Label htmlFor="deposit-amount">{t("wallet.amount")}</Label>
                        <Input 
                          id="deposit-amount" 
                          type="number" 
                          placeholder={t("wallet.amountPlaceholder")}
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="glass-morphism border-border/50 mt-2"
                          data-testid="input-deposit-amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment-method">{t("wallet.paymentMethod")}</Label>
                        <Select value={depositMethod} onValueChange={setDepositMethod}>
                          <SelectTrigger className="glass-morphism border-border/50 mt-2" data-testid="select-payment-method">
                            <SelectValue placeholder={t("wallet.selectMethod")} />
                          </SelectTrigger>
                          <SelectContent className="glass-morphism-strong border-border/50">
                            <SelectItem value="Al-Rafidain QiServices">{t("wallet.alRafidain")}</SelectItem>
                            <SelectItem value="FIB">FIB</SelectItem>
                            <SelectItem value="Zain Cash">Zain Cash</SelectItem>
                            <SelectItem value="FastPay">FastPay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Conditional fields for FastPay */}
                      {depositMethod === "FastPay" && (
                        <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-md">
                          <div>
                            <Label>رقم FastPay للمنصة</Label>
                            <Input 
                              type="text"
                              value="07738762233"
                              readOnly
                              className="glass-morphism border-border/50 mt-2 bg-muted/50 cursor-not-allowed"
                              data-testid="input-platform-fastpay-account"
                            />
                            <p className="text-xs text-muted-foreground mt-1">{t("wallet.transferToThisAccount")}</p>
                          </div>
                          <div>
                            <Label htmlFor="user-fastpay-account">
                              رقم محفظتك في FastPay <span className="text-destructive">*</span>
                            </Label>
                            <Input 
                              id="user-fastpay-account"
                              type="text"
                              placeholder="أدخل رقم المحفظة المستخدم للتحويل"
                              value={userPaymentNumber}
                              onChange={(e) => setUserPaymentNumber(e.target.value)}
                              className="glass-morphism border-border/50 mt-2"
                              data-testid="input-user-fastpay-account"
                            />
                            <p className="text-xs text-muted-foreground mt-1">أدخل رقم الهاتف المرتبط بمحفظتك</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Conditional fields for Zain Cash */}
                      {depositMethod === "Zain Cash" && (
                        <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-md">
                          <div>
                            <Label>رقم زين كاش للمنصة</Label>
                            <Input 
                              type="text"
                              value="07708917002"
                              readOnly
                              className="glass-morphism border-border/50 mt-2 bg-muted/50 cursor-not-allowed"
                              data-testid="input-platform-zaincash-account"
                            />
                            <p className="text-xs text-muted-foreground mt-1">{t("wallet.transferToThisAccount")}</p>
                          </div>
                          <div>
                            <Label htmlFor="user-zaincash-account">
                              رقم محفظتك في زين كاش <span className="text-destructive">*</span>
                            </Label>
                            <Input 
                              id="user-zaincash-account"
                              type="text"
                              placeholder="أدخل رقم المحفظة المستخدم للتحويل"
                              value={userPaymentNumber}
                              onChange={(e) => setUserPaymentNumber(e.target.value)}
                              className="glass-morphism border-border/50 mt-2"
                              data-testid="input-user-zaincash-account"
                            />
                            <p className="text-xs text-muted-foreground mt-1">أدخل رقم الهاتف المرتبط بمحفظتك</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Conditional fields for FIB */}
                      {depositMethod === "FIB" && (
                        <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-md">
                          <div>
                            <Label>رقم حساب FIB للمنصة</Label>
                            <Input 
                              type="text"
                              value="PKA4-NCFN-CPOX"
                              readOnly
                              className="glass-morphism border-border/50 mt-2 bg-muted/50 cursor-not-allowed"
                              data-testid="input-platform-fib-account"
                            />
                            <p className="text-xs text-muted-foreground mt-1">{t("wallet.transferToThisAccount")}</p>
                          </div>
                          <div>
                            <Label htmlFor="user-fib-account">
                              رقم حسابك في FIB <span className="text-destructive">*</span>
                            </Label>
                            <Input 
                              id="user-fib-account"
                              type="text"
                              placeholder="أدخل رقم حسابك المستخدم للتحويل"
                              value={userPaymentNumber}
                              onChange={(e) => setUserPaymentNumber(e.target.value)}
                              className="glass-morphism border-border/50 mt-2"
                              data-testid="input-user-fib-account"
                            />
                            <p className="text-xs text-muted-foreground mt-1">أدخل رقم الحساب الذي قمت بالتحويل منه</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Conditional fields for Rafidain Services */}
                      {depositMethod === "Al-Rafidain QiServices" && (
                        <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-md">
                          <div>
                            <Label>{t("wallet.platformRafidainAccount")}</Label>
                            <Input 
                              type="text"
                              value="5784731084"
                              readOnly
                              className="glass-morphism border-border/50 mt-2 bg-muted/50 cursor-not-allowed"
                              data-testid="input-platform-rafidain-account"
                            />
                            <p className="text-xs text-muted-foreground mt-1">{t("wallet.transferToThisAccount")}</p>
                          </div>
                          <div>
                            <Label htmlFor="user-account-number">
                              {t("wallet.yourAccountNumber")} <span className="text-destructive">*</span>
                            </Label>
                            <Input 
                              id="user-account-number"
                              type="text"
                              placeholder={t("wallet.enterAccountNumber")}
                              value={userPaymentNumber}
                              onChange={(e) => setUserPaymentNumber(e.target.value)}
                              className="glass-morphism border-border/50 mt-2"
                              data-testid="input-user-account-number"
                            />
                            <p className="text-xs text-muted-foreground mt-1">{t("wallet.accountNumberHint")}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Screenshot upload field - shown for all payment methods */}
                      {depositMethod && (
                        <div>
                          <Label htmlFor="deposit-screenshot">
                            رفع صورة الإيصال <span className="text-destructive">*</span>
                          </Label>
                          <Input 
                            id="deposit-screenshot"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setDepositScreenshot(file);
                              }
                            }}
                            className="glass-morphism border-border/50 mt-2"
                            data-testid="input-deposit-screenshot"
                          />
                          {depositScreenshot && (
                            <p className="text-xs text-green-500 mt-1">
                              ✓ تم اختيار الصورة: {depositScreenshot.name}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            يرجى رفع صورة واضحة لإيصال التحويل
                          </p>
                        </div>
                      )}
                      
                      {depositAmount && parseFloat(depositAmount) > 0 && (
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-md space-y-2" data-testid="breakdown-deposit-fee">
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="text-muted-foreground flex-shrink-0">{t("wallet.depositAmount")}</span>
                            <span className="font-medium break-all text-right min-w-0">${parseFloat(depositAmount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="text-muted-foreground flex-shrink-0">{t("wallet.processingFee")}</span>
                            <span className="font-medium text-yellow-500 break-all text-right min-w-0">-${(parseFloat(depositAmount) * 0.05).toFixed(2)}</span>
                          </div>
                          <div className="h-px bg-border/50 my-2"></div>
                          <div className="flex justify-between gap-3">
                            <span className="font-semibold text-foreground flex-shrink-0">{t("wallet.youWillReceive")}</span>
                            <span className="font-bold text-primary text-base md:text-lg break-all text-right min-w-0">${(parseFloat(depositAmount) * 0.95).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                      <Button 
                        className="w-full neon-glow-primary" 
                        data-testid="button-confirm-deposit"
                        onClick={() => depositMutation.mutate()}
                        disabled={
                          !depositAmount || 
                          !depositMethod || 
                          !depositScreenshot ||
                          depositMutation.isPending ||
                          ((depositMethod === "Al-Rafidain QiServices" || depositMethod === "FIB" || depositMethod === "Zain Cash") && !userPaymentNumber)
                        }
                      >
                        {depositMutation.isPending ? t("wallet.processing") : t("wallet.confirmDeposit")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Crypto Deposit Button and Dialog */}
                <Dialog open={cryptoDialogOpen} onOpenChange={setCryptoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 border-yellow-500/50 hover:border-yellow-500 text-yellow-500 hover-scale" data-testid="button-crypto-deposit">
                      <Bitcoin className="w-4 h-4 mr-2" />
                      كريبتو
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-morphism-strong border-border/50 max-h-[90vh] flex flex-col w-[90vw] sm:max-w-[380px] rounded-2xl p-4 md:p-6">
                    <DialogHeader className="flex-shrink-0">
                      <DialogTitle className="flex items-center gap-2">
                        <Bitcoin className="w-5 h-5 text-yellow-500" />
                        إيداع بالعملات الرقمية
                      </DialogTitle>
                      <DialogDescription>
                        أضف رصيداً إلى محفظتك باستخدام USDT
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4 overflow-y-auto flex-1 px-1">
                      <div>
                        <Label htmlFor="crypto-amount">المبلغ بالدولار (USD)</Label>
                        <Input 
                          id="crypto-amount" 
                          type="number" 
                          placeholder="أدخل المبلغ المطلوب"
                          value={cryptoAmount}
                          onChange={(e) => setCryptoAmount(e.target.value)}
                          className="glass-morphism border-border/50 mt-2"
                          min="1"
                          data-testid="input-crypto-amount"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="crypto-currency">اختر العملة (اختياري)</Label>
                        <Select value={cryptoCurrency} onValueChange={setCryptoCurrency}>
                          <SelectTrigger className="glass-morphism border-border/50 mt-2" data-testid="select-crypto-currency">
                            <SelectValue placeholder="اختر الشبكة أو اتركه فارغاً للاختيار لاحقاً" />
                          </SelectTrigger>
                          <SelectContent className="glass-morphism-strong border-border/50">
                            <SelectItem value="usdttrc20">USDT (TRC20 - Tron)</SelectItem>
                            <SelectItem value="usdtbsc">USDT (BSC - BNB Chain)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          يمكنك اختيار الشبكة الآن أو تحديدها في صفحة الدفع
                        </p>
                      </div>

                      {cryptoAmount && parseFloat(cryptoAmount) > 0 && (
                        <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-md space-y-2">
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="text-muted-foreground flex-shrink-0">مبلغ الإيداع:</span>
                            <span className="font-medium">${parseFloat(cryptoAmount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="text-muted-foreground flex-shrink-0">رسوم المنصة (5%):</span>
                            <span className="font-medium text-yellow-500">-${(parseFloat(cryptoAmount) * 0.05).toFixed(2)}</span>
                          </div>
                          <div className="h-px bg-border/50 my-2"></div>
                          <div className="flex justify-between gap-3">
                            <span className="font-semibold text-foreground flex-shrink-0">سيُضاف إلى رصيدك:</span>
                            <span className="font-bold text-green-500 text-lg">${(parseFloat(cryptoAmount) * 0.95).toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                        <p className="text-sm text-blue-400">
                          <strong>ملاحظة:</strong> بعد الضغط على "ادفع الآن"، سيتم توجيهك إلى صفحة الدفع الآمنة لإتمام العملية. سيُضاف الرصيد تلقائياً بعد تأكيد الدفع على الشبكة.
                        </p>
                      </div>

                      <Button 
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold" 
                        data-testid="button-confirm-crypto"
                        onClick={() => cryptoDepositMutation.mutate()}
                        disabled={!cryptoAmount || parseFloat(cryptoAmount) <= 0 || cryptoDepositMutation.isPending}
                      >
                        {cryptoDepositMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            جاري إنشاء الفاتورة...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            ادفع الآن
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 border-border/50" data-testid="button-withdraw">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      {t("wallet.withdraw")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-morphism-strong border-border/50 max-h-[90vh] flex flex-col w-[90vw] sm:max-w-[380px] rounded-2xl p-4 md:p-6">
                    <DialogHeader className="flex-shrink-0">
                      <DialogTitle>{t("wallet.withdrawFunds")}</DialogTitle>
                      <DialogDescription>
                        {t("wallet.withdrawDescription")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4 overflow-y-auto flex-1 px-1">
                      <div>
                        <Label htmlFor="withdraw-amount">{t("wallet.amount")}</Label>
                        <Input 
                          id="withdraw-amount" 
                          type="number" 
                          placeholder={t("wallet.amountPlaceholder")}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="glass-morphism border-border/50 mt-2"
                          data-testid="input-withdraw-amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="withdraw-method">{t("wallet.withdrawTo")}</Label>
                        <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                          <SelectTrigger className="glass-morphism border-border/50 mt-2" data-testid="select-withdraw-method">
                            <SelectValue placeholder={t("wallet.selectWithdrawMethod")} />
                          </SelectTrigger>
                          <SelectContent className="glass-morphism-strong border-border/50">
                            <SelectItem value="Al-Rafidain QiServices">{t("wallet.alRafidain")}</SelectItem>
                            <SelectItem value="FIB">FIB</SelectItem>
                            <SelectItem value="Zain Cash">Zain Cash</SelectItem>
                            <SelectItem value="FastPay">FastPay</SelectItem>
                            <SelectItem value="Crypto">Crypto (USDT - TRC20)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {withdrawMethod === "Crypto" ? (
                        <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-md">
                          <div>
                            <Label>الشبكة</Label>
                            <Input 
                              value="TRC20" 
                              readOnly 
                              className="glass-morphism border-border/50 mt-2 bg-muted/50 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <Label htmlFor="wallet-address">
                              عنوان المحفظة (USDT TRC20) <span className="text-destructive">*</span>
                            </Label>
                            <Input 
                              id="wallet-address"
                              placeholder="أدخل عنوان المحفظة الذي يبدأ بـ T"
                              value={walletAddress}
                              onChange={(e) => {
                                setWalletAddress(e.target.value);
                                if (walletAddressError) {
                                  validateWalletAddress(e.target.value);
                                }
                              }}
                              onBlur={() => validateWalletAddress(walletAddress)}
                              className={`glass-morphism border-border/50 mt-2 ${walletAddressError ? "border-destructive" : ""}`}
                            />
                            {walletAddressError && (
                              <p className="text-xs text-destructive mt-1">{walletAddressError}</p>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            * الحد الأدنى للسحب هو 10 USDT
                          </div>
                        </div>
                      ) : (
                        withdrawMethod && (
                          <div>
                            <Label htmlFor="account-number">
                              {withdrawMethod === "Zain Cash" || withdrawMethod === "FastPay" ? "رقم المحفظة" : "رقم الحساب البنكي"} <span className="text-destructive">*</span>
                            </Label>
                            <Input 
                              id="account-number" 
                              type="text" 
                              placeholder={withdrawMethod === "Zain Cash" || withdrawMethod === "FastPay" ? "أدخل رقم الهاتف المرتبط بالمحفظة" : "أدخل رقم الحساب البنكي (6-34 حرف/رقم)"}
                              value={accountNumber}
                              onChange={(e) => {
                                setAccountNumber(e.target.value);
                                if (accountNumberError) {
                                  validateAccountNumber(e.target.value);
                                }
                              }}
                              onBlur={() => validateAccountNumber(accountNumber)}
                              className={`glass-morphism border-border/50 mt-2 ${accountNumberError ? 'border-destructive' : ''}`}
                              data-testid="input-account-number"
                            />
                            {accountNumberError && (
                              <p className="text-sm text-destructive mt-1" data-testid="error-account-number">
                                {accountNumberError}
                              </p>
                            )}
                          </div>
                        )
                      )}
                      {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-md space-y-2" data-testid="breakdown-withdraw-fee">
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="text-muted-foreground flex-shrink-0">{t("wallet.withdrawalAmount")}</span>
                            <span className="font-medium break-all text-right min-w-0">${parseFloat(withdrawAmount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="text-muted-foreground flex-shrink-0">{t("wallet.processingFee")}</span>
                            <span className="font-medium text-yellow-500 break-all text-right min-w-0">-${(parseFloat(withdrawAmount) * 0.05).toFixed(2)}</span>
                          </div>
                          <div className="h-px bg-border/50 my-2"></div>
                          <div className="flex justify-between gap-3">
                            <span className="font-semibold text-foreground flex-shrink-0">{t("wallet.youWillReceive")}</span>
                            <span className="font-bold text-primary text-base md:text-lg break-all text-right min-w-0">${(parseFloat(withdrawAmount) * 0.95).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                      <Button 
                        className="w-full neon-glow-primary" 
                        data-testid="button-confirm-withdraw"
                        onClick={() => withdrawMutation.mutate()}
                        disabled={
                          !withdrawAmount || 
                          !withdrawMethod || 
                          (withdrawMethod === "Crypto" ? !walletAddress : !accountNumber) || 
                          withdrawMutation.isPending
                        }
                      >
                        {withdrawMutation.isPending ? t("wallet.processing") : t("wallet.confirmWithdrawal")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Total Earnings */}
          <Card className="glass-morphism border-border/30">
            <CardHeader>
              <CardDescription>{t("wallet.totalEarnings")}</CardDescription>
              {isLoading ? (
                <Skeleton className="h-9 w-36 mt-2" data-testid="skeleton-earnings" />
              ) : (
                <CardTitle className="text-2xl md:text-3xl font-bold break-all overflow-hidden" data-testid="text-total-earnings">
                  ${walletData.totalEarnings.toFixed(2)}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-5 w-32" data-testid="skeleton-profit-trend" />
              ) : (
                <div className="flex items-center gap-2">
                  {walletData.profitTrend === "up" ? (
                    <>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="text-green-500 font-medium" data-testid="text-profit-percentage">+{walletData.profitPercentage}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-5 h-5 text-red-500" />
                      <span className="text-red-500 font-medium" data-testid="text-profit-percentage">-{walletData.profitPercentage}%</span>
                    </>
                  )}
                  <span className="text-sm text-muted-foreground">{t("wallet.thisMonth")}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="glass-morphism border-border/30">
          <CardHeader>
            <CardTitle>{t("wallet.transactions")}</CardTitle>
            <CardDescription>{t("wallet.transactionsSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg glass-morphism border border-border/30">
                    <div className="flex items-center gap-4 flex-1">
                      <Skeleton className="w-10 h-10 rounded-full" data-testid={`skeleton-transaction-icon-${i}`} />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" data-testid={`skeleton-transaction-desc-${i}`} />
                        <Skeleton className="h-3 w-32" data-testid={`skeleton-transaction-date-${i}`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-6 w-20" data-testid={`skeleton-transaction-status-${i}`} />
                      <Skeleton className="h-6 w-16" data-testid={`skeleton-transaction-amount-${i}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const amount = parseFloat(transaction.amount);
                  const formattedDate = transaction.createdAt 
                    ? new Date(transaction.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '';
                  
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between gap-3 p-3 md:p-4 rounded-lg glass-morphism border border-border/30 hover-elevate transition-all"
                      data-testid={`transaction-${transaction.id}`}
                    >
                      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                        <div className={`w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-full flex items-center justify-center ${
                          amount > 0 ? 'bg-green-500/20 neon-glow-success' : 'bg-red-500/20'
                        }`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm md:text-base truncate" data-testid={`text-transaction-description-${transaction.id}`}>
                            {transaction.description || t("wallet.noDescription")}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <p className="text-xs md:text-sm text-muted-foreground truncate" data-testid={`text-transaction-date-${transaction.id}`}>
                              {formattedDate}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4 flex-shrink-0">
                        {getStatusBadge(transaction.status)}
                        <p className={`text-base md:text-lg font-bold break-all text-right ${
                          amount > 0 ? 'text-green-500' : 'text-red-500'
                        }`} data-testid={`text-transaction-amount-${transaction.id}`}>
                          {amount > 0 ? '+' : ''}{amount > 0 ? '$' : '-$'}
                          {Math.abs(amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 text-center">
              <Button variant="outline" className="border-border/50" data-testid="button-view-all-transactions">
                {t("wallet.viewAll")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
