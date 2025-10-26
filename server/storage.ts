// From javascript_database blueprint - adapted for Tiro platform
import { 
  users, 
  products, 
  reviews, 
  promotions, 
  transactions,
  chats,
  messages,
  type User, 
  type InsertUser,
  type Product,
  type InsertProduct,
  type Review,
  type InsertReview,
  type Promotion,
  type InsertPromotion,
  type Transaction,
  type InsertTransaction,
  type Chat,
  type InsertChat,
  type Message,
  type InsertMessage,
  type ProductWithSeller,
  type ReviewWithBuyer,
  type ChatWithDetails,
  type MessageWithSender
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Products
  getAllProducts(): Promise<ProductWithSeller[]>;
  getProduct(id: string): Promise<ProductWithSeller | undefined>;
  getProductsBySeller(sellerId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Reviews
  getReviewsByProduct(productId: string): Promise<ReviewWithBuyer[]>;
  getReviewsBySeller(sellerId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Promotions
  getActivePromotions(): Promise<Promotion[]>;
  getPromotionsByProduct(productId: string): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  purchasePromotion(userId: string, promotion: InsertPromotion): Promise<{ success: boolean; promotion?: Promotion; error?: string }>;

  // Transactions
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, status: string): Promise<Transaction | undefined>;
  
  // Product Purchase
  purchaseProduct(buyerId: string, productId: string): Promise<{ success: boolean; transaction?: Transaction; error?: string }>;
  
  // Chats
  getChat(id: string): Promise<ChatWithDetails | undefined>;
  getChatsByUser(userId: string): Promise<ChatWithDetails[]>;
  getChatByTransaction(transactionId: string): Promise<Chat | undefined>;
  createChat(chat: InsertChat): Promise<Chat>;
  closeChat(chatId: string, closedBy: string, status: 'closed_seller' | 'closed_buyer'): Promise<Chat | undefined>;
  resolveChat(chatId: string, status: 'resolved_seller' | 'resolved_buyer'): Promise<Chat | undefined>;
  checkExpiredChats(): Promise<void>;
  
  // Messages
  getMessagesByChat(chatId: string): Promise<MessageWithSender[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Support login with username or email
    const [user] = await db.select().from(users).where(
      or(
        eq(users.username, username),
        eq(users.email, username)
      )
    );
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Products
  async getAllProducts(): Promise<ProductWithSeller[]> {
    const results = await db
      .select()
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .orderBy(desc(products.createdAt));
    
    return results.map(row => ({
      ...row.products,
      seller: row.users!
    }));
  }

  async getProduct(id: string): Promise<ProductWithSeller | undefined> {
    const [result] = await db
      .select()
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(eq(products.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.products,
      seller: result.users!
    };
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.sellerId, sellerId))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Reviews
  async getReviewsByProduct(productId: string): Promise<ReviewWithBuyer[]> {
    const results = await db
      .select()
      .from(reviews)
      .leftJoin(users, eq(reviews.buyerId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
    
    return results.map(row => ({
      ...row.reviews,
      buyer: row.users!
    }));
  }

  async getReviewsBySeller(sellerId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.sellerId, sellerId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    
    // Update seller rating
    const sellerReviews = await this.getReviewsBySeller(review.sellerId);
    const avgRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
    
    await this.updateUser(review.sellerId, {
      rating: avgRating.toFixed(2),
      totalReviews: sellerReviews.length
    });
    
    return newReview;
  }

  // Promotions
  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    return await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.isActive, true),
          sql`${promotions.endDate} > ${now}`
        )
      )
      .orderBy(desc(promotions.startDate));
  }

  async getPromotionsByProduct(productId: string): Promise<Promotion[]> {
    return await db
      .select()
      .from(promotions)
      .where(eq(promotions.productId, productId))
      .orderBy(desc(promotions.startDate));
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const [newPromotion] = await db
      .insert(promotions)
      .values(promotion)
      .returning();
    return newPromotion;
  }

  async purchasePromotion(userId: string, promotion: InsertPromotion): Promise<{ success: boolean; promotion?: Promotion; error?: string }> {
    try {
      // Get user
      const user = await this.getUser(userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      const promotionPrice = parseFloat(promotion.price);
      const userBalance = parseFloat(user.balance);

      // Check if user has sufficient balance
      if (userBalance < promotionPrice) {
        return { success: false, error: "Insufficient balance" };
      }

      // All operations in try block to ensure atomicity
      // Deduct from user balance
      await this.updateUser(userId, {
        balance: (userBalance - promotionPrice).toFixed(2)
      });

      // Create promotion with isActive = true (default)
      const newPromotion = await this.createPromotion(promotion);

      // Create transaction record
      await this.createTransaction({
        userId,
        type: 'promotion',
        amount: promotion.price,
        status: 'completed',
        description: `Promotion: ${promotion.tier} tier for ${promotion.endDate.toLocaleDateString()}`
      });

      return { success: true, promotion: newPromotion };
    } catch (error: any) {
      // If anything fails, the error will be caught and returned
      return { success: false, error: error.message || "Failed to create promotion" };
    }
  }

  // Transactions
  async getAllTransactions(): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updateTransaction(id: string, status: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ status: status as any })
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async purchaseProduct(buyerId: string, productId: string): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    // Get buyer
    const buyer = await this.getUser(buyerId);
    if (!buyer) {
      return { success: false, error: "Buyer not found" };
    }

    // Get product with seller
    const product = await this.getProduct(productId);
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const seller = product.seller;
    const productPrice = parseFloat(product.price);
    const buyerBalance = parseFloat(buyer.balance);

    // Check if buyer has sufficient balance
    if (buyerBalance < productPrice) {
      return { success: false, error: "Insufficient balance" };
    }

    // Check if buyer is not trying to buy their own product
    if (buyerId === seller.id) {
      return { success: false, error: "Cannot purchase your own product" };
    }

    // Deduct from buyer balance (payment held in escrow until chat closes)
    await this.updateUser(buyerId, {
      balance: (buyerBalance - productPrice).toFixed(2)
    });

    // Increment product sales count
    await this.updateProduct(productId, {
      sales: product.sales + 1
    });

    // Create buyer transaction (pending until chat closes)
    const buyerTransaction = await this.createTransaction({
      userId: buyerId,
      type: 'purchase',
      amount: product.price,
      status: 'pending',
      description: `Purchased "${product.title}"`
    });

    // Create chat with 72-hour expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);
    
    await this.createChat({
      productId,
      buyerId,
      sellerId: seller.id,
      transactionId: buyerTransaction.id,
      status: 'active',
      expiresAt,
      closedBy: null
    });

    return { success: true, transaction: buyerTransaction };
  }

  // Chats
  async getChat(id: string): Promise<ChatWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(chats)
      .leftJoin(products, eq(chats.productId, products.id))
      .leftJoin(users, eq(chats.buyerId, users.id))
      .where(eq(chats.id, id));
    
    if (!result) return undefined;

    // Get seller separately
    const [seller] = await db
      .select()
      .from(users)
      .where(eq(users.id, result.chats.sellerId));

    return {
      ...result.chats,
      product: result.products!,
      buyer: result.users!,
      seller: seller!,
    };
  }

  async getChatsByUser(userId: string): Promise<ChatWithDetails[]> {
    const results = await db
      .select()
      .from(chats)
      .leftJoin(products, eq(chats.productId, products.id))
      .leftJoin(users, eq(chats.buyerId, users.id))
      .where(
        or(
          eq(chats.buyerId, userId),
          eq(chats.sellerId, userId)
        )
      )
      .orderBy(desc(chats.createdAt));

    return Promise.all(results.map(async (result) => {
      const [seller] = await db
        .select()
        .from(users)
        .where(eq(users.id, result.chats.sellerId));

      return {
        ...result.chats,
        product: result.products!,
        buyer: result.users!,
        seller: seller!,
      };
    }));
  }

  async getChatByTransaction(transactionId: string): Promise<Chat | undefined> {
    const [chat] = await db
      .select()
      .from(chats)
      .where(eq(chats.transactionId, transactionId));
    return chat || undefined;
  }

  async createChat(chat: InsertChat): Promise<Chat> {
    const [newChat] = await db
      .insert(chats)
      .values(chat)
      .returning();
    return newChat;
  }

  async closeChat(chatId: string, closedBy: string, status: 'closed_seller' | 'closed_buyer'): Promise<Chat | undefined> {
    // Get chat details first
    const chatDetails = await this.getChat(chatId);
    if (!chatDetails) return undefined;

    // Close the chat
    const [chat] = await db
      .update(chats)
      .set({ 
        status,
        closedAt: new Date(),
        closedBy
      })
      .where(eq(chats.id, chatId))
      .returning();

    if (!chat) return undefined;

    // Handle payment based on who closed the chat
    const transaction = chatDetails.transactionId 
      ? await db.select().from(transactions).where(eq(transactions.id, chatDetails.transactionId)).then(r => r[0])
      : undefined;

    if (transaction) {
      const productPrice = parseFloat(transaction.amount);

      if (status === 'closed_seller') {
        // Payment goes to seller
        const seller = await this.getUser(chatDetails.sellerId);
        if (seller) {
          const sellerBalance = parseFloat(seller.balance);
          const sellerEarnings = parseFloat(seller.totalEarnings);
          await this.updateUser(chatDetails.sellerId, {
            balance: (sellerBalance + productPrice).toFixed(2),
            totalEarnings: (sellerEarnings + productPrice).toFixed(2)
          });

          // Update transaction status
          await this.updateTransaction(transaction.id, 'completed');

          // Create seller transaction
          await this.createTransaction({
            userId: chatDetails.sellerId,
            type: 'sale',
            amount: transaction.amount,
            status: 'completed',
            description: `Sold "${chatDetails.product.title}"`
          });
        }
      } else if (status === 'closed_buyer') {
        // Refund to buyer
        const buyer = await this.getUser(chatDetails.buyerId);
        if (buyer) {
          const buyerBalance = parseFloat(buyer.balance);
          await this.updateUser(chatDetails.buyerId, {
            balance: (buyerBalance + productPrice).toFixed(2)
          });

          // Update transaction status
          await this.updateTransaction(transaction.id, 'failed');

          // Decrement product sales since this was a refund
          await this.updateProduct(chatDetails.productId, {
            sales: Math.max(0, chatDetails.product.sales - 1)
          });
        }
      }
    }

    return chat;
  }

  async resolveChat(chatId: string, status: 'resolved_seller' | 'resolved_buyer'): Promise<Chat | undefined> {
    // Get chat details first
    const chatDetails = await this.getChat(chatId);
    if (!chatDetails) return undefined;

    // Resolve the chat
    const [chat] = await db
      .update(chats)
      .set({ 
        status,
        closedAt: new Date(),
        closedBy: 'admin'
      })
      .where(eq(chats.id, chatId))
      .returning();

    if (!chat) return undefined;

    // Handle payment based on admin decision
    const transaction = chatDetails.transactionId 
      ? await db.select().from(transactions).where(eq(transactions.id, chatDetails.transactionId)).then(r => r[0])
      : undefined;

    if (transaction) {
      const productPrice = parseFloat(transaction.amount);

      if (status === 'resolved_seller') {
        // Payment goes to seller
        const seller = await this.getUser(chatDetails.sellerId);
        if (seller) {
          const sellerBalance = parseFloat(seller.balance);
          const sellerEarnings = parseFloat(seller.totalEarnings);
          await this.updateUser(chatDetails.sellerId, {
            balance: (sellerBalance + productPrice).toFixed(2),
            totalEarnings: (sellerEarnings + productPrice).toFixed(2)
          });

          // Update transaction status
          await this.updateTransaction(transaction.id, 'completed');

          // Create seller transaction
          await this.createTransaction({
            userId: chatDetails.sellerId,
            type: 'sale',
            amount: transaction.amount,
            status: 'completed',
            description: `Sold "${chatDetails.product.title}" (Admin resolved)`
          });
        }
      } else if (status === 'resolved_buyer') {
        // Refund to buyer
        const buyer = await this.getUser(chatDetails.buyerId);
        if (buyer) {
          const buyerBalance = parseFloat(buyer.balance);
          await this.updateUser(chatDetails.buyerId, {
            balance: (buyerBalance + productPrice).toFixed(2)
          });

          // Update transaction status
          await this.updateTransaction(transaction.id, 'failed');

          // Decrement product sales since this was a refund
          await this.updateProduct(chatDetails.productId, {
            sales: Math.max(0, chatDetails.product.sales - 1)
          });
        }
      }
    }

    return chat;
  }

  async checkExpiredChats(): Promise<void> {
    // Find chats that are active but expired
    const expiredChats = await db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.status, 'active'),
          sql`${chats.expiresAt} < NOW()`
        )
      );

    // Update them to under_review status
    for (const chat of expiredChats) {
      await db
        .update(chats)
        .set({ status: 'under_review' })
        .where(eq(chats.id, chat.id));
    }
  }

  // Messages
  async getMessagesByChat(chatId: string): Promise<MessageWithSender[]> {
    const results = await db
      .select()
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);

    return results.map(row => ({
      ...row.messages,
      sender: row.users!
    }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
