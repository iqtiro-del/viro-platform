# Tiro Platform Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from modern service marketplaces (Fiverr, Upwork) combined with contemporary neon/cyberpunk aesthetics for a distinctive Iraqi digital marketplace identity. The design balances futuristic visual appeal with marketplace functionality.

## Core Design Principles
- **Neon Comfort**: Subtle animated neon accents that enhance rather than overwhelm
- **Trust & Credibility**: Clear visual hierarchy emphasizing verified sellers and ratings
- **Iraqi Market Focus**: Design that resonates with local users while maintaining global standards
- **Marketplace Efficiency**: Quick access to services, clear CTAs, seamless transactions

---

## Color Palette

### Dark Mode Primary (Default)
- **Background Base**: 220 25% 8% (deep navy-black)
- **Background Elevated**: 220 20% 12% (cards/panels)
- **Background Hover**: 220 18% 16%

### Neon Accent Colors
- **Primary Neon**: 280 85% 65% (electric purple - main brand)
- **Secondary Neon**: 195 100% 55% (cyan - interactive elements)
- **Accent Warm**: 340 90% 60% (neon pink - promotions/highlights)
- **Success Glow**: 160 85% 55% (mint green - verified badges)

### Text Colors
- **Primary Text**: 220 15% 95%
- **Secondary Text**: 220 12% 70%
- **Muted Text**: 220 10% 50%

### Functional Colors
- **Warning**: 45 95% 60% (golden yellow)
- **Error**: 0 85% 60% (neon red)
- **Success**: 160 75% 55% (mint)

---

## Typography

### Font Stack
**Primary**: 'Inter', 'Tajawal' (for Arabic), sans-serif
**Accent**: 'Orbitron' or 'Exo 2' (for neon headings/brand)

### Scale
- **Hero/H1**: 3.5rem (56px) / Bold / letter-spacing: -0.02em
- **H2**: 2.5rem (40px) / SemiBold
- **H3**: 1.875rem (30px) / SemiBold  
- **H4**: 1.5rem (24px) / Medium
- **Body Large**: 1.125rem (18px) / Regular
- **Body**: 1rem (16px) / Regular
- **Small**: 0.875rem (14px) / Regular
- **Micro**: 0.75rem (12px) / Medium

---

## Layout System

### Spacing Primitives
Primary units: **4, 8, 12, 16, 24, 32** (tailwind: p-1, p-2, p-3, p-4, p-6, p-8)
Generous spacing for breathing room and neon glow effects

### Grid System
- **Desktop**: 12-column grid, max-w-7xl container
- **Tablet**: 8-column grid
- **Mobile**: 4-column grid, full-bleed for cards

### Container Widths
- Full sections: max-w-7xl (1280px)
- Content sections: max-w-6xl
- Cards/Forms: max-w-2xl

---

## Component Library

### Navigation
- **Top Nav**: Glass-morphism effect with subtle neon underline on active
- Platform logo "Tiro" with neon glow effect (text-shadow)
- Sticky header with backdrop blur
- Mobile: Bottom navigation bar with neon active indicators

### Hero Section (Dashboard/Home)
- **Large Hero Image**: Yes - featuring digital services/technology theme with neon overlay gradient
- Animated particles or grid pattern in background (subtle movement)
- Neon-outlined search bar prominent in hero
- CTA buttons with neon glow on hover
- Quick access cards with glass-morphism and neon borders

### Service/Product Cards
- **Layout**: Grid (3 cols desktop, 2 tablet, 1 mobile)
- Glass-morphism card with neon border (changes color on hover)
- Seller avatar with verified badge (green neon glow)
- 5-star rating system with neon star fill
- Price badge with subtle neon background
- Hover: Lift effect + intensified neon border glow

### Wallet Section
- **Balance Display**: Large numbers with neon cyan glow
- Profit trend: Animated arrows (up/down) with neon trail effect
- Transaction cards with status-based neon accents
- CTA buttons for deposit/withdraw with distinct neon outlines

