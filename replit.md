# Tiro - Digital Services Marketplace

## Overview
Tiro is a digital services marketplace platform designed for the Iraqi market, connecting service buyers with verified sellers for digital products and services. It features a modern neon/cyberpunk aesthetic, drawing inspiration from platforms like Fiverr and Upwork, while establishing a distinct Iraqi digital marketplace identity. The platform aims to be a full-stack web application with a React-based frontend, Express backend, and PostgreSQL for data persistence. The business vision is to capture a significant share of the digital services market in Iraq, offering a reliable and user-friendly platform for local transactions.

## Recent Updates

**Comprehensive UX/UI Improvements - Smooth Transitions & Mobile Optimization**
- Implemented smooth page transition system with fade animations (200ms exit, 300ms enter)
- Fixed PageTransition component using state-based rendering to eliminate flicker
- Enhanced all dialogs with softer, elegant zoom-98 transitions (300ms duration)
- Improved toast notifications with smooth fade and slide animations (300ms)
- Created utility components: ContentSection (consistent sections with reveal), LoadingCardSkeleton (loading states)
- Comprehensive mobile optimizations: 44px minimum tap targets, smooth scrolling, responsive grids
- Removed global animation overrides to preserve infinite animations (skeleton pulse, background gradients)
- Optimized all pages with consistent glass-morphism styling and container patterns
- Responsive breakpoints: grid-cols-1 (mobile), min-[400px]:grid-cols-2, md:grid-cols-2, lg:grid-cols-3, xl:grid-cols-4
- All animations respect prefers-reduced-motion for accessibility
- E2E tested: verified smooth transitions, mobile responsiveness, no performance issues

**Dashboard Professional Neon Stats Cards**
- Redesigned stats cards with professional neon styling matching site theme
- Each card has distinct neon border: purple (280° 85% 65%), cyan (195° 100% 55%), pink (330° 85% 65%)
- Added hover neon glow effect with blur and opacity transition for interactive feedback
- Icon repositioned to top-left with matching gradient background for each card
- Increased value text size to text-5xl for better prominence and readability
- Added bottom accent line with color-matched gradient (fades to transparent)
- Improved spacing and padding (p-8) for more professional appearance
- Cards maintain glass-morphism with stronger borders (2px) for better definition
- E2E tested: verified distinct colors, hover effects, readability, and no console errors

**Soft Animated Neon Gradient Background**
- Updated NeonBackground component with elegant, slow-moving animated gradient (25 seconds)
- Gradient uses 6 soft color stops: blue (240°), violet (280°), turquoise (195°), purple (260°), cyan (180°)
- Added 3 floating orbs with gentle movement (30-40 second cycles) using transform-based animations
- Very subtle opacity levels (0.08-0.15) to maintain excellent text readability
- Added prefers-reduced-motion media query for accessibility - disables animations for users who prefer reduced motion
- Grid pattern overlay made more subtle (0.03 alpha, 60px spacing)
- Performance optimized: uses CSS-only animations with transform and background-position properties
- Maintains proper contrast with glass-morphism cards across all pages
- Applied to Dashboard (control panel) hero section - replaced static hero image with animated gradient
- E2E tested: verified readability and contrast across all pages including dashboard with no performance issues

**Seller Profile Page Feature**
- Created dedicated seller profile page at /seller/:id route (publicly accessible)
- Displays comprehensive seller information: name, avatar, bio, rating, total reviews, verified badge
- Shows count of active published services by the seller
- Grid display of all seller's active products using same card design as services page
- Clickable seller name and avatar on service cards navigates to seller profile
- "Back to Services" (العودة إلى الخدمات) button returns user to main services listing
- Backend endpoint GET /api/sellers/:id returns seller info and all their products in one request
- Proper Wouter routing with /seller/:id path pattern for parameter extraction
- Mobile-responsive layout with neon/cyberpunk theme consistency
- E2E tested: Navigation from services → seller profile → back to services working correctly

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

**Closed Chat Status Display**
- Enhanced ChatDialog to show specific closure status labels in Arabic
- When buyer closes chat: displays "مغلقة – لصالح البائع" (Closed – in favor of the seller)
- When seller closes chat: displays "مغلقة – لصالح المشتري" (Closed – in favor of the buyer)
- Also handles resolved states with appropriate Arabic labels
- Closed notice includes explanatory text: "لا يمكن إرسال رسائل جديدة. جميع الرسائل السابقة محفوظة للسجلات." (Cannot send new messages. All previous messages are saved as records)
- Message input and close buttons completely hidden for closed chats
- All previous messages remain fully readable and visible
- Both buyer and seller see the same closed status with no ability to send messages
- Fixed cache staleness bug by adding `refetchOnMount: 'always'` to ensure fresh chat data when dialog reopens
- E2E tested: buyer closes chat → status updates → both parties see correct closed state with disabled messaging

**Bank Account Number Validation for Withdrawals**
- Added required bank account number field to withdrawal process with comprehensive validation
- Frontend validation: Required field, digits-only (regex /^\d+$/), length 6-34 characters
- Arabic error messages for validation failures: "رقم الحساب مطلوب", "رقم الحساب يجب أن يحتوي على أرقام فقط", "رقم الحساب يجب أن يكون بين 6 و 34 رقم"
- Backend validation: Same rules with clear English error messages for API responses
- Security: Account numbers masked before storage (only last 4 digits visible, e.g., "1234567890123456" → "************3456")
- accountNumber field added to transactions schema (varchar, length 50, nullable for backward compatibility)
- Withdraw button disabled until valid account number provided
- Real-time validation feedback on blur and during typing if error exists
- E2E tested: Frontend validation, backend validation, account masking, full withdrawal flow

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