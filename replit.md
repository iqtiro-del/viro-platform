# Tiro - Digital Services Marketplace

## Overview
Tiro is a digital services marketplace for the Iraqi market, connecting service buyers with verified sellers of digital products and services. Inspired by platforms like Fiverr and Upwork, it aims to establish a unique Iraqi digital marketplace identity with a modern neon/cyberpunk aesthetic. The platform is a full-stack web application with a React frontend, Express backend, and PostgreSQL database. Its vision is to capture a significant share of the Iraqi digital services market by offering a reliable and user-friendly platform.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is a React-based Single Page Application (SPA) using TypeScript and Vite, with Wouter for routing. UI components leverage `shadcn/ui` (New York style variant) and Radix UI primitives, styled with Tailwind CSS to create a custom neon/cyberpunk dark-mode design system. State management uses TanStack Query for server state, React Context for authentication and theme, and React hooks for local state. The design incorporates a neon color palette, specific typography (Inter, Orbitron/Exo 2, Tajawal for Arabic), glassmorphism, and neon glows. Mobile-first responsive design is implemented across all pages, ensuring a consistent user experience. Key features include smooth page transitions, enhanced dialogs and toast notifications with animations, and comprehensive mobile optimizations.

### Backend Architecture
The backend is built with Express.js, providing RESTful API routing and custom middleware for logging and error handling. Authentication currently uses bcrypt.js for password hashing, with plans for session-based authentication.

### Data Storage Solutions
The platform uses Neon serverless PostgreSQL with Drizzle ORM for type-safe queries. The database schema includes `Users`, `Products`, `Reviews`, `Promotions`, and `Transactions` tables, with defined relationships. Key design decisions include decimal precision for monetary values, separate fields for financial tracking, boolean flags for active statuses, UUID primary keys, and timestamp tracking. Product credentials are encrypted using AES-256-GCM before storage and decrypted only upon purchase.

