# Tiro - Digital Services Marketplace

## Overview
Tiro is a digital services marketplace platform designed for the Iraqi market, connecting service buyers with verified sellers for digital products and services. It features a modern neon/cyberpunk aesthetic, drawing inspiration from platforms like Fiverr and Upwork, while establishing a distinct Iraqi digital marketplace identity. The platform aims to be a full-stack web application with a React-based frontend, Express backend, and PostgreSQL for data persistence. The business vision is to capture a significant share of the digital services market in Iraq, offering a reliable and user-friendly platform for local transactions.

## Recent Updates

**My Chats Page - Permanent Chat Records System**
- Created dedicated "My Chats" (محادثاتي) page at /my-chats route displaying all user conversations
- Page automatically shows chats for both buyers and sellers (fetches where user is either party)
- All chats (active and closed) remain permanently visible as dispute resolution records
- Chats created automatically upon product purchase with 72-hour expiration window
- Closing a chat only changes status (closed_seller, closed_buyer) - never deletes the record
- Status badges: Active (green), Under Review (yellow), Closed in favor of Seller (blue), Closed in favor of Buyer (purple), Resolved (cyan/pink)
- Auto-refreshes every 5 seconds to show real-time updates
- Mobile-responsive card layout with neon/cyberpunk theme
- Clicking any chat card opens ChatDialog for review and messaging
- Navigation links in both desktop navbar and mobile menu

**Product Credential Encryption and Purchase Details System**
- Implemented AES-256-GCM encryption for all product credentials (username, password, email, email password)
- Created server/crypto.ts module with secure encrypt/decrypt functions using Node.js crypto
- Credentials encrypted before storage in database, decrypted only when buyer completes purchase
- Backend API: POST creates products with encrypted credentials, PATCH preserves existing credentials during partial updates, POST purchase decrypts and returns credentials to buyer only
- Enhanced Product Details Dialog displays complete product information and decrypted credentials after purchase
- Glassmorphism design with conditional rendering (only shows credential fields with values), warning icon, and secure presentation
- Environment variable ENCRYPTION_KEY (SHA-256 hashed) for production deployment security
- E2E tested: product creation → encryption → purchase → decryption → display flow working correctly

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React and TypeScript, using Vite for fast development and a Single Page Application (SPA) architecture with Wouter for routing. UI components are built using `shadcn/ui` (New York style variant) and Radix UI primitives, styled with Tailwind CSS to achieve a custom neon/cyberpunk design system with dark mode as default. State management relies on TanStack Query for server state, React Context API for authentication and theme, and React hooks for local component state. The design system incorporates a neon color palette (electric purple, cyan, neon pink) on dark backgrounds, with typography featuring Inter, Orbitron/Exo 2, and Tajawal for Arabic. Visual effects include glassmorphism and neon glows.

### Backend Architecture
The backend uses Express.js for HTTP services and RESTful API routing. It includes custom middleware for logging and error handling. Authentication currently uses bcrypt.js for password hashing, with user credentials stored securely; session-based authentication is planned.

### Data Storage Solutions
The platform utilizes Neon serverless PostgreSQL with Drizzle ORM for type-safe queries and migrations. The database schema includes tables for `Users`, `Products`, `Reviews`, `Promotions`, and `Transactions`, with defined one-to-many relationships. Key design decisions include using decimal precision for monetary values, separate fields for financial tracking (`balance`, `totalEarnings`), boolean flags for active statuses, UUID primary keys, and timestamp tracking for temporal data.

### System Design Choices
- **UI/UX**: Responsive design across various devices (mobile-first approach for services and product listings), full Arabic localization, and a "cute avatar" system using DiceBear API for user profiles. Public accessibility for browsing services without authentication.
- **Feature Specifications**:
    - **Fee System**: 10% fee on all deposits and withdrawals with clear UI breakdown.
    - **Service Categories**: Support for diverse digital services, including Instagram and TikTok account sales (with credential delivery).
    - **Navigation**: Responsive navigation system with a horizontal navbar for desktop and a slide-in drawer for mobile, supporting RTL.
    - **Authentication**: Public and protected routes, with integrated login/signup dialogs on the dashboard.
    - **Chat System**: Buyer-seller chat created automatically on purchase, 72-hour active window, permanent record keeping (never deleted), status-based lifecycle (active → closed/resolved), escrow payment integration with 10-hour delay for buyer closures.

## External Dependencies

### Core Libraries
- `@neondatabase/serverless`: PostgreSQL connectivity
- `drizzle-orm`: ORM for database interactions
- `bcryptjs`: Password hashing
- `express`: Backend web framework
- `react`, `react-dom`: Frontend UI library
- `@tanstack/react-query`: Server state management
- `wouter`: Lightweight client-side routing

### UI Component Libraries
- `@radix-ui/*`: Accessible component primitives
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority`: Component variant management
- `lucide-react`: Icon library

### Form & Validation
- `react-hook-form`: Form management
- `@hookform/resolvers`: Integration with validation libraries
- `zod`: Schema validation
- `drizzle-zod`: Zod schema generation from Drizzle schemas

### Development Tools
- `vite`: Frontend build tool
- `typescript`: Type system
- `tsx`: TypeScript execution for development
- `esbuild`: Backend bundling