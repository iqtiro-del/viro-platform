// From javascript_database blueprint - adapted for Tiro platform
import { 
  users, 
  products, 
  reviews, 
  promotions, 
  transactions,
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
  type ProductWithSeller,
  type ReviewWithBuyer
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

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

  // Transactions
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, status: string): Promise<Transaction | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
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
}

export const storage = new DatabaseStorage();
