# BrickSetu — Design System & Production UI Fix Plan

Based on audit of the Workers & Wages screen. Goal: replace ad hoc styling with a real token system so every screen inherits consistent color, spacing, elevation, and type — and make the whole app responsive down to mobile.

---

## 1. Issues Found in the Current Screen

| # | Issue | Where |
|---|---|---|
| 1 | Stray unstyled black bar spanning the full top edge, no visible purpose | Very top of viewport |
| 2 | No color beyond black/white/gray anywhere — no brand color, no semantic colors for status | Whole screen |
| 3 | Zero elevation system — table, cards, and inputs are flush with the page, nothing signals "this is a distinct surface" | Table container, search bar, page header |
| 4 | Borders present but too low-contrast to actually separate sections | Table container, search input, sidebar/content boundary |
| 5 | "MAIN KILN" sits as bare gray text with no component treatment, despite clearly being a facility switcher | Top bar, left of user pill |
| 6 | User pill and "ADMIN" tag are two different visual treatments bolted together (pill + plain badge) | Top bar |
| 7 | Two primary-looking action buttons ("Weekly Settlement," "Register Worker") compete for attention with no clear visual hierarchy between them | Page header |
| 8 | Tab active-state indicator is a thin line with tight spacing above/below — weak affordance | Worker Roster / Weekly Settlements tabs |
| 9 | Table header row and body rows have almost no contrast between them; no row hover state visible; numeric columns are left-aligned instead of right-aligned/tabular | Data table |
| 10 | Worker code ("WRK-001") styled identically to secondary/muted text elsewhere — no consistent "metadata" treatment | Table, worker name cell |
| 11 | Sidebar active state is a flat black fill — brand color never actually appears in the interface | Sidebar nav |
| 12 | Unclear circular "N" avatar in sidebar footer next to version text — looks like leftover scaffolding, not a designed element | Sidebar footer |
| 13 | Pagination prev/next buttons have no clear disabled vs. enabled distinction | Table footer |
| 14 | No responsive behavior defined at all — sidebar, table, and header will all break under ~1024px as built | Whole layout |

---

## 2. Design System Proposal

### Grounding

BrickSetu runs a brick kiln's daily operations — workers, kilns, fired clay, a financial ledger. The system should read like a well-kept operations register, not a generic SaaS dashboard. That's the design brief in one sentence, and it drives every choice below.

### Color — 5 named values, light mode

| Name | Hex | Use |
|---|---|---|
| Kiln Ember | `#B8441E` | Brand/primary accent — primary buttons, active nav state, focus rings, links |
| Char | `#211C19` | Primary text, dark-mode base — warm near-black, not flat digital black |
| Ash | `#6B655F` | Secondary/muted text |
| Fog | `#F6F7F6` | App background — cool, quiet neutral (not warm cream) so the ember accent stays the one warm note in the interface |
| Hairline | `#E3E2DE` | Borders, dividers |

Deliberately **not** the warm-cream-background-plus-terracotta combination that's become the default "AI dashboard" look — the base here is cool and quiet, and warmth is spent in exactly one place (the ember accent), so it always reads as "this is the actionable thing" rather than decoration.

### Semantic colors

| Name | Hex | Use |
|---|---|---|
| Success | `#4C7A3D` | Healthy stock, approved/settled states |
| Warning | `#B8860B` | Low stock, pending approval |
| Destructive | `#C13B3B` | Errors, void/delete actions — kept visually distinct from Kiln Ember so "danger" and "brand" are never confused |
| Info | `#3B6FA0` | Neutral informational badges |

### Typography

- **UI typeface (single family, all roles):** IBM Plex Sans — legible, has a technical/industrial character appropriate to an operations tool, avoids the default-Inter look.
- **Numeric/tabular data:** IBM Plex Mono, tabular figures, for every rate, quantity, and currency column. This is a content-driven choice, not decoration — it makes columns of numbers actually scan like a ledger, with decimal points aligned.
- Load both via `next/font/google` in `app/layout.tsx` to avoid layout shift.

