# Design Guidelines: Car Rental Management System

## Design Approach

**Selected Approach:** Design System (Utility-Focused)
**Inspiration:** Linear, Notion, Stripe Dashboard - Modern SaaS productivity applications
**Rationale:** This is a data-intensive business operations tool where efficiency, clarity, and learnability are paramount. Clean, professional aesthetics with high information density.

**Core Design Principles:**
- Functional Clarity: Every element serves a purpose
- Information Hierarchy: Clear visual prioritization of data
- Workflow Efficiency: Minimal clicks, intuitive navigation
- Professional Polish: Clean, modern business aesthetic

## Typography

**Font Stack:**
- Primary: Inter (Google Fonts) - Clean, highly legible for data-heavy interfaces
- Monospace: JetBrains Mono - For number plates, IDs, technical data

**Type Scale:**
- Page Titles: text-3xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card/Widget Titles: text-lg font-semibold (18px)
- Body Text: text-base (16px)
- Table Headers: text-sm font-medium uppercase tracking-wide (14px)
- Labels/Captions: text-sm text-gray-600 (14px)
- Data Values: text-base font-medium (16px, emphasized)

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing (within components): p-2, gap-2, space-x-2
- Standard spacing (between elements): p-4, gap-4, mb-4
- Section spacing: p-6, py-8, gap-8
- Large spacing (between major sections): p-12, py-16

**Grid System:**
- Dashboard widgets: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Data tables: Full-width with horizontal scroll on mobile
- Forms: max-w-2xl for single column, grid-cols-2 for multi-column
- Sidebar navigation: Fixed w-64, collapsible on mobile

## Component Library

### Navigation
**Top Bar:**
- Fixed header with logo left, user menu right
- Breadcrumb navigation below for context
- Height: h-16
- Search bar (global) centered on desktop

**Sidebar:**
- Fixed left sidebar (w-64) with collapsible menu
- Group navigation by module: Dashboard, Vehicles, Clients, Rentals, Staff
- Active state: subtle background + border-l-4 accent
- Icons: Heroicons outline for inactive, solid for active

### Data Tables
**Style:** Clean, scannable, professional
- Striped rows (subtle alternating background)
- Sticky header on scroll
- Row hover state with subtle background
- Compact padding: py-3 px-4
- Status badges: Rounded pills with subtle backgrounds
- Action buttons: Right-aligned, icon-only with tooltips
- Pagination: Bottom-right with page numbers + arrows
- Empty states: Centered with illustration suggestion and "Add New" CTA

### Forms & Wizards
**Wizard Pattern:**
- Horizontal step indicator at top (numbered circles with connecting lines)
- Active step emphasized, completed steps with checkmark
- Form content in centered container (max-w-2xl)
- Actions footer: "Back" (left), "Next"/"Submit" (right)

**Form Fields:**
- Label above input: text-sm font-medium mb-2
- Input fields: rounded-lg border with focus ring
- Helper text below: text-xs text-gray-500
- Required indicator: red asterisk after label
- Error state: red border + error message below
- File upload: Drag-and-drop zone with dashed border, preview thumbnails

### Cards & Widgets
**Dashboard Widgets:**
- Rounded-lg border with subtle shadow
- Header with title + optional action link
- Padding: p-6
- Metric display: Large number (text-3xl font-bold) + label below
- Trend indicators: Small arrows with percentage change

**Detail Pages:**
- Tabbed navigation (horizontal tabs below page title)
- Active tab: border-b-2 accent + font-semibold
- Tab content padding: py-8

### Buttons & Actions
**Primary Button:** Solid background, medium font-weight, rounded-lg, px-6 py-2.5
**Secondary Button:** Border with transparent background, same sizing
**Icon Button:** Square aspect ratio, p-2, rounded-md
**Split Button:** Primary action + dropdown menu
**Floating Action Button:** Fixed bottom-right for quick "Add New" actions (mobile)

### Status Indicators
**Badge Styles:**
- Available/Active: Green background
- Rented/In Use: Blue background  
- Maintenance: Yellow background
- Cancelled: Red background
- Completed: Gray background
- Rounded-full, px-3 py-1, text-xs font-medium

### Modals & Overlays
- Centered modal with backdrop blur
- Max width: max-w-2xl for forms, max-w-4xl for data views
- Header with title + close button
- Content padding: p-6
- Footer with action buttons (right-aligned)

## Module-Specific Guidelines

### Dashboard
- 4-column grid on desktop (total vehicles, active rentals, upcoming rentals, maintenance due)
- Large metric numbers with trend indicators
- Quick action cards below metrics
- Recent activity table showing last 10 rentals/updates
- No hero image - functional dashboard priority

### Vehicle/Client Management
- Split view: Filterable list (left/top) + detail panel (right/bottom) on desktop
- List items show thumbnail + key data points
- Filters in collapsible sidebar or top bar
- Quick actions visible on row hover

### Rental Booking Wizard
- 3-step process with clear visual progression
- Step 1: Vehicle selector with availability calendar
- Step 2: Client search/select with inline "Add New Client" option  
- Step 3: Summary card showing all details + calculated pricing (prominently displayed)
- Sticky footer with total cost + confirmation button

### Authentication Pages
- Centered card layout (max-w-md)
- Minimal branding (logo at top)
- Clean form with clear CTAs
- No distracting imagery - focus on form completion

## Images
**Usage:** Minimal - this is a data-focused application
- Vehicle thumbnails in lists/cards (square aspect ratio, rounded corners)
- Client document previews (driver's license, passport) - thumbnail with click to enlarge
- No hero images on any pages
- Empty state illustrations: Simple line drawings suggesting action (e.g., "No vehicles yet - add your first one")
- User avatars: Circular, initials fallback

**Performance Note:** Use lazy loading for vehicle images in long lists