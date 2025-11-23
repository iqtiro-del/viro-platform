# Viro (فيرو) - Digital Services Marketplace

## Overview
Viro (فيرو) is an Arabic-only digital services marketplace designed for the Iraqi market. It connects service buyers with verified sellers of digital products and services, drawing inspiration from platforms like Fiverr and Upwork. The platform aims to establish a unique Iraqi digital marketplace identity with a modern neon/cyberpunk aesthetic. It's a full-stack web application with a React frontend, Express backend, and PostgreSQL database, aiming to capture a significant share of the Iraqi digital services market.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a responsive, mobile-first, Arabic-only (RTL) interface with a neon/cyberpunk dark-mode design. It utilizes `shadcn/ui` (New York style variant), Radix UI primitives, and Tailwind CSS. The design incorporates a neon color palette, specific typography (Inter, Orbitron/Exo 2, Tajawal), glassmorphism, and neon glows. The platform name "فيرو" is consistently displayed in Arabic. A "cute avatar" system is implemented using the DiceBear API.

### Technical Implementations
- **Frontend**: React SPA with TypeScript, Vite, and Wouter for routing. State management uses TanStack Query for server state and React Context for authentication/theme.
- **Backend**: Express.js with RESTful API routing, custom middleware for logging and error handling. Authentication currently uses bcrypt.js for password hashing.
- **Database**: Neon serverless PostgreSQL with Drizzle ORM. The schema includes `Users`, `Products`, `Reviews`, `Promotions`, and `Transactions` tables, with UUID primary keys and timestamp tracking. Product credentials are encrypted using AES-256-GCM.

### Feature Specifications
- **Fee System**: A 10% fee applies to all deposits and withdrawals.
- **Service Categories**: Supports diverse digital services, including secure credential delivery for account sales.
- **Navigation**: Responsive desktop navbar and mobile slide-in drawer, supporting RTL.
- **Authentication**: Public and protected routes with integrated login/signup dialogs.
- **Chat System**: Automatic buyer-seller chat on purchase with a 72-hour active window, permanent record-keeping for dispute resolution, status-based lifecycle, and escrow payment integration with a 10-hour delay for buyer closures. Pinned credentials are automatically delivered to buyers within the chat. A background scheduler closes expired chats.
- **Discount Pricing**: Supports optional `oldPrice` for discounted services.
- **Withdrawal Validation**: Bank account number validation (digits-only, length 6-34) with masking.
- **Deposit Screenshot Upload**: Users upload transfer receipt screenshots for deposit verification. These are sent to a dedicated Telegram bot for admin review, not stored on the server.
- **Seller Profile Page**: Dedicated public page for seller information and products.
- **Dashboard**: Neon-styled stats cards with real-time, auto-refreshing statistics (Verified Sellers, Total Sales, Active Services).
- **Background**: Soft animated neon gradient background with subtle floating orbs.
- **Default Category Images**: Automatic assignment of stock images for new service categories.
- **Admin Dashboard**: Protected interface at `/admin` for platform management, including:
    - User Management (activate/deactivate, verify, view balances)
    - Service Management (view, delete)
    - Verification Requests (approve/reject)
    - Transaction Management (view, filter, approve/reject deposits and withdrawals with balance handling)
    - Banned Users Management (view, unban)
    - Conversation Management (search, manual payment release/refund for disputes, all actions require admin confirmation).
    - Dedicated admin login and `isAdmin` flag for access control.
- **Floating Support Button (FAB)**: Global draggable button with FAQ chat simulation and Telegram contact, accessible on all pages.

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