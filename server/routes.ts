import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProductSchema,
  insertReviewSchema,
  insertPromotionSchema,
  insertTransactionSchema,
  insertChatSchema,
  insertMessageSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { encryptCredentials, decryptCredentials } from "./crypto";
import multer from "multer";

// Configure multer for memory storage (no file saved to disk)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max file size
});

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

  // Verify Account - sends ID photo to Telegram bot
  app.post("/api/verify-account", upload.single('idPhoto'), async (req, res) => {
    try {
      const { fullName, username, userId } = req.body;
      const file = req.file;

      if (!fullName || !username || !userId || !file) {
        return res.status(400).json({ error: "Full name, username, user ID, and ID photo are required" });
      }

      // Verify that the user exists and the username matches
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized: User not found" });
      }

      if (user.username !== username) {
        return res.status(401).json({ error: "Unauthorized: Username mismatch" });
      }

      const botToken = process.env.BOT_TOKEN;
      const chatId = process.env.CHAT_ID;

      if (!botToken || !chatId) {
        return res.status(500).json({ error: "Telegram bot configuration is missing" });
      }

      // Create FormData for Telegram API
      const formData = new FormData();
      
      // Convert buffer to Blob for FormData
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('photo', blob, file.originalname);
      formData.append('chat_id', chatId);
      
      // Create caption with user details and current timestamp
      const timestamp = new Date().toLocaleString('en-US', { 
        timeZone: 'Asia/Baghdad',
        dateStyle: 'full',
        timeStyle: 'long'
      });
      
      const caption = `🔔 New Verification Request\n\n` +
                     `Full Name: ${fullName}\n` +
                     `Username: ${username}\n` +
                     `Sent at: ${timestamp}`;
      
      formData.append('caption', caption);

      // Send to Telegram
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      const response = await fetch(telegramUrl, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Telegram API error:', result);
        return res.status(500).json({ error: "Failed to send verification request to Telegram" });
      }

      res.json({ 
        success: true, 
        message: "Your verification request has been sent successfully and will be reviewed soon." 
      });
    } catch (error: any) {
      console.error('Verification error:', error);
      res.status(500).json({ error: error.message || "Failed to send verification request" });
    }
  });

  // Seller profile route - gets seller info and their products
  app.get("/api/sellers/:id", async (req, res) => {
    try {
      const seller = await storage.getUser(req.params.id);
      if (!seller) {
        return res.status(404).json({ error: "Seller not found" });
      }
      
      const products = await storage.getProductsBySeller(req.params.id);
      
      const { password, ...sellerWithoutPassword } = seller;
      res.json({
        seller: sellerWithoutPassword,
        products
      });
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
      
      // Encrypt credentials before storing
      const encryptedCredentials = encryptCredentials({
        accountUsername: data.accountUsername,
        accountPassword: data.accountPassword,
        accountEmail: data.accountEmail,
        accountEmailPassword: data.accountEmailPassword,
      });
      
      // Handle empty oldPrice - convert to null/undefined for database
      const productData = {
        ...data,
        oldPrice: data.oldPrice && data.oldPrice.trim() !== "" ? data.oldPrice : undefined,
        ...encryptedCredentials,
      };
      
      const product = await storage.createProduct(productData);
      
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const data = req.body;
      
      // Encrypt credentials if they are being updated
      // encryptCredentials now only returns fields that are provided (not empty/undefined)
      const encryptedCredentials = encryptCredentials({
        accountUsername: data.accountUsername,
        accountPassword: data.accountPassword,
        accountEmail: data.accountEmail,
        accountEmailPassword: data.accountEmailPassword,
      });
      
      // Handle empty oldPrice - convert to undefined for database
      if (data.oldPrice !== undefined && data.oldPrice.trim() === "") {
        data.oldPrice = undefined;
      }
      
      // Merge encrypted credentials into data (only provided fields)
      Object.assign(data, encryptedCredentials);
      
      const product = await storage.updateProduct(req.params.id, data);
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

      // Apply 10% fee on deposit (user receives 90% of deposited amount)
      const feeRate = 0.10;
      const feeAmount = depositAmount * feeRate;
      const amountAfterFee = depositAmount - feeAmount;
      
      const newBalance = parseFloat(user.balance) + amountAfterFee;
      
      await storage.updateUser(userId, { balance: newBalance.toFixed(2) });
      
      const transaction = await storage.createTransaction({
        userId,
        type: 'deposit',
        amount: depositAmount.toFixed(2),
        description: `Deposited via ${paymentMethod}`
      });
      
      await storage.updateTransaction(transaction.id, 'completed');
      
      res.json({ 
        success: true, 
        newBalance: newBalance.toFixed(2), 
        transaction,
        feeDetails: {
          depositAmount: depositAmount.toFixed(2),
          feeAmount: feeAmount.toFixed(2),
          amountCredited: amountAfterFee.toFixed(2)
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/wallet/withdraw", async (req, res) => {
    try {
      const { userId, amount, withdrawMethod, account_number } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Validate account number
      if (!account_number || account_number.trim() === "") {
        return res.status(400).json({ error: "Bank account number is required" });
      }

      const accountNumberStr = account_number.trim();
      const digitsOnly = /^\d+$/;
      
      if (!digitsOnly.test(accountNumberStr)) {
        return res.status(400).json({ error: "Account number must contain only digits" });
      }
      
      if (accountNumberStr.length < 6 || accountNumberStr.length > 34) {
        return res.status(400).json({ error: "Account number must be between 6 and 34 digits" });
      }

      const withdrawAmount = parseFloat(amount);
      if (withdrawAmount <= 0) {
        return res.status(400).json({ error: "Amount must be greater than 0" });
      }

      // Apply 10% fee on withdrawal (user receives 90% of requested amount)
      const feeRate = 0.10;
      const feeAmount = withdrawAmount * feeRate;
      const amountToReceive = withdrawAmount - feeAmount;
      
      const currentBalance = parseFloat(user.balance);
      if (withdrawAmount > currentBalance) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      const newBalance = currentBalance - withdrawAmount;
      
      await storage.updateUser(userId, { balance: newBalance.toFixed(2) });
      
      // Mask account number (keep only last 4 digits visible)
      const last4Digits = accountNumberStr.slice(-4);
      const maskedAccountNumber = '*'.repeat(accountNumberStr.length - 4) + last4Digits;
      
      const transaction = await storage.createTransaction({
        userId,
        type: 'withdraw',
        amount: withdrawAmount.toFixed(2),
        description: `Withdrawn to ${withdrawMethod}`,
        accountNumber: maskedAccountNumber
      });
      
      await storage.updateTransaction(transaction.id, 'completed');
      
      res.json({ 
        success: true, 
        newBalance: newBalance.toFixed(2), 
        transaction,
        feeDetails: {
          requestedAmount: withdrawAmount.toFixed(2),
          feeAmount: feeAmount.toFixed(2),
          amountToReceive: amountToReceive.toFixed(2)
        }
      });
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

      // Get product details and decrypt credentials for the buyer
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Decrypt credentials to deliver to buyer
      const decryptedCredentials = decryptCredentials({
        accountUsername: product.accountUsername || undefined,
        accountPassword: product.accountPassword || undefined,
        accountEmail: product.accountEmail || undefined,
        accountEmailPassword: product.accountEmailPassword || undefined,
      });

      // Prepare product details for buyer (excluding seller's sensitive info)
      const productDetails = {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl,
        credentials: decryptedCredentials,
      };

      // Get the chat that was created during the purchase
      const chat = result.transaction ? await storage.getChatByTransaction(result.transaction.id) : undefined;

      res.json({ 
        success: true, 
        transaction: result.transaction,
        buyer: buyerWithoutPassword,
        product: productDetails,
        chat,
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

  // Chat routes
  app.get("/api/chats/active/count", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const chats = await storage.getChatsByUser(userId);
      const activeChats = chats.filter(chat => chat.status === 'active');
      res.json({ count: activeChats.length });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/chats", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const chats = await storage.getChatsByUser(userId);
      res.json(chats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/chats/:id", async (req, res) => {
    try {
      const chat = await storage.getChat(req.params.id);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      res.json(chat);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/chats/:id/close", async (req, res) => {
    try {
      const { userId, role } = req.body;
      const chatId = req.params.id;

      if (!userId || !role) {
        return res.status(400).json({ error: "User ID and role are required" });
      }

      // Determine status based on role
      const status = role === 'seller' ? 'closed_seller' : 'closed_buyer';
      
      const chat = await storage.closeChat(chatId, userId, status);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      res.json({ success: true, chat });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/chats/:id/resolve", async (req, res) => {
    try {
      const { resolution } = req.body;
      const chatId = req.params.id;

      if (!resolution || (resolution !== 'seller' && resolution !== 'buyer')) {
        return res.status(400).json({ error: "Valid resolution (seller or buyer) is required" });
      }

      const status = resolution === 'seller' ? 'resolved_seller' : 'resolved_buyer';
      
      const chat = await storage.resolveChat(chatId, status);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      res.json({ success: true, chat });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Message routes
  app.get("/api/chats/:chatId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByChat(req.params.chatId);
      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/chats/:chatId/messages", async (req, res) => {
    try {
      const data = insertMessageSchema.parse({
        ...req.body,
        chatId: req.params.chatId
      });
      
      const message = await storage.createMessage(data);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Periodic check for expired chats (could be called by a cron job)
  app.post("/api/chats/check-expired", async (req, res) => {
    try {
      await storage.checkExpiredChats();
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Process scheduled payments (called periodically)
  app.post("/api/chats/process-payments", async (req, res) => {
    try {
      await storage.processScheduledPayments();
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
