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
    - **Chat System**: Automatic buyer-seller chat on purchase with a 72-hour active window, permanent record-keeping for dispute resolution (never deleted), status-based lifecycle (active → closed/resolved), and escrow payment integration with a 10-hour delay for buyer closures.
    - **Discount Pricing**: Supports optional `oldPrice` for displaying discounted services with visual cues (strikethrough, prominent new price).
    - **Withdrawal Validation**: Bank account number validation (digits-only, length 6-34) with masking for security.
    - **Seller Profile Page**: Dedicated public page displaying seller information and their active products.
    - **Dashboard**: Professional neon-styled stats cards with distinct color schemes and hover effects. Statistics are fully automatic and calculated from real database data:
      - **Verified Sellers**: Auto-counts users with `isVerified = true`
      - **Total Sales**: Auto-calculates sum of all completed sale transactions
      - **Active Services**: Auto-counts products with `isActive = true`
      - Real-time updates: Stats auto-refresh every 30 seconds and invalidate on relevant actions (purchases, product changes)
    - **Background**: Soft animated neon gradient background with subtle floating orbs, optimized for performance and accessibility (respects `prefers-reduced-motion`).
    - **Default Category Images**: Automatic assignment of representative stock images for each service category when sellers create new products. Covers 8 categories (Instagram, Design, Programming, Writing, Marketing, Music & Audio, TikTok, Video & Animation) with professional stock imagery. Auto-assignment only applies to new services, not edits, preserving existing custom images.

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