### Layout principle

Keep the current sidebar + top bar + content structure — it's the right shape for an ops tool. What's missing is restraint and hierarchy: hairline borders and consistent spacing should carry most of the structure; shadow is reserved for things that actually float above the page (dropdown menus, modals, a sticky header on scroll) — not applied uniformly to every static card, which is the generic "SaaS card kit" look.

### Principles

1. **Warm signal, cool field** — the interface is cool and quiet by default; Kiln Ember is the one warm, saturated element, reserved for primary actions and active state.
2. **Numbers behave like ledger entries** — tabular figures, right-aligned, monospaced for anything financial or countable.
3. **Structure over decoration** — hairline borders and spacing carry hierarchy; shadow means "elevated," nothing else.

---

## 3. Concrete Tokens (`app/globals.css`)

```css
:root {
  --background: #F6F7F6;
  --foreground: #211C19;
  --card: #FFFFFF;
  --card-foreground: #211C19;
  --muted: #EFEFED;
  --muted-foreground: #6B655F;
  --border: #E3E2DE;
  --primary: #B8441E;
  --primary-foreground: #FFFFFF;
  --success: #4C7A3D;
  --warning: #B8860B;
  --destructive: #C13B3B;
  --info: #3B6FA0;

  --radius-sm: 6px;   /* inputs, buttons */
  --radius-md: 10px;  /* cards, table container */
  --radius-lg: 14px;  /* modals, dialogs */

  --shadow-xs: 0 1px 2px rgba(33, 28, 25, 0.06);              /* row hover lift */
  --shadow-sm: 0 4px 12px rgba(33, 28, 25, 0.08);             /* dropdown menus */
  --shadow-md: 0 12px 32px rgba(33, 28, 25, 0.14);            /* modals/dialogs */

  --font-sans: "IBM Plex Sans", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
}

.dark {
  --background: #17140F;
  --foreground: #F3F1EC;
  --card: #1F1B16;
  --card-foreground: #F3F1EC;
  --muted: #262119;
  --muted-foreground: #A69C8F;
  --border: #33302B;
  --primary: #D2622E;   /* brightened for contrast on dark background */
  --primary-foreground: #17140F;
  --success: #6FA75B;
  --warning: #D1A237;
  --destructive: #DB5F5F;
  --info: #6C9CC9;
}
```

**Elevation rule, stated once:** static containers (table, cards, sidebar) get a `border` only. Shadow is reserved for anything that visually floats above the page content — popovers, dropdowns, modals, a sticky header — plus a subtle `--shadow-xs` lift on interactive table rows on hover. Nothing gets shadow just for being a "card."

---

## 4. Component-Level Fixes

### Top bar
- Remove the unstyled black bar at the top edge, or replace it with a deliberate 3px Kiln Ember accent line — a decision, not an accident.
- Turn "MAIN KILN" into an actual facility-switcher component: icon + sentence case ("Main Kiln") + chevron, bordered pill, opens a dropdown if multiple facilities exist.
- User pill: avatar circle with initials, name, and the "ADMIN" tag as a proper `Badge` component (bordered, muted background) — one visual unit, not two treatments stitched together.
- Normalize theme toggle and Logout to the same ghost-button treatment: 36–40px height, 16–18px icons, consistent border.

### Page header & actions
- Give "Register Worker" the primary (Kiln Ember fill) treatment and "Weekly Settlement" the secondary/outline treatment — one clear primary action, not two buttons of equal visual weight.
- Align the header icon to the title's cap-height; fixed icon container size (20px icon, 8px gap to text).

### Tabs
- Thicker active indicator (2px) in Kiln Ember, not black.
- More padding above/below the tab row before content starts.

### Data table
- Add `border` + `--shadow-xs` to the table container so it reads as a distinct surface from the page background.
- Header row background: `--muted`, clearly distinct from body rows.
- Row hover state: subtle `--muted` background tint (signals the row is interactive via "Details").
- Right-align and use `--font-mono` with tabular figures for Current Rate, Total Bricks, and Pending Due.
- Worker code (`WRK-001`) styled consistently as metadata: `--muted-foreground`, smaller size, same treatment used for any other secondary identifier in the app.
- Pagination prev/next: bordered ghost buttons; disabled state visibly dimmed (reduced opacity + `cursor-not-allowed`), not just implied by color.

