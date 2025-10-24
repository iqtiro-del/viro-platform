# Tiro - Digital Services Marketplace

## Overview

Tiro is a digital services marketplace platform designed specifically for the Iraqi market. It connects service buyers with verified sellers, enabling transactions for digital products and services. The platform features a modern neon/cyberpunk aesthetic inspired by contemporary service marketplaces like Fiverr and Upwork, while maintaining a distinct Iraqi digital marketplace identity.

The application is built as a full-stack web platform with a React-based frontend and Express backend, using PostgreSQL for data persistence.

## Recent Changes

**Services Page - Mobile Responsive Layout (Latest Update)**
- Updated Services marketplace page with responsive grid layout for optimal viewing on all devices
- **Very Small Screens** (<400px):
  - 1 column layout for maximum readability on smallest devices
  - Full-width service cards prevent cramping
- **Mobile Screens** (400px-767px):
  - 2 columns layout for efficient space usage
  - Service cards display side-by-side
  - Proper spacing maintained between cards
- **Tablet/Desktop** (≥768px):
  - 2 columns on tablets, 3 columns on large desktops (≥1024px)
  - Desktop filter sidebar visible on left
  - Original desktop functionality preserved
- **Public Access**:
  - Services page is now publicly accessible without authentication
  - Allows users to browse marketplace before signing up
  - Buy buttons disabled for non-authenticated users (shows "Login to Buy")
  - Makes platform more discoverable and user-friendly
- Successfully tested on multiple viewports (320px, 375px, 400px, 425px, 768px, 1280px)
- Maintains all existing neon/cyberpunk colors, fonts, and style consistency

**My Products Page - Mobile Layout Optimization**
- Redesigned My Products page with responsive 2-column grid layout for mobile devices
- **Mobile Layout** (<768px):
  - Grid displays 2 service cards per row instead of 1 full-width card
  - Compact vertical card structure with reduced padding (p-3)
  - Smaller typography optimized for mobile (text-sm title, text-xs stats)
  - Action buttons properly sized for touch targets (≥36px) using Button size="sm"
  - Icon + title at top, category badge, price with status, view/sales stats, and action buttons at bottom
- **Desktop Layout** (≥768px):
  - Maintains original single-column layout with horizontal card structure
  - Full padding (p-6) and original font sizes preserved
  - All desktop functionality unchanged
- **Accessibility**:
  - Removed manual height overrides on buttons to ensure proper touch target sizes
  - Touch targets meet mobile accessibility requirements (≥36-44px)
  - All interactive elements properly sized for mobile interaction
- **Testing**:
  - Added unique test IDs with "-mobile" suffix for mobile layout elements
  - Desktop elements retain original test IDs without suffix
  - Eliminates DOM duplicate test ID issues between mobile and desktop layouts
- Successfully tested on mobile (375x667) and desktop (1280x720) viewports
- Maintains all existing neon/cyberpunk colors, fonts, and style consistency

**Responsive Navigation System Redesign**
- Redesigned navigation with horizontal navbar for desktop and slide-in drawer for mobile
- **Desktop Navigation** (≥768px):
  - Horizontal navigation bar displaying all page links centered in header
  - Logo "تيرو" on the left side
  - Navigation items: Dashboard, Services, Wallet, My Products, Promote
  - Profile avatar dropdown on the right with Profile and Logout options
  - Theme toggle (sun/moon icon) for switching between light/dark mode
  - Active page highlighted with neon glow effect and primary background color
- **Mobile Navigation** (<768px):
  - Hamburger menu button in top right of header
  - Slide-in drawer (Sheet component) from right side (RTL support)
  - User profile section at top with avatar, name, and verification badge
  - All navigation links in vertical layout
  - Settings section with theme toggle
  - Logout button at bottom of drawer
- **Components**:
  - `AppNavbar` component for desktop horizontal navigation
  - `MobileMenu` component for mobile slide-in drawer
  - Replaced previous SidebarProvider/AppSidebar system
- **Bug Fixes**:
  - Fixed logout redirect to go to dashboard (/) instead of /login
- Maintained all existing neon/cyberpunk colors and theme consistency
- Full RTL support with right-side menu slide-in
- Successfully tested end-to-end on desktop (1280x720) and mobile (375x667) viewports

**Fee System for Deposits and Withdrawals**
- Implemented 10% fee on all deposits and withdrawals with clear UI breakdown
- **Deposit logic:** User deposits $100 → 10% fee deducted ($10) → receives $90 in wallet
- **Withdrawal logic:** User withdraws $50 → 10% fee deducted ($5) → receives $45, balance reduced by $50
- Fee breakdown displayed dynamically when user enters amount:
  - Shows original amount, processing fee (10%), and final amount to receive
  - Uses glassmorphism card design with clear visual hierarchy
  - Fee amount shown in yellow with minus sign
  - Final amount shown in bold primary color
- Backend returns feeDetails object with complete breakdown
- Transaction records store original amounts (before fee adjustment)
- Full English and Arabic translation support for all fee-related UI
- Successfully tested end-to-end: deposits, withdrawals, and transaction history

**Instagram and TikTok Account Sales**
- Added Instagram and TikTok as new service categories
- Extended product schema with account credential fields (username, password, email, email password)
- Conditional form fields appear only when Instagram/TikTok category is selected
- Credential delivery system shows account details to buyer after purchase
- Credentials displayed in dedicated dialog with glass-morphism design
- Full English and Arabic translation support for account-related UI
- **Security Note**: Credentials currently stored in plain text - encryption required before production

**Public Pages and Authentication**
- **Dashboard (/)**: Main public homepage accessible without authentication
  - Non-authenticated users see Login and Sign Up buttons in the hero section
  - Authenticated users see a search bar in the hero section instead
  - Login and Sign Up dialogs integrated directly into Dashboard page
  - Modal dialogs use glass-morphism design matching the platform aesthetic
  - Forms include proper validation, loading states, and toast notifications
  - Users can seamlessly switch between Login and Sign Up dialogs
- **Services (/services)**: Public marketplace page accessible without authentication
  - Allows users to browse available services before signing up
  - Buy buttons disabled for non-authenticated users (shows "Login to Buy")
  - Full search and filtering capabilities available to all visitors
- **Protected Routes**: Wallet, My Products, Promote, and Profile pages require authentication
- Separate /login and /register routes maintained for backward compatibility

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