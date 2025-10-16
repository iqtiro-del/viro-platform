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
  Clock
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

export function WalletPage() {
  // Mock data - will be replaced with real data
  const walletData = {
    balance: 1250.50,
    totalEarnings: 4580.25,
    profitTrend: "up", // "up" or "down"
    profitPercentage: 15.3,
  };

  const transactions = [
    {
      id: "1",
      type: "sale",
      description: "Payment for Logo Design Service",
      amount: 150,
      status: "completed",
      date: "2024-01-15 14:30",
    },
    {
      id: "2",
      type: "withdraw",
      description: "Withdrawal to Zain Cash",
      amount: -200,
      status: "completed",
      date: "2024-01-14 10:20",
    },
    {
      id: "3",
      type: "deposit",
      description: "Deposit from Zain Cash",
      amount: 500,
      status: "completed",
      date: "2024-01-12 16:45",
    },
    {
      id: "4",
      type: "promotion",
      description: "Product Promotion - Top 3",
      amount: -5,
      status: "completed",
      date: "2024-01-10 09:15",
    },
    {
      id: "5",
      type: "sale",
      description: "Payment for Web Development",
      amount: 300,
      status: "pending",
      date: "2024-01-09 11:00",
    },
  ];

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
    const variants: Record<string, { variant: "default" | "secondary" | "outline", className: string }> = {
      completed: { variant: "default", className: "bg-green-500/20 text-green-500 border-green-500/30" },
      pending: { variant: "secondary", className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
      failed: { variant: "outline", className: "bg-red-500/20 text-red-500 border-red-500/30" },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Wallet</h1>
          <p className="text-muted-foreground">Manage your balance and transactions</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Balance */}
          <Card className="glass-morphism-strong border-primary/30 neon-glow-primary col-span-1 md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-muted-foreground">Current Balance</CardDescription>
                  <CardTitle className="text-5xl font-bold mt-2 neon-text-glow-cyan">
                    ${walletData.balance.toFixed(2)}
                  </CardTitle>
                </div>
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center neon-glow-primary">
                  <WalletIcon className="w-8 h-8 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex-1 neon-glow-secondary" data-testid="button-deposit">
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      Deposit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-morphism-strong border-border/50">
                    <DialogHeader>
                      <DialogTitle>Deposit Funds</DialogTitle>
                      <DialogDescription>
                        Add money to your Tiro wallet
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="deposit-amount">Amount (USD)</Label>
                        <Input 
                          id="deposit-amount" 
                          type="number" 
                          placeholder="0.00" 
                          className="glass-morphism border-border/50 mt-2"
                          data-testid="input-deposit-amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment-method">Payment Method</Label>
                        <Select>
                          <SelectTrigger className="glass-morphism border-border/50 mt-2" data-testid="select-payment-method">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent className="glass-morphism-strong border-border/50">
                            <SelectItem value="zaincash">Zain Cash</SelectItem>
                            <SelectItem value="rafidain">Al-Rafidain QiServices</SelectItem>
                            <SelectItem value="fib">FIB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full neon-glow-primary" data-testid="button-confirm-deposit">
                        Confirm Deposit
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 border-border/50" data-testid="button-withdraw">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-morphism-strong border-border/50">
                    <DialogHeader>
                      <DialogTitle>Withdraw Funds</DialogTitle>
                      <DialogDescription>
                        Withdraw money from your Tiro wallet
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                        <Input 
                          id="withdraw-amount" 
                          type="number" 
                          placeholder="0.00"
                          className="glass-morphism border-border/50 mt-2"
                          data-testid="input-withdraw-amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="withdraw-method">Withdraw To</Label>
                        <Select>
                          <SelectTrigger className="glass-morphism border-border/50 mt-2" data-testid="select-withdraw-method">
                            <SelectValue placeholder="Select withdrawal method" />
                          </SelectTrigger>
                          <SelectContent className="glass-morphism-strong border-border/50">
                            <SelectItem value="zaincash">Zain Cash</SelectItem>
                            <SelectItem value="rafidain">Al-Rafidain QiServices</SelectItem>
                            <SelectItem value="fib">FIB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full neon-glow-primary" data-testid="button-confirm-withdraw">
                        Confirm Withdrawal
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
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle className="text-3xl font-bold">
                ${walletData.totalEarnings.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {walletData.profitTrend === "up" ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-green-500 font-medium">+{walletData.profitPercentage}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-5 h-5 text-red-500" />
                    <span className="text-red-500 font-medium">-{walletData.profitPercentage}%</span>
                  </>
                )}
                <span className="text-sm text-muted-foreground">this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="glass-morphism border-border/30">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent wallet activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg glass-morphism border border-border/30 hover-elevate transition-all"
                  data-testid={`transaction-${transaction.id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.amount > 0 ? 'bg-green-500/20 neon-glow-success' : 'bg-red-500/20'
                    }`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(transaction.status)}
                    <p className={`text-lg font-bold ${
                      transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount > 0 ? '$' : '-$'}
                      {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button variant="outline" className="border-border/50" data-testid="button-view-all-transactions">
                View All Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
