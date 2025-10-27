import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  decimal, 
  timestamp, 
  boolean,
  pgEnum
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const promotionTierEnum = pgEnum('promotion_tier', ['top_3', 'top_5', 'top_10']);
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdraw', 'sale', 'purchase', 'promotion']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed']);
export const chatStatusEnum = pgEnum('chat_status', ['active', 'closed_seller', 'closed_buyer', 'under_review', 'resolved_seller', 'resolved_buyer']);
export const messageSenderTypeEnum = pgEnum('message_sender_type', ['user', 'system']);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").default(''),
  phone: text("phone").default(''),
  bio: text("bio").default(''),
  avatarUrl: text("avatar_url").default(''),
  isVerified: boolean("is_verified").default(false).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default('0.00').notNull(),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default('0.00').notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0.00'),
  totalReviews: integer("total_reviews").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").default(''),
  isActive: boolean("is_active").default(true).notNull(),
  views: integer("views").default(0).notNull(),
  sales: integer("sales").default(0).notNull(),
  accountUsername: text("account_username").default(''),
  accountPassword: text("account_password").default(''),
  accountEmail: text("account_email").default(''),
  accountEmailPassword: text("account_email_password").default(''),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  buyerId: varchar("buyer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sellerId: varchar("seller_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(),
  comment: text("comment").default(''),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Promotions table
export const promotions = pgTable("promotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  tier: promotionTierEnum("tier").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Transactions/Wallet table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").default('pending').notNull(),
  description: text("description").default(''),
  accountNumber: varchar("account_number", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chats table
export const chats = pgTable("chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  buyerId: varchar("buyer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sellerId: varchar("seller_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  transactionId: varchar("transaction_id").references(() => transactions.id, { onDelete: 'set null' }),
  status: chatStatusEnum("status").default('active').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  closedAt: timestamp("closed_at"),
  closedBy: text("closed_by"),
  closeInitiatedBy: text("close_initiated_by"),
  paymentScheduledAt: timestamp("payment_scheduled_at"),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: varchar("chat_id").notNull().references(() => chats.id, { onDelete: 'cascade' }),
  senderId: varchar("sender_id").references(() => users.id, { onDelete: 'cascade' }),
  senderType: messageSenderTypeEnum("sender_type").default('user').notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  reviews: many(reviews),
  transactions: many(transactions),
  chatsAsBuyer: many(chats, { relationName: 'buyer' }),
  chatsAsSeller: many(chats, { relationName: 'seller' }),
  messages: many(messages),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  reviews: many(reviews),
  promotions: many(promotions),
  chats: many(chats),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  buyer: one(users, {
    fields: [reviews.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [reviews.sellerId],
    references: [users.id],
  }),
}));

export const promotionsRelations = relations(promotions, ({ one }) => ({
  product: one(products, {
    fields: [promotions.productId],
    references: [products.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  chats: many(chats),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  product: one(products, {
    fields: [chats.productId],
    references: [products.id],
  }),
  buyer: one(users, {
    fields: [chats.buyerId],
    references: [users.id],
    relationName: 'buyer',
  }),
  seller: one(users, {
    fields: [chats.sellerId],
    references: [users.id],
    relationName: 'seller',
  }),
  transaction: one(transactions, {
    fields: [chats.transactionId],
    references: [transactions.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  views: true,
  sales: true,
}).extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.string().refine((val) => parseFloat(val) > 0, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  accountUsername: z.string().optional(),
  accountPassword: z.string().optional(),
  accountEmail: z.string().optional(),
  accountEmailPassword: z.string().optional(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
}).extend({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  startDate: true,
  isActive: true,
}).extend({
  tier: z.enum(['top_3', 'top_5', 'top_10']),
  price: z.string(),
  endDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertChatSchema = createInsertSchema(chats).omit({
  id: true,
  createdAt: true,
  closedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
}).extend({
  message: z.string().min(1, "Message cannot be empty"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = typeof chats.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Extended types with relations
export type ProductWithSeller = Product & {
  seller: User;
  reviews?: Review[];
};

export type ReviewWithBuyer = Review & {
  buyer: User;
};

export type ChatWithDetails = Chat & {
  product: Product;
  buyer: User;
  seller: User;
  messages?: Message[];
};

export type MessageWithSender = Message & {
  sender: User;
};