### Sidebar
- Active nav item: Kiln Ember background (or an ember-tinted dark fill) instead of flat black — this is where the brand color should actually be visible.
- Inactive items: hover state with a subtle `--muted` tint.
- Consistent icon size (18–20px) and 8px vertical rhythm between items.
- Footer: resolve or remove the circular "N" avatar — if it's meant to indicate environment (e.g., a build/version marker), design it as that explicitly; otherwise drop it.

---

## 5. Responsive Plan

| Breakpoint | Sidebar | Top bar | Page actions | Table |
|---|---|---|---|---|
| Desktop (≥1024px) | Persistent, 240–260px | Full: facility switcher, user pill, theme toggle, logout label | Two buttons, one row | Full table |
| Tablet (640–1024px) | Collapses to 64px icon rail with tooltips, or toggle-controlled overlay | Same, condensed spacing | Same | Full table, horizontal scroll if needed |
| Mobile (<640px) | Hidden; hamburger-triggered off-canvas drawer with backdrop | User pill collapses to avatar only; logout moves into a menu | Stack title above buttons; consider a single primary "+" action with an overflow menu for the secondary one | Card-list fallback — name/code, rate, pending due per card, "Details" button, per the earlier UI plan |

Additional mobile rules:
- Search + Export row stacks vertically (search full width, export as icon-only button below).
- Tabs scroll horizontally with a fade edge rather than wrapping.
- Pagination controls keep a minimum 44px touch target.

---

## 6. Global Consistency Rules

- **Icons:** `lucide-react` only, fixed stroke-width `1.75`, sizes limited to 16/18/20px — no mixing icon sets or arbitrary sizes.
- **Focus states:** every interactive element gets a visible 2px Kiln Ember focus ring with 2px offset — required for keyboard navigation, not optional polish.
- **Hover states:** every clickable row, button, and nav item has a defined hover state — none currently do.
- **Loading states:** section-level skeletons (already planned) must use the same `--muted` tone and `--radius-sm`/`--radius-md` as their real content, so the loading state doesn't visually jump on load.
- **Empty states:** heading + one-line description + CTA, per the earlier UI plan — applies to Weekly Settlements (0) and any other zero-state tab.

---

## 7. Implementation Order

1. `app/globals.css` — land the full token set (light + dark) from Section 3.
2. `tailwind.config` — wire radius/shadow/font tokens so components can reference them directly.
3. `app/layout.tsx` — load IBM Plex Sans + IBM Plex Mono via `next/font/google`.
4. `components/ui/button.tsx`, `badge.tsx`, `input.tsx`, `tabs.tsx` — apply the new tokens as the shadcn base, so every feature inherits the fix automatically instead of being patched per-page.
5. `components/ui/data-table/*` — shared table component: header/row/hover treatment, numeric column alignment, pagination button states. Fix once here, not per feature table.
6. `components/layout/Sidebar.tsx`, `Header.tsx`, `MobileNav.tsx` — apply active-state accent color, responsive collapse behavior, facility switcher, user pill.
7. Sweep remaining feature pages to confirm they consume the shared `Button`/`Badge`/data-table components rather than one-off styles.

---

## 8. Verification Checklist

- Screenshot review at 1440px / 768px / 375px, in both light and dark mode.
- Contrast check: Kiln Ember on white/Fog background and on dark Char background both meet WCAG AA (4.5:1) for text use.
- Keyboard-only pass: full tab order, visible focus on every interactive element, Esc closes any drawer/menu.
- Test the table and sidebar with a realistic dataset (50+ workers), not just the single-row case shown here — confirms density, pagination, and scroll behavior actually hold up.
- `prefers-reduced-motion` respected for any transition (drawer open/close, hover states).
