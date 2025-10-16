# Tiro - Digital Services Marketplace

## Overview

Tiro is a digital services marketplace platform designed specifically for the Iraqi market. It connects service buyers with verified sellers, enabling transactions for digital products and services. The platform features a modern neon/cyberpunk aesthetic inspired by contemporary service marketplaces like Fiverr and Upwork, while maintaining a distinct Iraqi digital marketplace identity.

The application is built as a full-stack web platform with a React-based frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type safety and developer experience
- Vite as the build tool and development server for fast hot module replacement
- Single Page Application (SPA) architecture using Wouter for client-side routing

**UI Component Strategy**
- shadcn/ui component library (New York style variant) for consistent, accessible UI components
- Radix UI primitives as the foundation for interactive components
- Tailwind CSS for utility-first styling with custom theme configuration
- Custom neon/cyberpunk design system with dark mode as default theme

**State Management**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- React Context API for authentication state and theme management
- Local component state using React hooks for UI-specific state

**Design System**
- Color palette featuring neon accents (electric purple, cyan, neon pink) over dark navy-black backgrounds
- Typography using Inter for general text, Orbitron/Exo 2 for accent headings, and Tajawal for Arabic support
- Custom CSS variables for theming with support for light/dark modes
- Glassmorphism and neon glow effects for visual hierarchy

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- RESTful API design pattern for all data operations
- Session-based approach prepared (connect-pg-simple integration)
- Custom middleware for request logging and error handling

**Authentication & Security**
- bcrypt.js for password hashing (10 rounds)
- User credentials stored securely with hashed passwords
- Client-side auth state management via localStorage and React Context
- Session validation planned but currently using stateless authentication

**Database Layer**
- Drizzle ORM for type-safe database queries and migrations
- Neon serverless PostgreSQL as the database provider
- WebSocket constructor override for serverless compatibility
- Schema-first approach with centralized schema definitions

### Data Storage Solutions

**Database Schema**
- **Users Table**: Stores user accounts, profiles, verification status, wallet balance, earnings, and ratings
- **Products Table**: Digital service listings with title, description, pricing, categories, images, and sales metrics
- **Reviews Table**: Buyer feedback with ratings and comments linked to products and sellers
- **Promotions Table**: Featured placement system with tiered visibility (top_3, top_5, top_10)
- **Transactions Table**: Financial record-keeping for deposits, withdrawals, sales, purchases, and promotions

**Data Relationships**
- One-to-many: Users to Products (sellers can have multiple products)
- One-to-many: Products to Reviews (products can have multiple reviews)
- One-to-many: Products to Promotions (products can have multiple promotion periods)
- One-to-many: Users to Transactions (users have transaction history)
- Foreign key constraints with cascade deletes for data integrity

**Key Design Decisions**
- Decimal precision for monetary values (10,2) to prevent floating-point errors
- Separate balance and totalEarnings fields for clear financial tracking
- Boolean flags for active status (isActive, isVerified) for soft states
- UUID primary keys for scalability and distributed systems compatibility
- Timestamp tracking (createdAt, startDate, endDate) for temporal queries

### External Dependencies

**Core Libraries**
- `@neondatabase/serverless`: PostgreSQL database connectivity optimized for serverless environments
- `drizzle-orm`: Type-safe ORM with schema management and query builder
- `bcryptjs`: Password hashing and verification
- `express`: Web application framework
- `react` & `react-dom`: UI library
- `@tanstack/react-query`: Async state management and caching
- `wouter`: Lightweight client-side routing

**UI Component Libraries**
- `@radix-ui/*`: Comprehensive set of unstyled, accessible component primitives (20+ component packages)
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority`: Type-safe component variant management
- `lucide-react`: Icon library

**Form & Validation**
- `react-hook-form`: Form state management and validation
- `@hookform/resolvers`: Integration between react-hook-form and validation libraries
- `zod`: Schema validation (via drizzle-zod)
- `drizzle-zod`: Automatic Zod schema generation from Drizzle schemas

**Development Tools**
- `vite`: Frontend build tool and dev server
- `typescript`: Type system and compiler
- `tsx`: TypeScript execution for development
- `esbuild`: Production bundling for backend code
- Replit-specific plugins for development environment integration

**Build & Deployment Configuration**
- Development: TSX for running TypeScript directly with hot reload
- Production: Vite for frontend bundling, esbuild for backend bundling
- Database migrations via drizzle-kit push command
- Environment variable dependency for DATABASE_URL