### System Design Choices
- **UI/UX**: Responsive design with a mobile-first approach, full Arabic localization, and "cute avatar" system using DiceBear API. Public accessibility for browsing services.
- **Feature Specifications**:
    - **Fee System**: A 10% fee is applied to all deposits and withdrawals, with clear UI breakdown.
    - **Service Categories**: Support for diverse digital services, including social media account sales with secure credential delivery.
    - **Navigation**: Responsive navigation with a desktop navbar and mobile slide-in drawer, supporting RTL.
    - **Authentication**: Public and protected routes with integrated login/signup dialogs.
    - **Chat System**: Automatic buyer-seller chat on purchase with a 72-hour active window, permanent record-keeping for dispute resolution (never deleted), status-based lifecycle (active → closed/resolved), and escrow payment integration with a 10-hour delay for buyer closures. **Automatic Chat Expiration**: Background scheduler (`server/scheduler.ts`) runs every 5 minutes to automatically close expired chats. Active chats past their 72-hour `expiresAt` timestamp are automatically changed to 'under_review' status. Chats are never deleted from the database, ensuring complete transaction history for dispute resolution.
    - **Discount Pricing**: Supports optional `oldPrice` for displaying discounted services with visual cues (strikethrough, prominent new price).
    - **Withdrawal Validation**: Bank account number validation (digits-only, length 6-34) with masking for security.
    - **Deposit Screenshot Upload**: Users must upload a screenshot of their transfer receipt when making deposits. Screenshots are automatically sent to a configured Telegram bot for admin verification instead of being stored on the server. Implementation details:
      - **Frontend**: File upload field appears in deposit dialog when payment method is selected (accepts image/*)
      - **Backend**: Multer middleware with memory storage (no disk writes) handles file upload at `/api/wallet/deposit`
      - **Telegram Integration**: `server/telegram.ts` service sends screenshot to separate deposit bot using `DEPOSIT_BOT_TOKEN` (8576099373:AAHucNqZT8UmTf_xTgcxCRfgouRAKiFFwpw) and `DEPOSIT_CHAT_ID` (7881556499) environment variables
      - **Separate Bots**: Deposit screenshots use dedicated deposit bot; account verification uses original verification bot (`BOT_TOKEN` and `CHAT_ID`)
      - **Message Format**: Telegram message includes: uploaded screenshot, username, timestamp (Baghdad timezone), deposit amount, and payment method
      - **Validation**: Deposit request fails if screenshot is not uploaded or if Telegram send fails
      - **Storage**: Images are never stored on server - sent directly to Telegram from memory buffer
      - **Dependencies**: Uses `form-data` package for multipart uploads to Telegram API
      - **Status**: Fully functional and tested with real images (verified Nov 13, 2025)
    - **Seller Profile Page**: Dedicated public page displaying seller information and their active products.
    - **Dashboard**: Professional neon-styled stats cards with distinct color schemes and hover effects. Statistics are fully automatic and calculated from real database data:
      - **Verified Sellers**: Auto-counts users with `isVerified = true`
      - **Total Sales**: Auto-calculates sum of all completed sale transactions
      - **Active Services**: Auto-counts products with `isActive = true`
      - Real-time updates: Stats auto-refresh every 30 seconds and invalidate on relevant actions (purchases, product changes)
    - **Background**: Soft animated neon gradient background with subtle floating orbs, optimized for performance and accessibility (respects `prefers-reduced-motion`).
    - **Default Category Images**: Automatic assignment of representative stock images for each service category when sellers create new products. Covers 8 categories (Instagram, Design, Programming, Writing, Marketing, Music & Audio, TikTok, Video & Animation) with professional stock imagery. Auto-assignment only applies to new services, not edits, preserving existing custom images.
    - **Admin Dashboard**: Protected admin interface at `/admin` for platform management. Features include:
      - **Authentication**: Dedicated admin login with credentials (username: admin, password: admin123) and database `isAdmin` flag
      - **Real-time Statistics**: Auto-refreshing dashboard showing total users, active services, total sales, pending/completed orders, and pending verifications (refreshes every 30 seconds)
      - **Navigation**: Dropdown menu accessed via 3-dot icon (MoreVertical) for improved mobile UX and scalability
      - **User Management**: List all users, activate/deactivate accounts, manually verify sellers, view user balances and status
      - **Service Management**: View all platform services, delete any service, monitor service sales and status
      - **Verification Requests**: Approve or reject seller verification requests with database tracking in `verification_requests` table
      - **Transaction Management**: View all platform transactions with filtering by type (deposit, withdraw, sale, purchase, promotion)
      - **Transaction Review Workflow**: Deposits and withdrawals require admin approval with different balance handling:
        - **Deposit Flow**: User submits deposit → creates pending transaction (no balance change) → admin reviews → on approval: adds (amount - 10% fee) to balance → on rejection: no balance change
        - **Withdrawal Flow (NEW)**: User submits withdrawal → balance deducted IMMEDIATELY → creates pending transaction → admin reviews → on approval: no balance change (already deducted) → on rejection: amount REFUNDED back to user
        - **Safety Guards**: Withdrawal request validates sufficient balance before deducting; admin can safely reject to refund user
        - **UI Feedback**: Deposits show "under review" message; Withdrawals show "Amount deducted - will be refunded if rejected" message
        - **Cache Invalidation**: Admin approval/rejection invalidates all user queries to ensure wallet balances update immediately in UI
      - **Deposit Management**: Dedicated section showing pending/completed/rejected deposits with approve/reject controls. Approved deposits auto-update user balance (amount - 10% fee)
      - **Withdrawal Management**: Dedicated section showing pending/completed/rejected withdrawals with approve/reject controls. Includes balance validation to prevent overdrafts
      - **Banned Users Management**: Dedicated section for viewing and managing banned users. Features include:
        - Table displaying all banned users with username, full name, email, ban reason, and ban timestamp
        - Unban functionality with confirmation dialog for safety
        - Automatic query invalidation to keep UI in sync after unbanning
        - Database fields: `isBanned` (boolean), `banReason` (text), `bannedAt` (timestamp)
        - Proper cleanup of ban metadata on unban (sets isBanned=false, banReason='', bannedAt=null)
      - **Conversation Management**: Comprehensive admin control panel for managing all buyer-seller chats and handling payment disputes. Features include:
        - **Conversation IDs**: Each chat assigned unique 6-digit ID (100000-999999 range) for easy reference and search
        - **Search Functionality**: Quick lookup by conversation ID with real-time table filtering
        - **Payment Control**: Manual release and refund buttons for conversations requiring admin intervention
        - **Status Awareness**: Release/Refund buttons only appear for chats with status 'under_review', 'closed_buyer', or 'closed_seller'
        - **Payment Actions**:
          - **Release Payment**: Transfers escrowed funds to seller's wallet, marks chat as 'resolved_seller'
          - **Refund Payment**: Returns escrowed funds to buyer's wallet, marks chat as 'resolved_buyer'
        - **Confirmation Dialogs**: Both actions require explicit admin confirmation showing amount, recipient, and conversation ID
        - **Complete Chat Details**: Table displays conversation ID, buyer/seller (with avatars), product name, amount, status badge, creation date, and available actions
        - **Real-time Updates**: Auto-refreshes every 30 seconds, invalidates cache after payment actions
        - **Authentication**: All endpoints require `x-user-id` header with admin credentials
        - **No Automatic Payments**: Automatic payment processing disabled - all releases/refunds require manual admin approval
      - **Security**: Admin middleware validates `x-user-id` header and `isAdmin` flag on all admin endpoints (returns 403 if not admin)
      - **UI/UX**: Neon/cyberpunk themed dropdown navigation with glass-morphism cards matching platform design
    - **Floating Support Button (FAB)**: Global draggable support button visible on all pages with FAQ chat simulation and Telegram contact. Features include:
      - **Draggable**: Fully draggable with both mouse and touch support for mobile devices
      - **Position Persistence**: Button stays within viewport bounds and maintains position during page navigation
      - **FAQ Chat Simulation**: Instant answers to 6 common Arabic questions without page reload
      - **Telegram Integration**: Direct link to Tiro support account (https://t.me/tiroiq)
      - **Accessibility**: Full ARIA labels, keyboard navigation (ESC to close), focus trapping, and screen reader support
      - **Implementation**: Uses shadcn Dialog component for proper accessibility, portal rendering for z-index management
      - **SSR-Safe**: Position initialization in useEffect to prevent server-side rendering issues
      - **Smart Click Detection**: Distinguishes between drag (>5px movement) and click to prevent accidental opens
      - **Component**: `client/src/components/FloatingSupport.tsx`, added globally in `App.tsx`

## External Dependencies

### Core Libraries
- `@neondatabase/serverless`: PostgreSQL connectivity
- `drizzle-orm`: ORM
- `bcryptjs`: Password hashing
- `express`: Backend web framework
- `react`, `react-dom`: Frontend UI
- `@tanstack/react-query`: Server state management
- `wouter`: Client-side routing

### UI Component Libraries
- `@radix-ui/*`: Accessible component primitives
- `tailwindcss`: CSS framework
- `class-variance-authority`: Component variant management
- `lucide-react`: Icon library

### Form & Validation
- `react-hook-form`: Form management
- `@hookform/resolvers`: Validation integration
- `zod`: Schema validation
- `drizzle-zod`: Zod schema generation

### Development Tools
- `vite`: Frontend build tool
- `typescript`: Type system
- `tsx`: TypeScript execution
- `esbuild`: Backend bundling