### Promotion Cards
- Tiered promotion options displayed as cards
- Each tier with different neon color intensity (Top 3 = brightest)
- Price tags with pulsing neon glow animation
- Icon indicators with neon outline

### Forms & Inputs
- Glass-morphism input fields with neon focus border
- Floating labels with smooth animation
- Error states: Red neon glow
- Success states: Green neon checkmark

### Buttons
**Primary**: Solid with neon gradient background, white text
**Secondary**: Neon outline with transparent fill, hover fills with neon color
**Ghost**: No border, neon text, hover adds subtle glow

### Rating System
- 5-star display with partial fill capability
- Verified seller badge: Checkmark with green neon glow
- Review cards with subtle neon accent on left border

### Modals & Overlays
- Dark overlay with strong blur (backdrop-blur-xl)
- Modal content with glass-morphism and neon border
- Close button with red neon hover state

---

## Animations

### Neon Glow Effects
```
Subtle pulse on active elements (1.5s ease-in-out infinite)
Border glow intensity on hover (0.3s ease)
Text shadow spread for headings (ambient glow)
```

### Background Animation
- Slow-moving gradient mesh or particle grid
- Speed: 20-30 second cycle
- Opacity: 0.15-0.25 (very subtle, eye-comfortable)
- Colors: Purple to cyan gradient shift

### Micro-interactions
- Card lift on hover: translateY(-4px) + shadow increase
- Button press: Scale(0.98) + glow intensify
- Star rating fill: Smooth sequential animation
- Loading states: Neon pulse rings

---

## Accessibility & RTL

### Contrast Requirements
- All neon colors tested against dark backgrounds (minimum 4.5:1)
- Text never directly on bright neon (use dark overlays)

### RTL Support (Arabic)
- Automatic layout flip for Arabic interface
- Font family switches to 'Tajawal' for Arabic content
- Icon mirroring where directionally relevant

### Reduced Motion
- Respect prefers-reduced-motion
- Static neon borders instead of pulses
- Instant transitions instead of animations

---

## Images Strategy

### Hero Section
**Large hero image required**: YES
- Technology/digital services themed imagery
- Apply neon gradient overlay (purple to cyan, 40% opacity)
- Subtle grain texture for depth

### Product/Service Thumbnails
- Consistent aspect ratio (16:9 or 1:1)
- Neon border frames
- Fallback: Gradient background with service icon

### User Avatars
- Circular with neon ring border
- Verified users: Animated green neon ring
- Placeholder: Gradient with initials

### Background Patterns
- Subtle grid or dots pattern with neon lines
- Low opacity (10-15%) for comfort
- Optional: Animated scan-line effect (very subtle)

---

## Page-Specific Layouts

### Home/Dashboard
- Hero with large background image + neon overlay
- Quick stats cards (3-4 across) with glass effect
- Featured services grid
- Trending sellers carousel

### Services/Products Page
- Prominent search bar with neon focus state
- Filter sidebar (desktop) or drawer (mobile)
- Product grid with infinite scroll
- Floating "Filter" button with neon indicator

### Wallet Page
- Balance hero card (full-width, glass + neon)
- Transaction history list with alternating subtle backgrounds
- Action buttons grouped, neon-outlined

### Profile Page
- Cover area with neon gradient
- Avatar with neon ring (editable indicator)
- Info cards with clean separation
- Edit mode: Neon borders on active fields

---

## Visual Hierarchy

1. **Primary Focus**: Neon glow draws attention to CTAs and active elements
2. **Secondary**: Glass-morphism cards contain grouped information
3. **Tertiary**: Subtle text and icons provide supporting details
4. **Background**: Animated neon patterns stay comfortable and non-distracting

---

**Final Note**: The neon aesthetic should feel modern and energetic without causing eye strain. All animations run at 60fps, glow effects use CSS filters (brightness, blur) sparingly, and the dark base ensures comfortable extended use while maintaining the distinctive Tiro brand identity in the Iraqi market.