import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProductSchema,
  insertReviewSchema,
  insertPromotionSchema,
  insertTransactionSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if username exists
      const existing = await storage.getUserByUsername(data.username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const user = await storage.createUser({
        ...data,
        password: hashedPassword
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const allProducts = await storage.getAllProducts();
      const allUsers = await storage.getAllUsers();
      const allTransactions = await storage.getAllTransactions();
      
      const activeServices = allProducts.filter(p => p.isActive).length;
      const verifiedSellers = allUsers.filter(u => u.isVerified).length;
      const totalSales = allTransactions
        .filter(t => t.type === 'sale' && t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      res.json({
        activeServices,
        verifiedSellers,
        totalSales: totalSales.toFixed(2)
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/:id/products", async (req, res) => {
    try {
      const products = await storage.getProductsBySeller(req.params.id);
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Review routes
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProduct(req.params.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const data = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(data);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Promotion routes
  app.get("/api/promotions/active", async (req, res) => {
    try {
      const promotions = await storage.getActivePromotions();
      res.json(promotions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/products/:id/promotions", async (req, res) => {
    try {
      const promotions = await storage.getPromotionsByProduct(req.params.id);
      res.json(promotions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/promotions", async (req, res) => {
    try {
      const { userId, ...promotionData } = req.body;
      const data = insertPromotionSchema.parse(promotionData);
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const result = await storage.purchasePromotion(userId, data);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      // Get updated user info
      const updatedUser = await storage.getUser(userId);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found after promotion creation" });
      }

      const { password, ...userWithoutPassword } = updatedUser;

      res.json({ 
        success: true, 
        promotion: result.promotion,
        user: userWithoutPassword
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Transaction routes
  app.get("/api/users/:id/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByUser(req.params.id);
      res.json(transactions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const data = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(data);
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/wallet/deposit", async (req, res) => {
    try {
      const { userId, amount, paymentMethod } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const depositAmount = parseFloat(amount);
      if (depositAmount <= 0) {
        return res.status(400).json({ error: "Amount must be greater than 0" });
      }

      const newBalance = parseFloat(user.balance) + depositAmount;
      
      await storage.updateUser(userId, { balance: newBalance.toFixed(2) });
      
      const transaction = await storage.createTransaction({
        userId,
        type: 'deposit',
        amount: depositAmount.toFixed(2),
        description: `Deposited via ${paymentMethod}`
      });
      
      await storage.updateTransaction(transaction.id, 'completed');
      
      res.json({ success: true, newBalance: newBalance.toFixed(2), transaction });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/wallet/withdraw", async (req, res) => {
    try {
      const { userId, amount, withdrawMethod } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const withdrawAmount = parseFloat(amount);
      if (withdrawAmount <= 0) {
        return res.status(400).json({ error: "Amount must be greater than 0" });
      }

      const currentBalance = parseFloat(user.balance);
      if (withdrawAmount > currentBalance) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      const newBalance = currentBalance - withdrawAmount;
      
      await storage.updateUser(userId, { balance: newBalance.toFixed(2) });
      
      const transaction = await storage.createTransaction({
        userId,
        type: 'withdraw',
        amount: withdrawAmount.toFixed(2),
        description: `Withdrawn to ${withdrawMethod}`
      });
      
      await storage.updateTransaction(transaction.id, 'completed');
      
      res.json({ success: true, newBalance: newBalance.toFixed(2), transaction });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/products/:id/purchase", async (req, res) => {
    try {
      const { buyerId } = req.body;
      const productId = req.params.id;

      if (!buyerId) {
        return res.status(400).json({ error: "Buyer ID is required" });
      }

      const result = await storage.purchaseProduct(buyerId, productId);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      // Get updated buyer info
      const updatedBuyer = await storage.getUser(buyerId);
      const { password, ...buyerWithoutPassword } = updatedBuyer!;

      res.json({ 
        success: true, 
        transaction: result.transaction,
        buyer: buyerWithoutPassword
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const transaction = await storage.updateTransaction(req.params.id, status);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
