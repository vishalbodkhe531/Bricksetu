# BrickSetu UI & Design System Guidelines

## Core Principles
1. **Clean, Minimal & Professional**: Designed for clear operational use in village-level brick kiln management.
2. **High Accessibility & Readability**: Crisp contrast ratios, large readable inputs, legible tables.
3. **No Fluff**: No decorative glowing animations, gradients, or excessive colors.
4. **Full Dark Mode Support**: Complete support for Light Mode and Dark Mode using CSS design tokens.

## Color Tokens & Theme Standards
Always use semantic Tailwind design tokens rather than hardcoded hex colors or direct slate/gray classes:

- **Page Background**: `bg-background`
- **Card Background**: `bg-card`
- **Text Primary**: `text-foreground`
- **Text Secondary / Muted**: `text-muted-foreground`
- **Borders**: `border-border`
- **Primary Actions**: `bg-primary text-primary-foreground hover:bg-primary/90`
- **Secondary Actions**: `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- **Destructive Actions**: `bg-destructive text-destructive-foreground hover:bg-destructive/90`
- **Badges & Statuses**:
  - `SUCCESS`: `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20`
  - `WARNING`: `bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20`
  - `INFO`: `bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20`
  - `MUTED`: `bg-muted text-muted-foreground border-border`

## Responsive Behavior
- **Mobile (< 768px)**:
  - Sidebar collapses into a slide-over sheet drawer.
  - Page header title stacks above action buttons.
  - Action buttons take full width or easily tap-able touch targets.
  - Tables wrap gracefully inside overflow containers or convert to mobile card stacks.
- **Desktop (>= 1024px)**:
  - Fixed or collapsible side navigation menu.
  - Multi-column grid layouts for summary cards (e.g., 4-column metric grid).

## Component Guidelines
- **Page Header**: Includes title, subtitle, and primary call-to-action buttons.
- **Tables**: Clean border dividers, styled headers, hover rows, and empty state support.
- **Forms**: Form controls use floating labels or clear top labels with validation error hints below.
- **Dialogs & Modals**: Centered overlays with explicit close triggers and action buttons at bottom-right.
